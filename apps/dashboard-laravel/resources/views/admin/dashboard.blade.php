@extends('admin.layouts.admin')

@section('title', 'Admin Dashboard')
@section('header', 'Admin Dashboard — RPMS Portal')

@section('content')

{{-- STATS CARDS --}}
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

    {{-- Total Dokter --}}
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
        <div class="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-blue-700 text-[28px]">stethoscope</span>
        </div>
        <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Total Dokter</p>
            <p class="text-4xl font-bold text-blue-700">{{ $doctorCount }}</p>
        </div>
    </div>

    {{-- Total Pasien --}}
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
        <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-emerald-700 text-[28px]">group</span>
        </div>
        <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Total Pasien</p>
            <p class="text-4xl font-bold text-emerald-700">{{ $totalPatients }}</p>
        </div>
    </div>

    {{-- Quick Actions --}}
    <div class="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Aksi Cepat</p>
        <div class="space-y-2">
            <a href="{{ route('admin.create-doctor') }}"
               class="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                <span class="material-symbols-outlined text-[18px]">person_add</span>
                Buat Akun Dokter
            </a>
            <a href="{{ route('admin.assign-patient') }}"
               class="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                <span class="material-symbols-outlined text-[18px]">assignment_ind</span>
                Assign Pasien
            </a>
        </div>
    </div>

</div>

{{-- DOCTOR LIST TABLE --}}
<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
            <h3 class="font-semibold text-slate-800">Daftar Dokter</h3>
            <p class="text-xs text-slate-400 mt-0.5">Semua akun dokter yang terdaftar di sistem</p>
        </div>
        <a href="{{ route('admin.create-doctor') }}"
           class="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-all">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Tambah Dokter
        </a>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                    <th class="px-6 py-3">Nama Dokter</th>
                    <th class="px-6 py-3">Email</th>
                    <th class="px-6 py-3 text-center">Jumlah Pasien</th>
                    <th class="px-6 py-3 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse($doctorList as $doc)
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                    {{ $doc['initials'] }}
                                </div>
                                <span class="font-medium text-slate-800">{{ $doc['name'] }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-slate-500">{{ $doc['email'] }}</td>
                        <td class="px-6 py-4 text-center">
                            <span class="inline-flex items-center gap-1 {{ $doc['patient_count'] > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-50' }} px-2 py-0.5 rounded text-xs font-bold">
                                <span class="material-symbols-outlined text-[14px]">person</span>
                                {{ $doc['patient_count'] }} pasien
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <a href="{{ route('admin.assign-patient') }}"
                               class="text-blue-600 hover:underline text-xs font-medium">
                                Assign Pasien
                            </a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-400 text-sm">
                            Belum ada akun dokter.
                            <a href="{{ route('admin.create-doctor') }}" class="text-blue-600 hover:underline ml-1">Buat sekarang</a>
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

@endsection
