<?php

namespace App\Services;

class VitalSignClassifier
{
    /**
     * Klasifikasi status tekanan darah berbasis ambang yang lazim.
     * Bersifat demonstrasi teknis kesiapan data untuk dipantau,
     * bukan diagnosis klinis.
     */
    public function classify(int $systolic, int $diastolic): string
    {
        if ($systolic >= 140 || $diastolic >= 90) {
            return 'Tinggi';
        }
        if ($systolic >= 120 || $diastolic >= 80) {
            return 'Waspada';
        }
        return 'Normal';
    }
}
