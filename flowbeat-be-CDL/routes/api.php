<?php

use App\Http\Controllers\API\Modules\AuthModule\AuthController;
use App\Http\Controllers\API\Modules\BloodPressureModule\BloodPressureController;
use App\Http\Controllers\API\Modules\NoteModule\NotesController;
use App\Http\Controllers\API\Modules\PatientModule\PatientController;
use App\Http\Controllers\API\VitalSignController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(["message" => "Backend of Flowbeat is now running so fast"]);
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
    // Transmission Data Strategy Endpoints
    Route::post('/patient-bp-data/{id}', [BloodPressureController::class, "StoreBloodPressure"]);
    Route::post('/patient-bp-rate-limit/{id}', [BloodPressureController::class, "BloodPressureRateLimit"]);
    Route::post('/patient-bp-batching/{id}', [BloodPressureController::class, "BloodPressureBatching"]);

    Route::get('/latest-bp-data', [BloodPressureController::class, "ReadLatestBloodPressureData"]);
    Route::get('/track-bp-data', [BloodPressureController::class, "ReadHistoryBloodPressure"]);
    Route::get('/track-bp-data/{id}', [BloodPressureController::class, "ReadHistoryBloodPressureByID"]);
    Route::delete('track-bp-data/{id}', [BloodPressureController::class, "DeleteHistoryBloodPressureByID"]);

    // Vital Sign Mobile Endpoints
    Route::post('/patient-vital-data/{uuid}', [VitalSignController::class, "StoreVitalSign"]);
    Route::get('/latest-vital-data', [VitalSignController::class, "ReadLatestVitalSignData"]);
    Route::get('/track-vital-data', [VitalSignController::class, "ReadHistoryVitalSign"]);
    Route::delete('/track-vital-data/{id}', [VitalSignController::class, "DeleteHistoryVitalSignByID"]);

    // Notes Mobile Endpoints
    Route::get('/notes-patient', [NotesController::class, "ReadHistoryNotes"]);
    Route::get('/notes-patient/{id}', [NotesController::class, "ReadNoteByID"]);
});

// ==== Website endpoint =====
// Blood Pressure WebApp Endpoints
Route::get('/patients', [PatientController::class, "GetAllPatients"]);
Route::get('/patient-status', [PatientController::class, "GetPatientStatus"]);
Route::get('/recent-patients', [PatientController::class, "RecentPatients"]);
Route::get('/status-distribution', [PatientController::class, "DistributionBPStatus"]);
Route::get('/patients/{uuid}', [PatientController::class, "GetPatientByUUID"]);
Route::get('/blood-pressure-data/{id}', [PatientController::class, "GetPatientBloodPressureData"]);
Route::get('/vital-sign-data/{id}', [PatientController::class, "GetPatientVitalSignData"]);

// Notes Endoints
Route::get('/notes/{uuid}', [NotesController::class, "GetNotesByUUID"]);
Route::post('/notes/{uuid}', [NotesController::class, "StoreNote"]);
Route::put('/notes/{id}', [NotesController::class, "EditNote"]);
Route::delete('/notes/{id}', [NotesController::class, "DeleteNote"]);

Route::get('/debug-cache', function () {
    return Cache::get('cdl_buffer_Normal');
});