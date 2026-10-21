@extends('admin.layouts.admin')

@section('title', 'Buat Akun Dokter')
@section('header', 'Buat Akun Dokter Baru')

@section('content')

<div class="max-w-2xl mx-auto">

    {{-- Breadcrumb --}}
    <nav class="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <a href="{{ route('admin.dashboard') }}" class="hover:text-blue-600 transition-colors">Dashboard Admin</a>
        <span class="material-symbols-outlined text-[16px]">chevron_right</span>
        <span class="text-slate-700 font-medium">Buat Akun Dokter</span>
    </nav>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {{-- Header --}}
        <div class="flex items-center gap-4 px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50">
            <div class="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-white text-[24px]">person_add</span>
            </div>
            <div>
                <h2 class="font-bold text-slate-800 text-lg">Akun Dokter Baru</h2>
                <p class="text-sm text-slate-500">Isi form berikut untuk membuat akun dokter di RPMS Portal</p>
            </div>
        </div>

        {{-- Form --}}
        <form method="POST" action="{{ route('admin.store-doctor') }}" class="px-8 py-6 space-y-5">
            @csrf

            {{-- Nama --}}
            <div>
                <label for="name" class="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">badge</span>
                    <input type="text" id="name" name="name" value="{{ old('name') }}"
                           class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all @error('name') border-red-400 @enderror"
                           placeholder="Dr. Ahmad Fauzi" required>
                </div>
                @error('name')
                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                @enderror
            </div>

            {{-- Email --}}
            <div>
                <label for="email" class="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                    <input type="email" id="email" name="email" value="{{ old('email') }}"
                           class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all @error('email') border-red-400 @enderror"
                           placeholder="dr.ahmad@rpms.test" required>
                </div>
                @error('email')
                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                @enderror
            </div>

            {{-- Nomor HP --}}
            <div>
                <label for="phone" class="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nomor HP <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">phone</span>
                    <input type="tel" id="phone" name="phone" value="{{ old('phone') }}"
                           class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all @error('phone') border-red-400 @enderror"
                           placeholder="081234567890" required>
                </div>
                <p class="mt-1 text-xs text-slate-400">Format: 08xxx (akan otomatis dikonversi ke format WhatsApp)</p>
                @error('phone')
                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                @enderror
            </div>

            {{-- Password --}}
            <div>
                <label for="password" class="block text-sm font-semibold text-slate-700 mb-1.5">
                    Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                    <input type="password" id="password" name="password"
                           class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all @error('password') border-red-400 @enderror"
                           placeholder="Minimal 8 karakter" required>
                </div>
                @error('password')
                    <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                @enderror
            </div>

            {{-- Konfirmasi Password --}}
            <div>
                <label for="password_confirmation" class="block text-sm font-semibold text-slate-700 mb-1.5">
                    Konfirmasi Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock_reset</span>
                    <input type="password" id="password_confirmation" name="password_confirmation"
                           class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           placeholder="Ulangi password" required>
                </div>
            </div>

            {{-- Buttons --}}
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <a href="{{ route('admin.dashboard') }}"
                   class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                    <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                    Kembali
                </a>
                <button type="submit"
                        class="flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 active:scale-95 transition-all shadow-sm">
                    <span class="material-symbols-outlined text-[18px]">person_add</span>
                    Buat Akun Dokter
                </button>
            </div>
        </form>
    </div>
</div>

@endsection
