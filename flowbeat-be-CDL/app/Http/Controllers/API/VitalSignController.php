<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BloodPressureModel;
use App\Models\PatientEWSScore;
use App\Models\PatientModel;
use App\Models\VitalSignModel;
use App\Services\CDL\BpmTransmissionRule;
use App\Services\CDL\Max30100TransmissionRule;
use App\Services\CDL\SpO2TransmissionRule;
use App\Services\CDLService;
use App\Services\EWSService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class VitalSignController extends Controller
{
    public function StoreVitalSign( Request $request, $id )
    {
        $patient = PatientModel::where('id', $id)->first();
        if (!$patient || !Auth::check()) {
            return response()->json(['message' => 'Patient is not authenticated or not found'], 401);
        }
        $bpm = $request->input('bpm');
        $spo2 = $request->input('spo2');

        $requestData = $request->only(['bpm', 'spo2']);
        $bpmRule = new BpmTransmissionRule();
        $spo2Rule = new SpO2TransmissionRule();

        $bpm_status = $bpmRule->calculateStatus($request->all());
        $spo2_status = $spo2Rule->calculateStatus($request->all());

        $cdlForBpm = new CDLService($bpmRule);
        $cdlForSpo2 = new CDLService($spo2Rule);

        $isBpmAllowed = $cdlForBpm->isAllowedToSend($id, $requestData);
        $isSpo2Allowed = $cdlForSpo2->isAllowedToSend($id, $requestData);

        $dbData = [
            'patient_id'  => $id,
            'bpm'         => $requestData['bpm'],
            'spo2'        => $requestData['spo2'],
            'bpm_status'  => $bpm_status,
            'spo2_status' => $spo2_status,
            'created_at'  => now(),
            'updated_at'  => now(),
        ];

        if (!$isBpmAllowed || !$isSpo2Allowed) { // jika salah satu metrik kena delay, maka seluruh paket di buffer
            $bufferStatus = (str_contains($bpm_status, 'Normal') || str_contains($spo2_status, 'Normal')) ? 'VITAL_NORMAL' : 'VITAL_TIDAK_NORMAL';
            $generic_cdl = new CDLService($bpmRule); // Pakai rule apa saja, hanya untuk panggil bufferData
            $generic_cdl->bufferDataWithStatus($bufferStatus, $dbData);

            $currentBuffer = Cache::get("cdl_buffer_{$bufferStatus}", []);

            return response()->json([
                'message' => 'Vital sign data buffered',
                'bpm_status' => $bpm_status,
                'spo2_status' => $spo2_status,
                'cache_ttl' => $currentBuffer,
            ], 202);
        }

        $newVitalSignData = $patient->vitalsData()->create($dbData);

        $latestBloodPressure = BloodPressureModel::where('patient_id', $patient->id)
            ->where('created_at', '>=', now()->subMinutes(15))
            ->latest()
            ->first();

        if ( $latestBloodPressure ) {
            $ewsService = new EWSService();
            list( $totalScore, $riskLevel ) = $ewsService->calculateEWS(
                $latestBloodPressure->sys,
                $newVitalSignData->bpm,
                $newVitalSignData->spo2,
            );
            PatientEWSScore::create([
                'patient_id' => $patient->id,
                'bp_measurement_id' => $latestBloodPressure->id,
                'oximetry_measurement_id' => $newVitalSignData->id,
                'total_score' => $totalScore,
                'risk_level' => $riskLevel
            ]);
        }

        return response()->json([
            'message' => 'Vital sign data successfully stored',
            'patient_name' => $patient->first_name . " " . $patient->last_name,
            'id' => $patient->id,
            'bpm' => $bpm,
            'bpm_status' => $bpm_status,
            'spo2' => $spo2,
            'spo2_status' => $spo2_status
        ], 201);
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
