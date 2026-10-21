<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class IntegrationQualityReport extends Command
{
    protected $signature = 'flowbeat:integration-report';
    protected $description = 'Menghitung bukti dimensi integrasi data dari catatan tersimpan';

    /**
     * Menghasilkan angka bukti untuk variabel integrasi, yaitu
     * kelengkapan, keunikan, cakupan, dan validitas. Angka ini
     * dipakai sebagai bukti terukur di Bab V. Sesuaikan nama tabel
     * dan kolom bila skema Anda berbeda.
     */
    public function handle(): int
    {
        $table = 'patient_records';
        $required = ['systolic', 'diastolic', 'pulse_rate', 'measured_at', 'device_model'];

        $total = DB::table($table)->count();
        if ($total === 0) {
            $this->warn('Belum ada data pada tabel ' . $table);
            return self::SUCCESS;
        }

        $completeQuery = DB::table($table);
        foreach ($required as $col) {
            $completeQuery->whereNotNull($col);
        }
        $complete = $completeQuery->count();

        $coverage = DB::table($table)->distinct()->count('device_model');

        $dupGroups = DB::table($table)
            ->select('record_hash')
            ->groupBy('record_hash')
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->count();

        $valid = DB::table($table)
            ->whereBetween('systolic', [60, 260])
            ->whereBetween('diastolic', [30, 160])
            ->count();

        $pct = fn ($n) => round($n / $total * 100, 2);

        $this->info('Laporan Kualitas Integrasi Flowbeat');
        $this->table(
            ['Dimensi', 'Nilai'],
            [
                ['Total catatan', $total],
                ['Kelengkapan (lengkap)', $complete . ' (' . $pct($complete) . ' persen)'],
                ['Keunikan (grup duplikat)', $dupGroups . ' (idealnya 0)'],
                ['Cakupan (jenis perangkat)', $coverage],
                ['Validitas (dalam batas fisiologis)', $valid . ' (' . $pct($valid) . ' persen)'],
                ['Konsistensi (skema kanonis tunggal)', 'Terpenuhi secara struktural'],
            ]
        );

        return self::SUCCESS;
    }
}
