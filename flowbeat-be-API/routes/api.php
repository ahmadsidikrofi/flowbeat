<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Http\Controllers\ApiAdapterController;

// Endpoint login, mengembalikan bearer token
Route::post('/login', function (Request $request) {
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();
    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Kredensial tidak valid'], 401);
    }

    return response()->json([
        'access_token' => $user->createToken('flowbeat')->plainTextToken,
        'token_type'   => 'Bearer',
    ]);
});

// Gerbang ingest kini dijaga token Sanctum
Route::post('/v1/ingest', [ApiAdapterController::class, 'ingest'])
    ->middleware('auth:sanctum');

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

// Route::post('/v1/ingest', [ApiAdapterController::class, 'ingest']);