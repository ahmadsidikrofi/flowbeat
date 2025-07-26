<?php

namespace App\Services;

use App\Events\BloodPressureDataEvent;
use App\Models\BloodPressureModel;
use App\Services\CDL\CDLTransmissionRuleInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CDLService
{
    protected CDLTransmissionRuleInterface $transmissionRule;

    public function __construct(CDLTransmissionRuleInterface $transmissionRule)
    {
        $this->transmissionRule = $transmissionRule;
    }

    public function isAllowedToSend($patientId, array $requestData): bool
    {

        $status = $this->transmissionRule->calculateStatus($requestData);
        $intervals = $this->transmissionRule->getIntervals();

        $lock = Cache::lock("lock_patient_{$patientId}");

        if ($lock->get()) {
            try {
                // $delay = $this->intervals[$status] ?? 60;
                $delay = $intervals[$status] ?? 60;
                $lastSent = Cache::get("cdl_last_sent_{$patientId}");
                // Memeriksa apakah data terakhir dikirim dalam waktu yang kurang dari batas waktu tertunda
                if ($lastSent && now()->diffInSeconds($lastSent) < $delay) {
                    return false;
                }
                Cache::put("cdl_last_sent_{$patientId}", now(), $delay);
                return true;
            } finally {
                $lock->release();
            }
        }
        return false;

    }

    public function bufferData(array $data)
    {
        $status = $this->transmissionRule->calculateStatus($data);
        $this->transmissionRule->handleBuffering($status, $data, $this);

        // $key = "cdl_buffer_{$status}";
        // $buffer = Cache::get($key, []);
        // $buffer[] = $data;
        // if (count($buffer) > 5) {
        //     $this->flushBufferedData($status);
        //     return;
        // }
        // Cache::put($key, $buffer, now()->addHours(1));

        // Log::info("CDL BUFFER - Data buffered for status {$status}", $data);
    }

    public function bufferDataWithStatus(string $bufferStatus, array $data): void
    {
        $this->transmissionRule->handleBuffering($bufferStatus, $data, $this);
    }

    public function flushBufferedData($status, $modelClass)
    {
        $key = "cdl_buffer_{$status}";
        $buffer = Cache::pull($key);

        if (!$buffer || count($buffer) === 0) {
            Log::info("CDL FLUSH - No data to flush for status {$status}");
            return;
        }

        $patientIdsToClear = [];
        $patientIdsToClear = array_unique(array_column($buffer, 'patient_id'));
        // BloodPressureModel::insert($buffer);
        $modelClass::insert($buffer);

        foreach ($patientIdsToClear as $patientId) {
            Cache::forget("bp_data_{$patientId}");
            BloodPressureDataEvent::dispatch($patientId); // Teriak ada data baru buat pasien ini
        }

        Log::info("CDL FLUSH - Flushed " . count($buffer) . " record(s) to DB for status {$status}");
    }
}
