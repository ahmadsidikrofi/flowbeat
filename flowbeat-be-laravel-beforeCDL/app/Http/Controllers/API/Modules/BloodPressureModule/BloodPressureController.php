<?php

namespace App\Http\Controllers\API\Modules\BloodPressureModule;

use App\Http\Controllers\Controller;
use App\Models\BloodPressureModel;
use App\Models\PatientModel;
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
        $patient = PatientModel::where('id', $id)->first();
        if ($patient && Auth::check()) {
            $sys = $request->input('sys');
            $dia = $request->input('dia');
            $bpm = $request->input('bpm');
            $mov = $request->input('mov');
            $ihb = $request->input('ihb');
            $device = $request->input('device');

            if ($sys < 90 || $dia < 60) {
                $status = "Rendah";
            } else if ($sys <= 120 && $dia <= 80) {
                $status = "Normal";
            } else if (($sys > 120 && $sys < 140) || ($dia > 80 && $dia < 90)) {
                $status = "Normal Tinggi";
            } else {
                $status = "Hipertensi Tinggi";
            }
            usleep(500000);
            $patient->healthData()->create([
                'sys' => $sys,
                'dia' => $dia,
                'bpm' => $bpm,
                'mov' => $mov,
                'ihb' => $ihb,
                'device' => $device,
                'status' => $status,
                'patient_id' => $patient->id,
            ]);

            return response()->json([
                'message' => 'Health data successfully stored',
                'patient_name' => $patient->first_name . " " . $patient->last_name,
                'uuid' => $patient->uuid,
                'sys' => $sys,
                'dia' => $dia,
                'device' => $device,
                'status' => $status
            ], 201);
        }
        return response()->json(['message' => 'Patient is not authenticate or not found'], 401);
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
