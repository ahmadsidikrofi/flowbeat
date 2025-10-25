<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DeviceController;

Route::get('/', function () {
    return redirect('/omron');
});

Route::get('/', function () {
    // Mengarahkan ke rute dashboard dengan ID 1 sebagai default
    return redirect()->route('device.dashboard', ['id' => 1]);
});

// Rute untuk dashboard utama
// Menggunakan parameter opsional {id} untuk memilih user
// PENTING: Menggunakan '->' (panah) untuk merantai name()
Route::get('/dashboard/{id?}', [DeviceController::class, 'showDashboard'])->name('device.dashboard');

// Route::get('/', function () {
//     return view('welcome');
// });
