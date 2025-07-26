<?php

namespace App\Http\Controllers\API\Modules\BloodPressureModule;

use App\Events\BloodPressureDataEvent;
use App\Http\Controllers\Controller;
use App\Models\BloodPressureModel;
use App\Models\PatientEWSScore;
use App\Models\PatientModel;
use App\Models\VitalSignModel;
use App\Services\CDL\OmronTransmissionRule;
use App\Services\CDLService;
use App\Services\EWSService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

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
        $rule = new OmronTransmissionRule();
        $cdl = new CDLService($rule);
        $status = $rule->calculateStatus($request->all());
        // $status = $cdl->calculateStatus($request->sys, $request->dia);
        $patient = PatientModel::where('id', $id)->first();
        $requestData = [
            'patient_id' => $id,
            'sys' => $request->sys,
            'dia' => $request->dia,
            'bpm' => $request->bpm,
            'mov' => $request->mov,
            'ihb' => $request->ihb,
            'status' => $status,
            'device' => $request->device,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        if (!$cdl->isAllowedToSend($id, $requestData)) {
            $cdl->bufferData($requestData);
            return response()->json([
                'message' => 'Health Data Saved & Buffered',
                'status' => $status,
                'cache_ttl' => Cache::get("cdl_buffer_{$status}"),
            ], 202);
        }

        $newBpData = $patient->healthData()->create([
            'patient_id' => $id,
            'sys' => $request->sys,
            'dia' => $request->dia,
            'bpm' => $request->bpm,
            'mov' => $request->mov,
            'ihb' => $request->ihb,
            'status' => $status,
            'device' => $request->device,
        ]);

        $cacheKey = "bp_data_{$id}";
        Cache::forget($cacheKey);
        BloodPressureDataEvent::dispatch($id);

        $latestVitalSign = VitalSignModel::where('patient_id', $id)
            ->where('created_at', '>=', now()->subMinutes(15))
            ->latest()
            ->first();

        if ( $latestVitalSign ) {
            $ewsService = new EWSService();
            list( $totalScore, $riskLevel ) = $ewsService->calculateEWS(
                $newBpData->sys,
                $latestVitalSign->bpm,
                $latestVitalSign->spo2
            );
            PatientEWSScore::create([
                'patient_id' => $id,
                'bp_measurement_id' => $newBpData->id,
                'oximetry_measurement_id' => $latestVitalSign->id,
                'total_score' => $totalScore,
                'risk_level' => $riskLevel,
            ]);
        }

        return response()->json([
            'message' => 'Health data successfully stored',
            'patient_name' => $patient->first_name . " " . $patient->last_name,
            'patient_id' => $id,
            'sys' => $newBpData->sys,
            'dia' => $newBpData->dia,
            'status' => $newBpData->status,
            'device' => $newBpData->device,
        ], 201);
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
