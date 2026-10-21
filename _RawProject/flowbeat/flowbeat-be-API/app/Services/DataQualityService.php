<?php
 
namespace App\Services;
 
use App\Domain\CanonicalVitalSign;
 
class DataQualityService
{
    // stempel waktu bawaan pabrik saat jam perangkat belum disetel
    private const TANGGAL_SENTINEL = '2021-01-01';
 
    public function periksa(CanonicalVitalSign $v): array
    {
        $alasan = [];
 
        if ($v->pulse < 20 || $v->pulse > 250) {
            $alasan[] = 'denyut nadi di luar rentang wajar';
        }
        if ($v->systolic < 40 || $v->systolic > 300) {
            $alasan[] = 'sistolik di luar rentang wajar';
        }
        if ($v->diastolic < 20 || $v->diastolic > 250) {
            $alasan[] = 'diastolik di luar rentang wajar';
        }
        if ($v->systolic <= $v->diastolic) {
            $alasan[] = 'sistolik tidak lebih besar dari diastolik';
        }
        if (strtotime($v->measuredAt) > time()) {
            $alasan[] = 'waktu pengukuran berada di masa depan';
        }
        if (str_starts_with($v->measuredAt, self::TANGGAL_SENTINEL)) {
            $alasan[] = 'stempel waktu bawaan pabrik, jam perangkat belum disetel';
        }
 
        return [
            'lolos'  => count($alasan) === 0,
            'alasan' => $alasan,
        ];
    }
}
