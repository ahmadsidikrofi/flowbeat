<?php

namespace App\Services;

use App\Models\BloodPressureModel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CDLService
{
    protected $intervals = [
        'Rendah' => 15,
        'Hipertensi Tinggi' => 15,
        'Normal Tinggi' => 30,
        'Normal' => 60,
    ];
    public function isAllowedToSend($status, $patientId)
    {
        $delay = $this->intervals[$status] ?? 60;
        $lastSent = Cache::get("cdl_last_sent_{$patientId}");

        // Memeriksa apakah data terakhir dikirim dalam waktu yang kurang dari batas waktu tertunda
        if ($lastSent && now()->diffInSeconds($lastSent) < $delay) {
            return false;
        }
        Cache::put("cdl_last_sent_{$patientId}", now(), $delay);
        return true;
    }

    public function calculateStatus($sys, $dia)
    {
        if ($sys < 90 || $dia < 60) return "Rendah";
        if ($sys <= 120 && $dia <= 80) return "Normal";
        if (($sys > 120 && $sys < 140) || ($dia > 80 && $dia < 90)) return "Normal Tinggi";
        return "Hipertensi Tinggi";
    }

    public function bufferData($status, $data)
    {
        $key = "cdl_buffer_{$status}";
        $buffer = Cache::get($key, []);
        $buffer[] = $data;
        if (count($buffer) > 5) {
            $this->flushBufferedData($status);
            return;
        }
        Cache::put($key, $buffer, now()->addMinute(5));

        Log::info("CDL BUFFER - Data buffered for status {$status}", $data);
    }

    public function flushBufferedData($status)
    {
        $key = "cdl_buffer_{$status}";
        $buffer = Cache::pull($key);

        if (!$buffer || count($buffer) === 0) {
            Log::info("CDL FLUSH - No data to flush for status {$status}");
            return;
        }

        foreach ($buffer as $data) {
            BloodPressureModel::create($data);
        }

        Log::info("CDL FLUSH - Flushed " . count($buffer) . " record(s) to DB for status {$status}");
    }
}