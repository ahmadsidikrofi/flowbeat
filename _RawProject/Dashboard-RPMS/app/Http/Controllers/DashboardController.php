<?php

namespace App\Http\Controllers;

use App\Services\MobileApiService;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct(protected MobileApiService $api) {}

    /**
     * Tampilkan halaman utama dashboard dengan data real dari mobile API.
     *
     * Strategi:
     *  - Ambil semua profile milik user yang sedang login (id_user = Auth user id)
     *  - Untuk setiap profile, ambil pengukuran terbaru
     *  - Hitung statistik agregat (avg BPM, avg SpO2 → gunakan sys sebagai proxy)
     *  - Pisahkan alert berdasarkan kondisi vital
     */
    public function index()
    {
        $doctorId = Auth::id();
        $assignedProfiles = \App\Models\DoctorProfile::where('doctor_id', $doctorId)
                                                     ->get()
                                                     ->toArray();

        $patients = $this->api->getAssignedPatientsWithLatestVitals($assignedProfiles);

        // ── Hitung statistik ──────────────────────────────────────────────────
        $totalPatients  = count($patients);
        $activeAlerts   = 0;
        $totalBpm       = 0;
        $totalSys       = 0;
        $countWithVital = 0;
        $criticalPatients = 0;
        $warningPatients  = 0;
        $stablePatients   = 0;
        $alerts         = [];

        foreach ($patients as &$p) {
            $latest = $p['latest'];

            // Tambahkan field turunan untuk view
            $p['initials'] = $this->initials($p['name']);
            $p['id_label'] = 'PT-' . str_pad($p['id'], 5, '0', STR_PAD_LEFT);

            if ($latest) {
                $bpm = (int) $latest['bpm'];
                $sys = (int) $latest['sys'];
                $dia = (int) $latest['dia'];

                $totalBpm += $bpm;
                $totalSys += $sys;
                $countWithVital++;

                // Key yang dibutuhkan oleh view dashboard/index.blade.php
                $p['heart_rate'] = $bpm;
                $p['spo2']       = $sys;    // sys dipakai sebagai representasi tekanan sistolik
                $p['sys']        = $sys;
                $p['dia']        = $dia;

                // Ambil data gula darah dari pengukuran SpO2 terbaru (endpoint terpisah)
                $latestSpo2   = $p['latest_spo2'] ?? null;
                $p['glucose'] = ($latestSpo2 && isset($latestSpo2['blood_sugar']))
                    ? (float) $latestSpo2['blood_sugar']
                    : null;

                // Tentukan status klinis
                $p['status'] = $this->clinicalStatus($bpm, $sys, $dia);


                // Buat alert jika kritis atau warning
                if ($p['status'] === 'critical') {
                    $criticalPatients++;
                    $activeAlerts++;
                    $alerts[] = [
                        'id'      => 'alert-' . $p['id'],
                        'type'    => 'critical',
                        'label'   => 'Critical Vitals',
                        'time'    => \Carbon\Carbon::parse($latest['datetime'])->format('H:i'),
                        'patient' => $p['name'],
                        'message' => "BPM: {$bpm}, Sys: {$sys}, Dia: {$dia} — nilai melebihi ambang batas.",
                        'actions' => [
                            ['label' => 'Intervene', 'class' => 'bg-error text-on-error hover:opacity-90', 'url' => route('patients.report', $p['id'])],
                            ['label' => 'Dismiss',   'class' => 'text-on-surface-variant hover:bg-surface-variant/50', 'action' => 'dismiss'],
                        ],
                    ];
                } elseif ($p['status'] === 'warning') {
                    $warningPatients++;
                    $alerts[] = [
                        'id'      => 'alert-' . $p['id'],
                        'type'    => 'warning',
                        'label'   => 'Abnormal Vitals',
                        'time'    => \Carbon\Carbon::parse($latest['datetime'])->format('H:i'),
                        'patient' => $p['name'],
                        'message' => "BPM: {$bpm}, Sys: {$sys}, Dia: {$dia} — perlu pemantauan.",
                        'actions' => [
                            ['label' => 'Investigate', 'class' => 'bg-primary-container text-on-primary hover:opacity-90', 'url' => route('patients.report', $p['id'])],
                            ['label' => 'Dismiss',     'class' => 'text-on-surface-variant hover:bg-surface-variant/50', 'action' => 'dismiss'],
                        ],
                    ];
                } elseif ($p['status'] === 'stable') {
                    $stablePatients++;
                }
            } else {
                $p['status']     = 'no-data';
                $p['heart_rate'] = '—';
                $p['spo2']       = '—';
            }
        }
        unset($p);

        $stats = [
            'total_patients'    => $totalPatients,
            'critical_patients' => $criticalPatients,
            'warning_patients'  => $warningPatients,
            'stable_patients'   => $stablePatients,
            'active_alerts'     => $activeAlerts,
            'avg_heart_rate'    => $countWithVital > 0 ? round($totalBpm / $countWithVital) : '—',
            'avg_spo2'          => $countWithVital > 0 ? round($totalSys / $countWithVital, 1) : '—',
        ];

        // Fallback jika API tidak bisa diakses (tampilkan dashboard kosong, bukan crash)
        if ($totalPatients === 0) {
            $stats = [
                'total_patients'    => 0,
                'critical_patients' => 0,
                'warning_patients'  => 0,
                'stable_patients'   => 0,
                'active_alerts'     => 0,
                'avg_heart_rate'    => '—',
                'avg_spo2'          => '—',
            ];
        }

        return view('dashboard.index', compact('stats', 'patients', 'alerts'));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Ambil inisial dari nama lengkap (maks 2 huruf).
     */
    private function initials(string $name): string
    {
        $words = explode(' ', trim($name));
        $init  = strtoupper(substr($words[0], 0, 1));
        if (count($words) > 1) {
            $init .= strtoupper(substr(end($words), 0, 1));
        }
        return $init;
    }

    /**
     * Tentukan status klinis berdasarkan nilai vital.
     *
     * Referensi:
     *   BPM normal  : 60–100
     *   Sys normal  : < 120 mmHg (normal) | 120–129 elevated | ≥ 130 high
     *   Dia normal  : < 80 mmHg
     */
    private function clinicalStatus(int $bpm, int $sys, int $dia): string
    {
        if ($bpm > 110 || $sys >= 140 || $dia >= 90) {
            return 'critical';
        }
        if ($bpm > 100 || $bpm < 50 || $sys >= 130 || $dia >= 80) {
            return 'warning';
        }
        return 'stable';
    }
}
