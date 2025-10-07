<?php

namespace App\Services\CDL;

use App\Models\VitalSignModel;
use App\Services\CDLService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BpmTransmissionRule implements CDLTransmissionRuleInterface
{
    public function getIntervals(): array
    {
        $intervals = [
            "Tidak Normal" => 10,
            "Normal" => 30
        ];
        return $intervals;
    }

    public function calculateStatus(array $data): string
    {
        $bpm = $data['bpm'];
        $status = $bpm < 60 || $bpm > 100 ? "Tidak Normal" : "Normal";
        return $status;
    }

    public function handleBuffering(string $status, array $data, CDLService $cdlService): void
    {
        $key = "cdl_buffer_{$status}";
        $buffer = Cache::get($key, []);
        $buffer[] = $data;
        // if (count($buffer) > 5) {
        //     $cdlService->flushBufferedData($status, $this->getModelClass());
        //     return;
        // }
        Cache::put($key, $buffer, now()->addHours(1));

        Log::info("BPM BUFFER - Data buffered for status {$status}", $data);
    }

    public function getModelClass(): string
    {
        return VitalSignModel::class;
    }
}
