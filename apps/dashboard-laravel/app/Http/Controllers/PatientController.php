<?php

namespace App\Http\Controllers;

use App\Services\MobileApiService;
use Illuminate\Support\Facades\Auth;

class PatientController extends Controller
{
    public function __construct(protected MobileApiService $api) {}

    /**
     * Daftar semua pasien dari mobile API.
     */
    public function index()
    {
        $doctorId = Auth::id();
        $assignedProfiles = \App\Models\DoctorProfile::where('doctor_id', $doctorId)
                                                     ->get()
                                                     ->toArray();

        $patients = $this->api->getAssignedPatientsWithLatestVitals($assignedProfiles);

        // Enrichment that was done in getAssignedPatientsWithLatestVitals already added latest, etc.
        // We just need to add 'initials', 'ward', 'heart_rate', 'spo2', 'status' which the view expects.
        foreach ($patients as &$p) {
            $latest = $p['latest'];
            $bpm = $latest ? (int) $latest['bpm'] : null;
            $sys = $latest ? (int) $latest['sys'] : null;
            $dia = $latest ? (int) $latest['dia'] : null;

            $p['initials']   = $this->initials($p['name']);
            $p['ward']       = 'Remote Monitor';
            $p['heart_rate'] = $bpm ?? '—';
            $p['spo2']       = $sys ?? '—';
            $p['status']     = $latest ? $this->clinicalStatus($bpm, $sys, $dia) : 'no-data';
        }
        unset($p);

        return view('patients.index', compact('patients'));
    }

