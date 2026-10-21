<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Api\DoctorApiController;

/*
|--------------------------------------------------------------------------
| API Routes — dipanggil oleh mobile app (tanpa auth session)
|--------------------------------------------------------------------------
*/
Route::prefix('api')->group(function () {
    Route::get('/doctor/by-profile/{profile_id}', [DoctorApiController::class, 'getByProfile']);
});

// Redirect root ke halaman login
Route::get('/', function () {
    return redirect()->route('login');
});

// Halaman Login
Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.submit');

// Logout
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Register (dari form di halaman login)
Route::post('/register', [RegisterController::class, 'register'])->name('register.submit');

/*
|--------------------------------------------------------------------------
| Protected Routes — Dokter (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Patient routes
    Route::get('/patients',              [PatientController::class, 'index'])->name('patients.index');
    Route::get('/patients/{id}/report',  [PatientController::class, 'report'])->name('patients.report');
});

/*
|--------------------------------------------------------------------------
| Admin Routes — hanya admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/',                         [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/create-doctor',            [AdminController::class, 'createDoctorForm'])->name('create-doctor');
    Route::post('/create-doctor',           [AdminController::class, 'storeDoctor'])->name('store-doctor');
    Route::get('/assign-patient',           [AdminController::class, 'assignPatientForm'])->name('assign-patient');
    Route::post('/assign-patient',          [AdminController::class, 'assignPatient'])->name('assign-patient.store');
});

