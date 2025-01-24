<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PatientModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VitalSignController extends Controller
{
    public function StoreHealthData( Request $request, $uuid)
    {
        $patient = PatientModel::where('uuid', $uuid)->first();
        if ($patient && Auth::check()) {
            $patient->healthData()->create([
                'sys' => $request->input('sys'),
                'dia' => $request->input('dia'),
                'bpm' => $request->input('bpm'),
                'mov' => $request->input('mov'),
                'ihb' => $request->input('ihb'),
                'patient_id' => $patient->id,
            ]);
            return response()->json([
                'message' => 'Health data successfully stored',
                'patient_name' => $patient->first_name . " " . $patient->last_name,
                'uuid' => $patient->uuid,
            ], 201);
        }
        return response()->json(['Patient is not authenticate or not found'], 403);
    }

    public function ReadHistoryHealthData()
    {
        if (Auth::check()) {
            $patient = PatientModel::find(Auth::user()->id);
            if ($patient) {
                return response()->json([
                    'message' => 'All this patient data has been grabbed',
                    $patient->healthData,
                ], 200);
            }
        }
        return response()->json(['message' => 'Patient is not found or not authenticated'], 403);
    }

    public function ReadLatestHealthData()
    {
        if (Auth::check()) {
            $patient = PatientModel::find(Auth::user()->id);
            $latest_health = $patient->healthData()->orderBy('created_at', 'desc')->first();
            if ($patient) {
                return response()->json([
                    'message' => 'Latest data of this patient',
                    $latest_health,
                ], 200);
            }
        }
        return response()->json(['message' => 'Patient is not found or not authenticated'], 403);
    }
}