    /**
     * Halaman laporan detail satu pasien — data real dari mobile API.
     */
    public function report($id)
    {
        $doctorId = Auth::id();
        $idProfile = (int) $id;

        // Validasi apakah dokter ini memiliki akses ke profile_id tersebut
        $assignment = \App\Models\DoctorProfile::where('doctor_id', $doctorId)
                                               ->where('profile_id', $idProfile)
                                               ->first();

        if (! $assignment) {
            return redirect()->route('patients.index')
                ->with('error', "Anda tidak memiliki akses ke Profile ID #{$idProfile}.");
        }

        // Ambil data profile dari API menggunakan api_user_id dari assignment
        $profileData = $this->api->getProfile($assignment->api_user_id, $idProfile);

        if (! $profileData) {
            return redirect()->route('patients.index')
                ->with('error', "Profile ID #{$idProfile} tidak ditemukan di Mobile API.");
        }

        // Format data pasien untuk view
        $patient = [
            'patient_id'      => 'PT-' . str_pad($profileData['id'], 5, '0', STR_PAD_LEFT),
            'name'            => $profileData['name'],
            'age'             => $profileData['age'],
            'sex'             => ucfirst($profileData['gender'] ?? 'Unknown'),
            'blood_type'      => '—',          // tidak ada di API, placeholder
            'tb'              => $profileData['tb'],
            'bb'              => $profileData['bb'],
            'image_url'       => $profileData['image_url'],
            'medical_history' => [],           // akan diisi dari DB lokal nanti
        ];

        // Ambil semua riwayat pengukuran tensi
        $measurements = $this->api->getMeasurements($idProfile);

        // Ambil semua riwayat pengukuran SpO2 (berisi blood_sugar)
        $spo2Measurements = $this->api->getSpo2Measurements($idProfile);

        // Pengukuran terbaru
        $latest     = count($measurements)     > 0 ? $measurements[0]     : null;
        $latestSpo2 = count($spo2Measurements) > 0 ? $spo2Measurements[0] : null;

        // Hitung rata-rata vital dari semua riwayat
        $avgBpm = $avgSys = $avgDia = 0;
        if (count($measurements) > 0) {
            $avgBpm = round(array_sum(array_column($measurements, 'bpm')) / count($measurements));
            $avgSys = round(array_sum(array_column($measurements, 'sys')) / count($measurements));
            $avgDia = round(array_sum(array_column($measurements, 'dia')) / count($measurements));
        }

        // Rata-rata glucose dari riwayat SpO2
        $validGlucose = array_filter(
            array_column($spo2Measurements, 'blood_sugar'),
            fn($v) => $v !== null && $v > 0
        );
        $avgGlucose = count($validGlucose) > 0
            ? round(array_sum($validGlucose) / count($validGlucose), 1)
            : null;

        $vitals = [
            'avg_heart_rate' => $avgBpm ?: '—',
            'hr_trend'       => $latest ? "Latest: {$latest['bpm']} BPM" : 'No data',
            'avg_spo2'       => $avgSys ?: '—',
            'spo2_trend'     => $latest ? "Sys: {$latest['sys']} / Dia: {$latest['dia']} mmHg" : 'No data',
            'temperature'    => $latestSpo2 ? number_format((float)$latestSpo2['temperature'], 1) : '—',
            'temp_trend'     => $latestSpo2 ? "Latest SpO2: {$latestSpo2['spo2']}%" : 'Not measured',
            'avg_glucose'    => $avgGlucose ?? '—',
            'latest_glucose' => $latestSpo2 ? $latestSpo2['blood_sugar'] : null,
        ];

        // ── Bangun SVG path dari riwayat pengukuran ─────────────────────────
        $charts = $this->buildCharts($measurements, $spo2Measurements);

        // ── Prediksi ML (sederhana berdasarkan tren) ─────────────────────────
        $ml = $this->buildMlInsight($measurements);

        // ── Riwayat alert dari pengukuran abnormal ───────────────────────────
        $alertHistory = $this->buildAlertHistory($measurements);

        return view('patients.report', compact(
            'patient', 'ml', 'alertHistory', 'charts', 'vitals', 'measurements'
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function initials(string $name): string
    {
        $words = explode(' ', trim($name));
        $init  = strtoupper(substr($words[0], 0, 1));
        if (count($words) > 1) {
            $init .= strtoupper(substr(end($words), 0, 1));
        }
        return $init;
    }

    private function clinicalStatus(?int $bpm, ?int $sys, ?int $dia): string
    {
        if (! $bpm) return 'no-data';
        if ($bpm > 110 || $sys >= 140 || $dia >= 90) return 'critical';
        if ($bpm > 100 || $bpm < 50  || $sys >= 130 || $dia >= 80) return 'warning';
        return 'stable';
    }

    /**
     * Buat SVG path string dari array measurement (maks 20 titik terbaru).
     * Koordinat: x=0..800, y=0..200 (dibalik karena SVG y-down)
     */
    private function buildCharts(array $measurements, array $spo2Measurements = []): array
    {
        // Ambil maks 20 data terbaru, urutkan lama→baru untuk chart kiri→kanan
        $data = array_slice(array_reverse($measurements), 0, 20);
        $n    = count($data);

        if ($n === 0) {
            $flat = 'M0,100 L800,100';
            return [
                'hr_path'      => $flat,
                'hr_fill'      => 'M0,100 L800,100 L800,200 L0,200 Z',
                'hr_tooltip'   => 'No data',
                'spo2_path'    => $flat,
                'spo2_fill'    => 'M0,100 L800,100 L800,200 L0,200 Z',
                // Chart.js data (JSON)
                'bp_labels'    => '[]',
                'bp_sys'       => '[]',
                'bp_dia'       => '[]',
                'glucose_labels' => '[]',
                'glucose_data'   => '[]',
            ];
        }

        // ── Heart Rate (BPM) path ─────────────────────────────────────────
        $bpms    = array_column($data, 'bpm');
        $minBpm  = max(40, min($bpms) - 10);
        $maxBpm  = min(160, max($bpms) + 10);
        $hrPts   = $this->toSvgPoints($bpms, $minBpm, $maxBpm, $n);
        $hrPath  = 'M' . implode(' L', array_map(fn($p) => "{$p[0]},{$p[1]}", $hrPts));
        $hrFill  = $hrPath . " L800,200 L0,200 Z";

        $lastBpm = end($bpms);
        $lastDt  = \Carbon\Carbon::parse(end($data)['datetime'])->format('H:i');
        $tooltip = "{$lastDt} • {$lastBpm} BPM";

        // ── Systolic (SYS) path ───────────────────────────────────────────
        $syss    = array_column($data, 'sys');
        $minSys  = max(60, min($syss) - 10);
        $maxSys  = min(200, max($syss) + 10);
        $sysPts  = $this->toSvgPoints($syss, $minSys, $maxSys, $n);
        $sysPath = 'M' . implode(' L', array_map(fn($p) => "{$p[0]},{$p[1]}", $sysPts));
        $sysFill = $sysPath . " L800,200 L0,200 Z";

        // ── Chart.js data: Sys / Dia ──────────────────────────────────────
        $bpLabels = array_map(
            fn($m) => \Carbon\Carbon::parse($m['datetime'])->format('d/m H:i'),
            $data
        );
        $bpSys = array_map(fn($m) => (int) $m['sys'], $data);
        $bpDia = array_map(fn($m) => (int) $m['dia'], $data);

        // ── Chart.js data: Glucose (dari SpO2 measurements) ──────────────
        $spo2Data    = array_slice(array_reverse($spo2Measurements), 0, 20);
        $glucoseLabels = array_map(
            fn($m) => \Carbon\Carbon::parse($m['datetime'])->format('d/m H:i'),
            $spo2Data
        );
        $glucoseValues = array_map(
            fn($m) => isset($m['blood_sugar']) && $m['blood_sugar'] !== null ? round((float)$m['blood_sugar'], 1) : null,
            $spo2Data
        );

        return [
            'hr_path'        => $hrPath,
            'hr_fill'        => $hrFill,
            'hr_tooltip'     => $tooltip,
            'spo2_path'      => $sysPath,
            'spo2_fill'      => $sysFill,
            // JSON untuk Chart.js
            'bp_labels'      => json_encode(array_values($bpLabels)),
            'bp_sys'         => json_encode(array_values($bpSys)),
            'bp_dia'         => json_encode(array_values($bpDia)),
            'glucose_labels' => json_encode(array_values($glucoseLabels)),
            'glucose_data'   => json_encode(array_values($glucoseValues)),
        ];
    }

    /**
     * Konversi array nilai ke array [x, y] untuk SVG (800×200).
     */
    private function toSvgPoints(array $values, float $min, float $max, int $n): array
    {
        $pts  = [];
        $xGap = $n > 1 ? 800 / ($n - 1) : 800;
        $range = $max - $min ?: 1;

        foreach ($values as $i => $v) {
            $x = round($i * $xGap);
            // Y dibalik: nilai tinggi = y kecil (atas SVG)
            $y = round(200 - (($v - $min) / $range) * 180 - 10);
            $pts[] = [$x, $y];
        }
        return $pts;
    }

    /**
     * Prediksi ML sederhana berdasarkan tren BPM 3 pengukuran terakhir.
     */
    private function buildMlInsight(array $measurements): array
    {
        if (count($measurements) < 2) {
            return [
                'risk_level'          => 'Unknown',
                'risk_description'    => 'Insufficient data for risk assessment.',
                'predicted_outcome'   => 'Pending',
                'outcome_description' => 'More readings needed to generate a prediction.',
            ];
        }

        $recent = array_slice($measurements, 0, 3);
        $bpms   = array_column($recent, 'bpm');
        $trend  = end($bpms) - $bpms[0];

        $latestBpm = (int) $measurements[0]['bpm'];
        $latestSys = (int) $measurements[0]['sys'];

        if ($latestBpm > 110 || $latestSys >= 140) {
            $risk        = 'High';
            $riskDesc    = 'Current vitals indicate elevated risk. Immediate monitoring recommended.';
            $outcome     = 'Worsening';
            $outcomeDesc = "BPM trend: " . ($trend >= 0 ? "+{$trend}" : $trend) . " over last 3 readings.";
        } elseif ($latestBpm > 100 || $latestSys >= 130) {
            $risk        = 'Medium';
            $riskDesc    = 'Vitals are above normal range. Monitor closely over the next 24 hours.';
            $outcome     = 'Stable';
            $outcomeDesc = "BPM trend: " . ($trend >= 0 ? "+{$trend}" : $trend) . " over last 3 readings.";
        } else {
            $risk        = 'Low';
            $riskDesc    = 'Current risk assessment suggests stable condition for the next 48 hours.';
            $outcome     = 'Improving';
            $outcomeDesc = "BPM trend: " . ($trend >= 0 ? "+{$trend}" : $trend) . " over last 3 readings.";
        }

        return compact('risk', 'riskDesc', 'outcome', 'outcomeDesc') + [
            'risk_level'          => $risk,
            'risk_description'    => $riskDesc,
            'predicted_outcome'   => $outcome,
            'outcome_description' => $outcomeDesc,
        ];
    }

    /**
     * Bangun riwayat alert dari pengukuran yang abnormal.
     */
    private function buildAlertHistory(array $measurements): array
    {
        $alerts = [];
        foreach (array_slice($measurements, 0, 10) as $m) {
            $bpm = (int) $m['bpm'];
            $sys = (int) $m['sys'];
            $dia = (int) $m['dia'];
            $dt  = \Carbon\Carbon::parse($m['datetime'])->format('M d, H:i');

            if ($bpm > 110 || $sys >= 140 || $dia >= 90) {
                $alerts[] = [
                    'severity' => 'critical',
                    'title'    => "Critical — BPM {$bpm}, Sys {$sys}, Dia {$dia}",
                    'meta'     => "{$dt}",
                ];
            } elseif ($bpm > 100 || $sys >= 130 || $dia >= 80) {
                $alerts[] = [
                    'severity' => 'warning',
                    'title'    => "Warning — BPM {$bpm}, Sys {$sys}, Dia {$dia}",
                    'meta'     => "{$dt}",
                ];
            }
        }

        return $alerts ?: [];
    }
}
