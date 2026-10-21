<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Tampilkan halaman login.
     */
    public function showLogin()
    {
        // Jika sudah login, redirect sesuai role
        if (Auth::check()) {
            return redirect()->to(Auth::user()->isAdmin()
                ? route('admin.dashboard')
                : route('dashboard')
            );
        }

        return view('auth.login');
    }

    /**
     * Proses autentikasi login.
     */
    public function login(Request $request)
    {
        // Validasi input
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
        ], [
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 6 karakter.',
        ]);

        $remember = $request->boolean('remember');

        // Coba autentikasi
        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();

            // Redirect sesuai role
            $redirectTo = Auth::user()->isAdmin()
                ? route('admin.dashboard')
                : route('dashboard');

            return redirect()->intended($redirectTo)
                ->with('status', 'Login berhasil. Selamat datang!');
        }

        // Gagal login
        return back()
            ->withInput($request->only('email', 'remember'))
            ->withErrors([
                'email' => 'Email atau password yang Anda masukkan salah.',
            ]);
    }

    /**
     * Proses logout.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')
            ->with('status', 'Anda telah berhasil logout.');
    }
}
