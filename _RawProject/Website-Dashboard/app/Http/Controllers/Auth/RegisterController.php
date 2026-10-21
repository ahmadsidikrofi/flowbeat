<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * Proses registrasi fasilitas / akun baru.
     * (Dipanggil dari form Register di halaman login)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name'    => ['required', 'string', 'max:100'],
            'last_name'     => ['required', 'string', 'max:100'],
            'facility_name' => ['nullable', 'string', 'max:255'],
            'email'         => ['required', 'email', 'unique:users,email'],
            'role'          => ['required', 'in:clinical_director,attending_physician,registered_nurse,system_administrator'],
        ], [
            'first_name.required' => 'Nama depan wajib diisi.',
            'last_name.required'  => 'Nama belakang wajib diisi.',
            'email.required'      => 'Email wajib diisi.',
            'email.email'         => 'Format email tidak valid.',
            'email.unique'        => 'Email ini sudah terdaftar.',
            'role.required'       => 'Pilih level akses.',
            'role.in'             => 'Level akses tidak valid.',
        ]);

        // Buat user baru
        // Catatan: password default digenerate sementara, admin harus set nanti
        // atau bisa ditambahkan field password di form register sesuai kebutuhan
        $user = User::create([
            'name'     => $validated['first_name'] . ' ' . $validated['last_name'],
            'email'    => $validated['email'],
            'password' => Hash::make('ChangeMe@123'), // password sementara
            // Kolom tambahan (perlu migrasi): facility_name, role
            // 'facility_name' => $validated['facility_name'],
            // 'role'          => $validated['role'],
        ]);

        return redirect()->route('login')
            ->with('status', 'Akun berhasil dibuat. Silakan login atau hubungi administrator untuk mengatur password.');
    }
}
