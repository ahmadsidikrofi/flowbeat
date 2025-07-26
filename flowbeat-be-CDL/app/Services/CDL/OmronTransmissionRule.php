<?php

namespace App\Services\CDL;

use App\Models\BloodPressureModel;
use App\Services\CDLService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OmronTransmissionRule implements CDLTransmissionRuleInterface
{

    public function getIntervals(): array
    {
        $intervals = [
            'Rendah' => 10,
            'Hipertensi Tinggi' => 10,
            'Normal Tinggi' => 20,
            'Normal' => 30,
        ];
        return $intervals;
    }

    public function calculateStatus(array $data): string
    {
        $sys = $data['sys'];
        $dia = $data['dia'];

        if ($sys > 130 || $dia > 80) {
            return "Hipertensi Tinggi";
        }
        if ($sys >= 120 && $dia < 80) {
            return "Normal Tinggi";
        }
        if ($sys < 90 || $dia < 60) {
            return "Rendah";
        }
        return "Normal";
    }

    public function handleBuffering(string $status, array $data, CDLService $cdlService): void
    {
        $key = "cdl_buffer_{$status}";
        $buffer = Cache::get($key, []);
        $buffer[] = $data;

        Cache::put($key, $buffer, now()->addHours(1));

        Log::info("Omron BUFFER - Data buffered for status {$status}", $data);
    }

    public function getModelClass(): string
    {
        return BloodPressureModel::class;
    }
}
