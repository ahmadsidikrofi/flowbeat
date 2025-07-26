<?php

namespace App\Http\Controllers\API\Modules\BloodPressureModule;

use App\Http\Controllers\Controller;
use App\Models\BloodPressureModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class RateLimitController extends Controller
{
    public function calculateStatus($sys, $dia)
    {
        if ($sys < 90 || $dia < 60) return "Rendah";
        if ($sys <= 120 && $dia <= 80) return "Normal";
        if (($sys > 120 && $sys < 140) || ($dia > 80 && $dia < 90)) return "Normal Tinggi";
        return "Hipertensi Tinggi";
    }
    public function BloodPressureRateLimit( Request $request, $id )
    {
        $validator = Validator::make($request->all(), [
            'sys' => 'required|integer|min:0|max:200',
            'dia' => 'required|integer|min:0|max:200',
            'bpm' => 'required|integer|min:0|max:200',
            'mov' => 'sometimes|boolean',
            'ihb' => 'sometimes|boolean',
            'device' => 'sometimes|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        $status = $this->calculateStatus($request->sys, $request->dia);
        $delay = 15;
        $lastSent = Cache::get("rate_limit_last_sent_{$id}");

        if ($lastSent && now()->diffInSeconds($lastSent) < $delay) {
            return response()->json([
                'message' => 'Rate limit active. Data not stored.',
                'status' => $status
            ], 429);
        }
        Cache::put("rate_limit_last_sent_{$id}", now(), $delay);
        $data = BloodPressureModel::create([
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
            'message' => 'Rate limit inactive. Data stored.',
            'data' => $data
        ], 201);
    }
}
