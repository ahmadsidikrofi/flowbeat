<?php

namespace App\Console\Commands;

use App\Jobs\FlushCDLBufferJob;
use App\Models\BloodPressureModel;
use App\Models\PatientModel;
use App\Models\VitalSignModel;
use Illuminate\Support\Facades\Cache;
use App\Services\CDL\BpmTransmissionRule;
use App\Services\CDL\Max30100TransmissionRule;
use App\Services\CDL\OmronTransmissionRule;
use App\Services\CDL\SpO2TransmissionRule;
use App\Services\CDLService;
use Illuminate\Console\Command;

class FlushCDLCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cdl:flush';
    protected $description = 'Flush buffered CDL data to database';

    /**
     * The console command description.
     *
     * @var string
     */

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting CDL buffer flush...');

        $rules = [
            new OmronTransmissionRule(),
            new BpmTransmissionRule(),
            new SpO2TransmissionRule(),
        ];

        // Mapping status ke model class dengan rule sebagai key untuk menghindari konflik
        // Format: ['status' => ['model' => ModelClass, 'rule' => RuleClass]]
        $statusToModelMap = [];

        foreach ($rules as $rule) {
            $statuses = array_keys($rule->getIntervals());
            $modelClass = $rule->getModelClass();
            foreach($statuses as $status) {
                // Jika status sudah ada, pastikan model class sama (untuk menghindari konflik)
                if (isset($statusToModelMap[$status]) && $statusToModelMap[$status] !== $modelClass) {
                    // Jika konflik, gunakan rule yang lebih spesifik atau prioritas lebih tinggi
                    // Untuk kasus ini, kita skip karena BPM dan SpO2 keduanya menggunakan VitalSignModel
                    // dan status "Normal" bisa muncul di keduanya
                    if ($modelClass === VitalSignModel::class && $statusToModelMap[$status] === VitalSignModel::class) {
                        // Keduanya VitalSignModel, tidak masalah
                        continue;
                    }
                }
                $statusToModelMap[$status] = $modelClass;
            }
        }

        // Handle buffer status khusus untuk VitalSign (kombinasi BPM dan SpO2)
        $vitalSignBufferStatuses = [
            'VITAL_NORMAL' => VitalSignModel::class,
            'VITAL_TIDAK_NORMAL' => VitalSignModel::class,
            'VITAL_WASPADA' => VitalSignModel::class,
        ];
        $statusToModelMap = array_merge($statusToModelMap, $vitalSignBufferStatuses);

        $flushedCount = 0;
        $jobsDispatched = 0;

        // Async Write Architecture: Dispatch job ke queue untuk batch insert di background
        // API response tidak terblokir, worker akan memproses batch insert secara asynchronous
        foreach ($statusToModelMap as $status => $model) {
            // Atomic operation: Gunakan lock untuk mencegah race condition
            // Memastikan hanya satu job yang di-dispatch per status pada waktu yang sama
            $lock = Cache::lock("flush_lock_{$status}", 10);

            if ($lock->get()) {
                try {
                    $buffer = Cache::get("cdl_buffer_{$status}", []);
                    if (!empty($buffer)) {
                        // Cek apakah sudah ada job yang sedang memproses status ini
                        $isProcessing = Cache::get("cdl_buffer_{$status}_processing", false);
                        if (!$isProcessing) {
                            // Mark sebagai processing untuk mencegah duplikasi job
                            Cache::put("cdl_buffer_{$status}_processing", true, 60);

                            // Dispatch job ke queue untuk async batch processing
                            FlushCDLBufferJob::dispatch($status, $model);
                            $flushedCount += count($buffer);
                            $jobsDispatched++;
                        }
                    }
                } finally {
                    $lock->release();
                }
            }
        }

        if ($jobsDispatched > 0) {
            $this->info("CDL Buffer: {$jobsDispatched} job(s) dispatched to queue for async batch processing. Total records: {$flushedCount}");
            $this->info("Worker akan memproses batch insert di background tanpa blocking API response.");
        } else {
            $this->info("CDL Buffer: No data to flush.");
        }
    }
}
