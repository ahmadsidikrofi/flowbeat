<?php

namespace App\Adapters;

use App\Domain\CanonicalVitalSign;
use Carbon\Carbon;

class VendorBAdapter implements VitalSignAdapter
{
    public function supports(array $payload): bool
    {
        return ($payload['device_model'] ?? '') === 'VENDOR-B-100';
    }

    public function transform(array $payload): array
    {
        $hasil = [];
        foreach ($payload['measurements'] as $m) {
            $hasil[] = new CanonicalVitalSign(
                deviceModel: 'VENDOR-B-100',
                systolic:    (int) $m['systolic_mmhg'],
                diastolic:   (int) $m['diastolic_mmhg'],
                pulse:       (int) $m['heart_rate'],
                measuredAt:  Carbon::parse($m['recorded_at'])->format('Y-m-d H:i:s'),
            );
        }
        return $hasil;
    }
}