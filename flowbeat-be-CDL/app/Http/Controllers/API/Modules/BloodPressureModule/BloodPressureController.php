<?php

namespace App\Http\Controllers\API\Modules\BloodPressureModule;

use App\Http\Controllers\Controller;
use App\Models\BloodPressureModel;
use App\Models\PatientModel;
use App\Services\CDLService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class BloodPressureController extends Controller
{
    // public function StoreBloodPressure( Request $request, $uuid)
    // {
    //     $patient = PatientModel::where('uuid', $uuid)->first();
    //     if ($patient && Auth::check()) {
    //         $sys = $request->input('sys');
    //         $dia = $request->input('dia');
    //         $bpm = $request->input('bpm');
    //         $mov = $request->input('mov');
    //         $ihb = $request->input('ihb');
    //         $device = $request->input('device');

    //         if ($sys < 90 || $dia < 60) {
    //             $status = "Rendah";
    //         } else if ($sys <= 120 && $dia <= 80) {
    //             $status = "Normal";
    //         } else if (($sys > 120 && $sys < 140) || ($dia > 80 && $dia < 90)) {
    //             $status = "Normal Tinggi";
    //         } else {
    //             $status = "Hipertensi Tinggi";
    //         }

    //         $patient->healthData()->create([
    //             'sys' => $sys,
    //             'dia' => $dia,
    //             'bpm' => $bpm,
    //             'mov' => $mov,
    //             'ihb' => $ihb,
    //             'device' => $device,
    //             'status' => $status,
    //             'patient_id' => $patient->id,
    //         ]);
    //         Cache::forget("bp_data_{$patient->id}");
    //         return response()->json([
    //             'message' => 'Health data successfully stored',
    //             'patient_name' => $patient->first_name . " " . $patient->last_name,
    //             'uuid' => $patient->uuid,
    //             'sys' => $sys,
    //             'dia' => $dia,
    //             'device' => $device,
    //             'status' => $status
    //         ], 201);
    //     }
    //     return response()->json(['message' => 'Patient is not authenticate or not found'], 401);
    // }

    public function StoreBloodPressure( Request $request, $id )
    {
        $cdl = new CDLService();
        $status = $cdl->calculateStatus($request->sys, $request->dia);
        if (!$cdl->isAllowedToSend($status, $id)) {
            $cdl->bufferData($status, [
                'patient_id' => $id,
                'sys' => $request->sys,
                'dia' => $request->dia,
                'bpm' => $request->bpm,
                'mov' => $request->mov,
                'ihb' => $request->ihb,
                'status' => $status,
                'device' => $request->device,
                'created_at' => now(),
            ]);
            return response()->json(['message' => 'Health Data Saved & Buffered'], 202);
        }

        BloodPressureModel::create([
            'patient_id' => $id,
            'sys' => $request->sys,
            'dia' => $request->dia,
            'bpm' => $request->bpm,
            'mov' => $request->mov,
            'ihb' => $request->ihb,
            'status' => $status,
            'device' => $request->device,
        ]);
        return response()->json([
            'message' => 'Health data successfully stored',
            'sys' => $request->sys,
            'dia' => $request->dia,
            'status' => $status,
            'device' => $request->device,
        ], 201);
    }

    public function calculateStatus($sys, $dia)
    {
        if ($sys < 90 || $dia < 60) return "Rendah";
        if ($sys <= 120 && $dia <= 80) return "Normal";
        if (($sys > 120 && $sys < 140) || ($dia > 80 && $dia < 90)) return "Normal Tinggi";
        return "Hipertensi Tinggi";
    }

    public function BloodPressureRateLimit( Request $request, $id )
    {
        $status = $this->calculateStatus($request->sys, $request->dia);
        $delay = 10;
        $lastSent = Cache::get("rate_limit_last_sent_{$id}");

        if ($lastSent && now()->diffInSeconds($lastSent) < $delay) {
            return response()->json([
                'message' => 'Rate limit active. Data not stored.',
                'status' => $status
            ], 429);
        }
        Cache::put("rate_limit_last_sent_{$id}", now(), $delay);
        return response()->json([
                'message' => 'Rate limit inactive. Data stored.',
                'status' => $status
            ], 201);
    }

    public function BloodPressureBatching( Request $request, $id )
    {
        $batchSize = 5;
        $status = $this->calculateStatus($request->sys, $request->dia);
        $key = "batch_buffer_{$status}";
        $buffer = Cache::get($key, []);
        $buffer[] = [
            'patient_id' => $id,
            'sys' => $request->sys,
            'dia' => $request->dia,
            'bpm' => $request->bpm,
            'mov' => $request->mov,
            'ihb' => $request->ihb,
            'status' => $status,
            'device' => $request->device,
            'created_at' => now(),
        ];

        Cache::put($key, $buffer, now()->addMinutes(5));
        // Log::info("BATCHING ONLY - Buffered data for status {$status}", $buffer);

        // Flush jika buffer sudah cukup
        if (count($buffer) >= $batchSize) {
            $this->flushBuffer($key, $status);
        }

        return response()->json([
            'message' => 'Data buffered for batching.',
            'status' => $status,
        ], 202);
    }

    protected function flushBuffer($key, $status)
    {
        $buffer = Cache::pull($key);

        if (!$buffer || count($buffer) === 0) {
            // Log::info("BATCHING ONLY - No data to flush for status {$status}");
            return;
        }

        foreach ($buffer as $data) {
            BloodPressureModel::create($data);
        }

        // Log::info("BATCHING ONLY - Flushed " . count($buffer) . " record(s) to DB for status {$status}");
    }

    public function ReadLatestBloodPressureData()
    {
        if (Auth::check()) {
            $patient = PatientModel::find(Auth::user()->id);
            $latest_bp = $patient->healthData()->orderBy('created_at', 'desc')->first();
            if ($patient) {
                return response()->json([
                    'message' => 'Latest blood pressure of this patient',
                    $latest_bp,
                ], 200);
            }
        }
        return response()->json(['message' => 'Patient is not found or not authenticated'], 403);
    }

    public function ReadHistoryBloodPressure()
    {
        if (Auth::check()) {
            $patient = PatientModel::find(Auth::user()->id);
            if ($patient) {
                return response()->json([
                    'message' => 'All this patient data has been grabbed',
                    'health_data' => $patient->healthData()->latest()->get(),
                ], 200);
            }
        }
        return response()->json(['message' => 'Patient is not found or not authenticated'], 403);
    }

    public function ReadHistoryBloodPressureByID( $id )
    {
        if (Auth::check()) {
            $healthData = BloodPressureModel::find($id);
            if ($healthData) {
                return response()->json([
                    'success' => true,
                    'health_data' => $healthData,
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'health_data' => 'No such data exist',
                ], 404);
            }
        }
    }

    public function DeleteHistoryBloodPressureByID( $id )
    {
        if (Auth::check()) {
            $healthData = BloodPressureModel::find($id);
            $healthData->delete();
            if ($healthData) {
                return response()->json([
                    'success' => true,
                    'message' => 'Health data has been deleted',
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No such data exist',
                ], 404);
            }
        }
    }
}
