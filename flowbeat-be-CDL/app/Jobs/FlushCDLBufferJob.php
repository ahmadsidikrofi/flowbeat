<?php

namespace App\Jobs;

use App\Events\BloodPressureDataEvent;
use App\Services\CDLService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FlushCDLBufferJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $status,
        public string $modelClass
    ) {
        // Set queue name untuk batch processing CDL
        $this->onQueue('cdl-batch');
    }

    /**
     * Execute the job.
     *
     * Async batch insert untuk CDL buffer data
     * Worker akan memproses ini di background tanpa blocking API response
     */
    public function handle(CDLService $cdlService): void
    {
        $key = "cdl_buffer_{$this->status}";
        $startTime = microtime(true);

        // Atomic operation: pull() memastikan data hanya diambil sekali (idempotent)
        $buffer = Cache::pull($key);

        // Idempotency check: jika buffer sudah kosong, job sudah pernah diproses
        if (!$buffer || count($buffer) === 0) {
            Log::info("CDL ASYNC FLUSH - No data to flush for status {$this->status} (idempotent check)");
            // Clear processing flag
            Cache::forget("cdl_buffer_{$this->status}_processing");
            return;
        }

        try {
            // Batch insert ke database (async di background worker)
            $modelClass = $this->modelClass;
            $modelClass::insert($buffer);

            // Clear cache untuk pasien yang terpengaruh
            $patientIdsToClear = array_unique(array_column($buffer, 'patient_id'));
            foreach ($patientIdsToClear as $patientId) {
                Cache::forget("bp_data_{$patientId}");
                BloodPressureDataEvent::dispatch($patientId);
            }

            $processingTime = round((microtime(true) - $startTime) * 1000, 2);
            Log::info("CDL ASYNC FLUSH - Successfully flushed " . count($buffer) . " record(s) to DB for status {$this->status}", [
                'processing_time_ms' => $processingTime,
                'records_count' => count($buffer),
            ]);
        } catch (\Exception $e) {
            Log::error("CDL ASYNC FLUSH - Failed to flush buffer for status {$this->status}: " . $e->getMessage(), [
                'exception' => $e->getTraceAsString(),
            ]);

            // Put buffer back to cache jika gagal (untuk retry)
            // Idempotent: jika job di-retry, akan mengambil buffer yang sama
            Cache::put($key, $buffer, now()->addHours(1));

            throw $e; // Re-throw untuk trigger retry mechanism
        } finally {
            // Clear processing flag setelah selesai (berhasil atau gagal)
            Cache::forget("cdl_buffer_{$this->status}_processing");
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("CDL ASYNC FLUSH - Job failed permanently for status {$this->status}: " . $exception->getMessage());
    }
}

