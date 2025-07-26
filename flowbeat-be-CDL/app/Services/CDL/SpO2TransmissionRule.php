<?php

namespace App\Services\CDL;

use App\Models\VitalSignModel;
use App\Services\CDLService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SpO2TransmissionRule implements CDLTransmissionRuleInterface
{
    public function getIntervals(): array
    {
        $intervals = [
            'Tidak Normal (Hipoksia)' => 10,
            'Waspada' => 20,
            'Normal' => 30,
        ];
        return $intervals;
    }

    public function calculateStatus(array $data): string
    {
        $spo2 = $data['spo2'];

        if ($spo2 < 91) {
            return "Tidak Normal (Hipoksia)";
        } else if ($spo2 < 95) {
            return "Waspada";
        } else {
            return "Normal";
        }
    }

    public function handleBuffering(string $status, array $data, CDLService $cdlService): void
    {
        $key = "cdl_buffer_{$status}";
        $buffer = Cache::get($key, []);
        $buffer[] = $data;
        if (count($buffer) > 5) {
            $cdlService->flushBufferedData($status, $this->getModelClass());
            return;
        }
        Cache::put($key, $buffer, now()->addHours(1));

        Log::info("SpO2 BUFFER - Data buffered for status {$status}", $data);
    }

    function getModelClass(): string
    {
        return VitalSignModel::class;
    }
}
