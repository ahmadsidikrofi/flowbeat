<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\IngestController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

// Jalur utama API Adapter Tesis Anda
Route::post('/v1/ingest', [IngestController::class, 'store']);

// Jalur untuk Dashboard mengambil data
Route::get('/v1/records', [IngestController::class, 'index']);
