<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BloodPressureController;
use App\Http\Controllers\API\PatientController;
use App\Http\Controllers\API\VitalSignController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return "Pesan Backend API dari Laravel sedang berjalan";
});

// ==== Mobile endpoint ====
Route::post('/auth/sign-up', [AuthController::class, "SignUpPatient"]);
Route::post('/auth/sign-in', [AuthController::class, "SignInPatient"]);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/patient', function (Request $request) { // read patient data
        return $request->user();
    });
    Route::put('/auth/patient/{uuid}', [AuthController::class, "UpdatePatientData"]);
    Route::post('/auth/sign-out', [AuthController::class, "SignOutPatient"]);

    // Blood Pressure Mobile Endpoints
    Route::post('/patient-bp-data/{uuid}', [BloodPressureController::class, "StoreBloodPressure"]);
    Route::get('/latest-bp-data', [BloodPressureController::class, "ReadLatestBloodPressureData"]);
    Route::get('/track-bp-data', [BloodPressureController::class, "ReadHistoryBloodPressure"]);
    Route::get('/track-bp-data/{id}', [BloodPressureController::class, "ReadHistoryBloodPressureByID"]);
    Route::delete('track-bp-data/{id}', [BloodPressureController::class, "DeleteHistoryBloodPressureByID"]);

    // Vital Sign Mobile Endpoints
    Route::post('/patient-vital-data/{uuid}', [VitalSignController::class, "StoreVitalSign"]);
    Route::get('/latest-vital-data', [VitalSignController::class, "ReadLatestVitalSignData"]);
    Route::get('/track-vital-data', [VitalSignController::class, "ReadHistoryVitalSign"]);
    Route::delete('/track-vital-data/{id}', [VitalSignController::class, "DeleteHistoryVitalSignByID"]);
});

// ==== Website endpoint =====
// Blood Pressure WebApp Endpoints
Route::get('/patients', [PatientController::class, "GetAllPatients"]);
Route::get('/patient-status', [PatientController::class, "GetPatientStatus"]);
Route::get('/recent-patients', [PatientController::class, "RecentPatients"]);
Route::get('/status-distribution', [PatientController::class, "DistributionBPStatus"]);
Route::get('/patients/{uuid}', [PatientController::class, "GetPatientByUUID"]);
