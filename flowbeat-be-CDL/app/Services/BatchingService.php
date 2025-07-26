<?php

namespace App\Services;

use App\Models\BloodPressureModel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BatchingService
{
    const BATCH_CACHE_KEY = 'bp_data_batch_buffer';
    const BATCH_SIZE_THRESHOLD = 80;
    const BATCH_CACHE_TTL_MINUTES = 10;

    public function addDataToBatch(array $data)
    {
        // Ambil buffer yg ada dari cache, atau array kosong jika belum ada
        $batchBuffer = Cache::get(self::BATCH_CACHE_KEY, []);
        $batchBuffer[] = $data; // Tambahkan data baru ke buffer

        Log::info('BatchingService: Data added to batch.', ['data_count' => count($batchBuffer)]);

        // Cek apakah ukuran batch sudah mencapai threshold buat di-flush
        if (count($batchBuffer) >= self::BATCH_SIZE_THRESHOLD) {
            $this->flushBatch(); // Langsung flush kalo udah penuh
        } else {
            // Simpan lagi buffer ke cache dengan TTL
            Cache::put(self::BATCH_CACHE_KEY, $batchBuffer, now()->addMinutes(self::BATCH_CACHE_TTL_MINUTES));
        }
    }

    public function flushBatch()
    {
        $batchProcess = Cache::pull(self::BATCH_CACHE_KEY);

        if (empty($batchProcess)) {
            Log::info('BatchingService: No data to flush.');
            return 0;
        }

        BloodPressureModel::insert($batchProcess);
        $count = count($batchProcess);
        return $count;
    }
}