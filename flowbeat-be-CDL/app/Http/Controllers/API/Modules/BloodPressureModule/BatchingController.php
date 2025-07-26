<?php

namespace App\Http\Controllers\API\Modules\BloodPressureModule;

use App\Http\Controllers\Controller;
use App\Models\BloodPressureModel;
use App\Services\BatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class BatchingController extends Controller
{
    protected BatchingService $batchingService;
    public function __construct(BatchingService $batchingService)
    {
        $this->batchingService = $batchingService;
    }
    public function calculateStatus($sys, $dia)
    {
        if ($sys < 90 || $dia < 60) return "Rendah";
        if ($sys <= 120 && $dia <= 80) return "Normal";
        if (($sys > 120 && $sys < 140) || ($dia > 80 && $dia < 90)) return "Normal Tinggi";
        return "Hipertensi Tinggi";
    }

    function BloodPressureBatching( Request $request, $id )
    {
        $validator = Validator::make($request->all(), [
            'sys' => 'required|integer',
            'dia' => 'required|integer',
            'bpm' => 'required|integer',
            'mov' => 'sometimes|boolean',
            'ihb' => 'sometimes|boolean',
            'device' => 'sometimes|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $status = $this->calculateStatus($request->input('sys'), $request->input('dia'));
        $dataToBatch = [
            'patient_id' => $id,
            'sys' => $request->input('sys'),
            'dia' => $request->input('dia'),
            'bpm' => $request->input('bpm'),
            'mov' => $request->input('mov', false),
            'ihb' => $request->input('ihb', false),
            'device' => $request->input('device', 'Unknown'),
            'status' => $status,
            'created_at' => now()
        ];
        $this->batchingService->addDataToBatch($dataToBatch);
        return response()->json([
            'message' => 'Health data received and queued for Batch processing',
            'status' => $status
        ], 202);
    }
}
