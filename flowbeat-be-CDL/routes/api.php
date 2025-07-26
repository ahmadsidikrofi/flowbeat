<?php

use App\Events\BloodPressureDataEvent;
use App\Http\Controllers\API\Modules\AuthModule\AuthController;
use App\Http\Controllers\API\Modules\BloodPressureModule\BatchingController;
use App\Http\Controllers\API\Modules\BloodPressureModule\BloodPressureController;
use App\Http\Controllers\API\Modules\BloodPressureModule\RateLimitController;
use App\Http\Controllers\API\Modules\NoteModule\NotesController;
use App\Http\Controllers\API\Modules\PatientModule\PatientController;
use App\Http\Controllers\API\VitalSignController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

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
    // Route::post('/transmission-bp-rate-limit/{id}', [RateLimitController::class, "BloodPressureRateLimit"]);
    // Route::post('/transmission-bp-batching/{id}', [BatchingController::class, "BloodPressureBatching"]);

    Route::post('/patients/{id}/blood-pressures', [BloodPressureController::class, "StoreBloodPressure"]);
    Route::get('/patients/blood-pressure-data/latest', [BloodPressureController::class, "ReadLatestBloodPressureData"]); // latest data bp
    Route::get('/patients/blood-pressures', [BloodPressureController::class, "ReadHistoryBloodPressure"]); // track-bp-data
    Route::get('/patients/blood-pressures/{id}', [BloodPressureController::class, "ReadHistoryBloodPressureByID"]); // track-bp-data/{id}
    Route::delete('/patients/blood-pressures/{id}', [BloodPressureController::class, "DeleteHistoryBloodPressureByID"]);

    // Vital Sign Mobile Endpoints
    // Route::post('/patients/{uuid}/vital-signs', [VitalSignController::class, "StoreVitalSign"]);
    Route::post('/patients/{id}/vital-signs', [VitalSignController::class, "StoreVitalSign"]);
    Route::get('/patients/vital-signs/latest', [VitalSignController::class, "ReadLatestVitalSignData"]); // /latest-vital-data
    Route::get('/patients/vital-signs', [VitalSignController::class, "ReadHistoryVitalSign"]); // (Menggantikan /track-vital-data)
    Route::delete('/patients/vital-signs/{id}', [VitalSignController::class, "DeleteHistoryVitalSignByID"]);

    // Notes Mobile Endpoints
    Route::get('/patients/notes', [NotesController::class, "ReadHistoryNotes"]);
    Route::get('/patients/notes/{id}', [NotesController::class, "ReadNoteByID"]);
});

// ==== Website endpoint =====
// Blood Pressure WebApp Endpoints
Route::get('/patients', [PatientController::class, "GetAllPatients"]);
Route::get('/patients/summary/status', [PatientController::class, "GetPatientStatus"]);
Route::get('/patients/recent', [PatientController::class, "RecentPatients"]);
Route::get('/patients/statistics/distribution', [PatientController::class, "DistributionBPStatus"]);
Route::get('/patients/{uuid}', [PatientController::class, "GetPatientByUUID"]);
Route::get('/patients/{id}/blood-pressures', [PatientController::class, "GetPatientBloodPressureData"]);
Route::get('/patients/{id}/vital-signs', [PatientController::class, "GetPatientVitalSignData"]);

// Notes Endoints
Route::get('/patients/{uuid}/notes', [NotesController::class, "GetNotesByUUID"]);
Route::post('/patients/{uuid}/notes', [NotesController::class, "StoreNote"]);
Route::put('/notes/{id}', [NotesController::class, "EditNote"]);
Route::delete('/notes/{id}', [NotesController::class, "DeleteNote"]);

Route::get('/debug-cache', function () {
    return Cache::get('cdl_buffer_Normal');
});

Route::get('/test-broadcasting', function (Request $request) {
    Log::info('Test broadcasting route accessed');
    return response()->json([
        'status' => 'success',
        'message' => 'Broadcasting test endpoint working',
        'headers' => $request->headers->all(),
    ]);
});

Route::post('/broadcasting/auth', function (Request $request) {
    Log::info('=== DEBUGGING TOKEN ===');
    Log::info('Token: ' . $request->header('Authorization'));
    Log::info('Channel: ' . $request->input('channel_name'));
    if ($request->has('socket_id') && $request->has('channel_name')) {
    } else {
        Log::error('❌ Missing required parameters');
        return response()->json(['error' => 'Missing socket_id or channel_name'], 400);
    }

    try {
        $result = Broadcast::auth($request);
        Log::info('✅ Broadcast auth successful');
        Log::info('Result: ', is_array($result) ? $result : ['result' => $result]);
        return $result;
    } catch (\Exception $e) {
        Log::error('❌ Broadcast auth failed: ' . $e->getMessage());
        Log::error('Exception class: ' . get_class($e));
        Log::error('Stack trace: ' . $e->getTraceAsString());
        return response()->json(['error' => 'Authentication failed', 'message' => $e->getMessage()], 403);
    }
});

Route::options('/broadcasting/auth', function () {
    return response()->json([], 200, [
        'Access-Control-Allow-Origin' => env('FRONTEND_URL', 'http://localhost:3001'),
        'Access-Control-Allow-Methods' => 'POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials' => 'true',
    ]);
});
