<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PatientModel;
use App\Models\VitalSignModel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VitalSignController extends Controller
{
    public function StoreVitalSign( Request $request, $uuid )
    {
        $patient = PatientModel::where('uuid', $uuid)->first();
        if ($patient && Auth::check()) {
            $bpm = $request->input('bpm');
            $spo2 = $request->input('spo2');
            if ($bpm < 60 || $bpm > 100) {
                $bpm_status = "Tidak Normal";
            } else {
                $bpm_status = "Normal";
            }

            if ($spo2 < 85) {
                $spo2_status = "Tidak Normal";
            } elseif ($spo2 <= 89) {
                $spo2_status = "Cukup Normal";
            } elseif ($spo2 <= 94) {
                $spo2_status = "Cukup Normal";
            } else {
                $spo2_status = "Normal";
            }
            $patient->vitalsData()->create([
                'bpm' => $bpm,
                'spo2' => $spo2,
                'bpm_status' => $bpm_status,
                'spo2_status' => $spo2_status
            ]);
            return response()->json([
                'message' => 'Health data successfully stored',
                'patient_name' => $patient->first_name . " " . $patient->last_name,
                'uuid' => $patient->uuid,
                'bpm' => $bpm,
                'bpm_status' => $bpm_status,
                'spo2' => $spo2,
                'spo2_status' => $spo2_status
            ], 201);
        } else {
            return response()->json(['message' => 'Patient is not authenticate or not found'], 401);
        }
    }

    public function ReadLatestVitalSignData()
    {
        if (Auth::check()) {
            $patient = PatientModel::find(Auth::user()->id);
            $latest_vital = $patient->vitalsData()->orderBy('created_at', 'desc')->first();
            if ($patient) {
                return response()->json([
                    'message' => 'Latest data of this patient',
                    $latest_vital,
                ], 200);
            }
        }
        return response()->json(['message' => 'Patient is not found or not authenticated'], 403);
    }

    public function ReadHistoryVitalSign()
    {
        if (Auth::check()) {
            $patient = PatientModel::find(Auth::user()->id);
            if ($patient) {
                return response()->json([
                    'message' => 'All this patient data has been grabbed',
                    'health_data' => $patient->vitalsData()->latest()->get(),
                ], 200);
            }
        }
    }

    public function DeleteHistoryVitalSignByID( $id )
    {
        if (Auth::check()) {

        }
    }
}
