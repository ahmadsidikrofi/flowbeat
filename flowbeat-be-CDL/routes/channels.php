<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request as LaravelRequest;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Log;

Broadcast::channel('patient.{patientId}', function (LaravelRequest $laravelRequest, $patientId) {
    Log::info('=== CHANNEL AUTH DEBUG ===');
    Log::info('Patient ID: ' . $patientId);
    try {
        $authHeader = $laravelRequest->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return false;
        }

        $token = substr($authHeader, 7);
        Log::info('Token extracted: ' . substr($token, 0, 50) . '...');

        // Decode JWT token
        $decoded = JWT::decode($token, new Key(env('CLERK_PUBLIC_KEY'), 'RS256'));
        Log::info('JWT decoded successfully');
        Log::info('Decoded payload: ' . json_encode($decoded));

        // Verify token claims
        if (!$decoded || !isset($decoded->sub)) {
            return false;
        }

        // Optional: Add more validation
        if (isset($decoded->exp) && $decoded->exp < time()) {
            Log::error('Token expired');
            return false;
        }

        return true;

    } catch (\Exception $e) {
        Log::error('JWT authentication error: ' . $e->getMessage());
        return false;
    }
});

// Broadcast::channel('patient.{patientId}', function (DoctorModel $doctor, $patientId) {
//     return $doctor->patients()->where('id', $patientId)->exists();
// });
