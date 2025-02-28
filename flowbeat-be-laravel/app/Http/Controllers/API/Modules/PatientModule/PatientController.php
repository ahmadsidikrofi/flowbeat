<?php

namespace App\Http\Controllers\API\Modules\PatientModule;

use App\Http\Controllers\Controller;
use App\Models\BloodPressureModel;
use App\Models\PatientModel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function GetAllPatients()
    {
        $patients = PatientModel::with(['healthData' => function ($query) {
            $query->select('patient_id', 'sys', 'dia', 'status', 'created_at')->latest();
        }])->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'patients' => $patients
        ], 200);
    }

    public function GetPatientStatus()
    {
        $cacheKey = 'patient_status'; // Key untuk cache
        $cacheTTL = 100;

        $patientStatus = Cache::remember($cacheKey, $cacheTTL, function () {
            $totalPatient = PatientModel::count();

            $latestHealthData = DB::table('patient_blood_pressure as pbps')
                ->select('pbps.patient_id', 'pbps.status')
                ->whereRaw('pbps.created_at = (SELECT MAX(created_at) FROM patient_blood_pressure WHERE patient_id = pbps.patient_id)')
                // ->groupBy('pbps.patient_id', 'pbps.status')->get();
                ->get();
            $normalPatients = $latestHealthData->where('status', 'Normal')->count();
            $hypertensPatient = $latestHealthData->where('status', 'Hipertensi Tinggi')->count();

            $today = Carbon::today();
            $checkedToday = PatientModel::whereHas('healthData', function ($query) use ($today) {
                $query->whereDate('created_at', $today);
            })->count();
            $notCheckedToday = $totalPatient - $checkedToday;

            return [
                'success' => true,
                'total_patient' => $totalPatient,
                'normal_patient' => $normalPatients,
                'hyper_patient' => $hypertensPatient,
                'not_checked_today' => $notCheckedToday,
                'checked_today' => $checkedToday,
            ];
        });

        return response()->json($patientStatus, 200);
    }

    public function RecentPatients()
    {
        Carbon::setLocale('id');
        $recentPatients = PatientModel::whereHas('healthData')
        ->with(['healthData' => function ($query) {
            $query->latest();
        }])->whereHas('healthData', function ($query) {
            $query->orderBy('created_at', 'desc');
        })->take(5)->get()->map(function ($patient) {
            return [
                'id' => $patient->id,
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'lastBP' => optional($patient->healthData->first())->sys . '/' . optional($patient->healthData->first())->dia,
                'status' => optional($patient->healthData->first())->status,
                'lastVisit' => optional($patient->healthData->first())->created_at
                    ? optional($patient->healthData->first())->created_at->diffForHumans()
                    : '-'
            ];
        });

        return response()->json([
            'success' => true,
            'recent_patients' => $recentPatients,
        ], 200);
    }

    public function GetPatientByUUID($uuid)
    {
        Carbon::setLocale('id');
        $page = request('page', 1);
        $cacheKey = "patient_data_{$uuid}_page_{$page}";

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($uuid) {
            $patient = PatientModel::select('id', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 'gender', 'address', 'height', 'weight', 'created_at')
            ->where('uuid', $uuid)->first();
            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pasien not found'
                ], 404);
            }

            $healthData = BloodPressureModel::where('patient_id', $patient->id)
            ->select('id', 'patient_id', 'sys', 'dia', 'bpm', 'mov', 'ihb', 'status', 'device', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(5);

            $formattedPatient = $patient->toArray();
            $formattedPatient['created_at'] = $patient->created_at->isoFormat('dddd, D MMMM Y');
            $formattedHealthData = $healthData->toArray();
            $formattedHealthData['data'] = collect($formattedHealthData['data'])->map(function ($item) {
                $item['created_at'] = Carbon::parse($item['created_at'])->isoFormat('D MMM Y');
                return $item;
            });
            return response()->json([
                'success' => true,
                'patient_data' => $formattedPatient,
                'health_data' => $formattedHealthData,
                'lastVisit' => optional($healthData->first())->created_at
                    ? Carbon::parse($healthData->first()->created_at)->diffForHumans()
                    : '-'
            ], 200);
        });
    }

    public function DistributionBPStatus()
    {
        $cacheKey = '5_weeks_status_distribution'; // Key untuk cache
        $cacheTTL = 10;
        $statusDistribution = Cache::remember($cacheKey, $cacheTTL, function () {
            $data = [];
            $today = Carbon::today();
            // loop 5 last week
            for ($i = 4; $i >=0; $i--) {
                $startOfWeek = $today->copy()->subWeeks($i)->startOfWeek(); // senin
                $endOfWeek = $today->copy()->subWeeks($i)->endOfWeek(); // minggu
                $normal = PatientModel::whereHas('healthData', function ($query) use ($startOfWeek, $endOfWeek) {
                    $query->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                          ->where('status', 'Normal');
                })->count();

                $prehypertension = PatientModel::whereHas('healthData', function ($query) use ($startOfWeek, $endOfWeek) {
                    $query->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                          ->where('status', 'Normal Tinggi');
                })->count();

                $hypertension = PatientModel::whereHas('healthData', function ($query) use ($startOfWeek, $endOfWeek) {
                    $query->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                          ->where('status', 'Hipertensi Tinggi');
                })->count();
                $data[] = [
                    'date' => $startOfWeek->format('d M'),
                    'normal' => $normal,
                    'Normal Tinggi' => $prehypertension,
                    'Hipertensi Tinggi' => $hypertension,
                ];
            }
            return $data;
        });
        return response()->json([
            'success' => true,
            'data' => $statusDistribution
        ], 200);
    }

    public function GetPatientBloodPressureData($id)
    {
        $cacheKey = "bp_data_{$id}";

        $data = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($id) {
            return PatientModel::with(['healthData' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])->findOrFail($id)->healthData
            ->map(function ($record) {
                return [
                    'date' => $record->created_at->format('Y-m-d'),
                    'systolic' => $record->sys,
                    'diastolic' => $record->dia,
                ];
            });
        });
        return response()->json($data, 200);
    }

    public function GetPatientVitalSignData($id)
    {
        $cacheKey = "vita_sign_data_{$id}";
        $data = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($id) {
            return PatientModel::with(["vitalsData" => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])->findOrFail($id)->vitalsData
            ->map(function ($record) {
                return [
                    'date' => $record->created_at->format('Y-m-d'),
                    'bpm' => $record->bpm,
                    'spo2' => $record->spo2
                ];
            });
        });
        return response()->json($data, 200);
    }
}
