<?php

namespace App\Services;

use App\Events\BloodPressureDataEvent;
use App\Jobs\FlushCDLBufferJob;
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

        // Rate limiting fleksibel berdasarkan status kesehatan pasien
        // Setiap status memiliki interval delay yang berbeda
        $delay = $intervals[$status] ?? 60;

        // Cache key spesifik per pasien dan per status untuk rate limiting yang fleksibel
        $cacheKey = "cdl_last_sent_{$patientId}_{$status}";
        $lock = Cache::lock("lock_patient_{$patientId}_{$status}");

        if ($lock->get()) {
            try {
                $lastSent = Cache::get($cacheKey);
                // Memeriksa apakah data terakhir dikirim dalam waktu yang kurang dari batas waktu tertunda
                if ($lastSent && now()->diffInSeconds($lastSent) < $delay) {
                    return false;
                }
                Cache::put($cacheKey, now(), $delay);
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

    /**
     * Flush buffered data secara asynchronous menggunakan queue
     * Method ini dispatch job ke queue untuk batch insert di background worker
     * Cocok untuk async write architecture pada high load API
     */
    public function flushBufferedDataAsync(string $status, string $modelClass): void
    {
        $key = "cdl_buffer_{$status}";
        $buffer = Cache::get($key, []);

        if (empty($buffer)) {
            Log::info("CDL ASYNC FLUSH - No data to flush for status {$status}");
            return;
        }

        // Dispatch job ke queue untuk async batch processing
        // Worker akan memproses batch insert di background tanpa blocking API response
        FlushCDLBufferJob::dispatch($status, $modelClass);

        Log::info("CDL ASYNC FLUSH - Job dispatched for status {$status} with " . count($buffer) . " record(s)");
    }
}
