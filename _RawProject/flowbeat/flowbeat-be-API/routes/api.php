<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Http\Controllers\ApiAdapterController;
use App\Http\Controllers\MonitoringController;

// Endpoint login, menerbitkan bearer token dengan kemampuan
Route::post('/login', function (Request $request) {
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();
    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Kredensial tidak valid'], 401);
    }

    $token = $user->createToken('flowbeat', ['ingest:write', 'monitoring:read'])
                  ->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type'   => 'Bearer',
    ]);
});

// Gerbang ingest, dijaga autentikasi, rate limit, dan otorisasi kemampuan
Route::post('/v1/ingest', [ApiAdapterController::class, 'ingest'])
    ->middleware(['auth:sanctum', 'throttle:60,1', 'abilities:ingest:write']);

// Endpoint baca untuk pemantauan
Route::get('/v1/monitoring/latest', [MonitoringController::class, 'latest'])
    ->middleware(['auth:sanctum', 'throttle:120,1', 'abilities:monitoring:read']);