<?php

use App\Http\Controllers\API\AuthController;
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
    Route::get('/auth/patient', function (Request $request) {
        return $request->user();
    });
    Route::put('/auth/patient/{uuid}', [AuthController::class, "UpdatePatientData"]);
    Route::post('/auth/sign-out', [AuthController::class, "SignOutPatient"]);
    Route::post('/patient-health-data/{uuid}', [VitalSignController::class, "StoreHealthData"]);
    Route::get('/track-health-data', [VitalSignController::class, "ReadHistoryHealthData"]);
    Route::get('/latest-health-data', [VitalSignController::class, "ReadLatestHealthData"]);
});

// ==== Website endpoint =====

