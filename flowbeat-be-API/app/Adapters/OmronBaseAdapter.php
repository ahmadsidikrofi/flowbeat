<?php
 
namespace App\Adapters;
 
use App\Domain\CanonicalVitalSign;
use Carbon\Carbon;
 
abstract class OmronBaseAdapter implements VitalSignAdapter
{
    // tiap perangkat wajib menyebut identitasnya sendiri
    abstract protected function macAddress(): string;
    abstract protected function deviceModel(): string;
 
    public function supports(array $payload): bool
    {
        $mac = strtoupper($payload['mac_address'] ?? '');
        if ($mac === strtoupper($this->macAddress())) {
            return true;
        }
 
        // cadangan, kalau payload uji menyertakan device_model eksplisit
        $model = strtoupper($payload['device_model'] ?? '');
        return $model === strtoupper($this->deviceModel());
    }
 
    public function transform(array $payload): array
    {
        $hasil = [];
 
        // Bentuk 1, larik bersarang dari endpoint connect-and-read
        if (isset($payload['records']) && is_array($payload['records'])) {
            foreach ($payload['records'] as $kelompokPengguna) {
                if (!is_array($kelompokPengguna)) {
                    continue;
                }
                foreach ($kelompokPengguna as $r) {
                    $hasil[] = $this->keKanonis($r);
                }
            }
            return $hasil;
        }
 
        // Bentuk 2, objek tunggal dari endpoint latest-bp-records
        if (isset($payload['latest_record']) && is_array($payload['latest_record'])) {
            $hasil[] = $this->keKanonis($payload['latest_record']);
            return $hasil;
        }
 
        return $hasil;
    }
 
    // inilah inti penyeragaman, semua bentuk bermuara ke sini
    protected function keKanonis(array $r): CanonicalVitalSign
    {
        return new CanonicalVitalSign(
            deviceModel: $this->deviceModel(),
            systolic:    (int) $r['sys'],
            diastolic:   (int) $r['dia'],
            pulse:       (int) $r['bpm'],
            measuredAt:  $this->seragamkanWaktu($r['datetime']),
        );
    }
 
    // menyatukan dua format waktu yang berbeda menjadi satu format
    protected function seragamkanWaktu(string $waktu): string
    {
        return Carbon::parse($waktu)->format('Y-m-d H:i:s');
    }
}
