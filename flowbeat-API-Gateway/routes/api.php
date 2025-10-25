<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeviceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::get('/test', function (Request $request) {
    return response()->json(['message' => 'API is laravel running']);
});

Route::get('/user', [AuthController::class, 'ShowAllUsers']);
Route::get('/user/{id}', [AuthController::class, 'GetPatientDetailsById']);
// endpoint data join dari user dan omron dan max30100

Route::post('/login', [AuthController::class, 'login']);

Route::post('/omron/{id}', [DeviceController::class, 'StoreOmronData']);
Route::get('/omron/{id}', [DeviceController::class, 'GetOmronDataByUserId']);

Route::post('/sensormax/{id}', [DeviceController::class, 'StoreMax30100Data']);
Route::get('/sensormax/{id}', [DeviceController::class, 'GetMax30100DataByUserId']);



Route::post('/vital-sign', [DeviceController::class, 'StoreMax30100Data']);
Route::get('/vital-sign', [DeviceController::class, 'GetMax30100DataByUserId']);

Route::post('/lists', [DeviceController::class, 'StoreListData']);
Route::get('/lists', [DeviceController::class, 'GetListData']);
Route::delete('/lists/{id}', [DeviceController::class, 'DeleteListData']);
Route::put('/lists/{id}', [DeviceController::class, 'UpdateListData']);
Route::get('/lists/{id}', [DeviceController::class, 'GetListDataById']);
