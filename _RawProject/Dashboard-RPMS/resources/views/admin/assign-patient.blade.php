@extends('admin.layouts.admin')

@section('title', 'Assign Pasien ke Dokter')
@section('header', 'Assign Pasien ke Dokter')

@section('content')

<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

    {{-- BAGIAN KIRI: FORM ASSIGN --}}
    <div class="space-y-6">
        {{-- Breadcrumb --}}
        <nav class="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <a href="{{ route('admin.dashboard') }}" class="hover:text-blue-600 transition-colors">Dashboard Admin</a>
            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            <span class="text-slate-700 font-medium">Assign Pasien</span>
        </nav>

        {{-- LANGKAH 1: CARI USER BY NOMOR HP --}}
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 class="font-semibold text-slate-800">Langkah 1: Cari User Mobile</h2>
            </div>
            <div class="p-6">
                <p class="text-sm text-slate-500 mb-4">
                    Masukkan <strong>nomor telepon</strong> yang terdaftar di Mobile App untuk melihat profil pasiennya.
                </p>

                <form method="GET" action="{{ route('admin.assign-patient') }}" class="flex items-center gap-3">
                    <div class="relative flex-1">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">phone</span>
                        <input type="tel" name="search_phone" value="{{ $searchPhone }}"
                               class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                               placeholder="Contoh: 081234567890">
                    </div>
                    <button type="submit" class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-colors">
                        Cari Profil
                    </button>
                    @if($searchPhone)
                        <a href="{{ route('admin.assign-patient') }}" class="text-slate-400 hover:text-red-500">
                            <span class="material-symbols-outlined text-[20px]">close</span>
                        </a>
                    @endif
                </form>

                @if($apiError)
                    <div class="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                        <span class="material-symbols-outlined text-[18px]">error</span>
                        {{ $apiError }}
                    </div>
                @endif

                {{-- Konfirmasi user ditemukan --}}
                @if($foundUser)
                    <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                            {{ strtoupper(substr($foundUser['name'], 0, 1)) }}
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-slate-800">{{ $foundUser['name'] }}</p>
                            <p class="text-xs text-slate-400">{{ $foundUser['phone'] }} &bull; API User ID #{{ $foundUser['id_user'] }}</p>
                        </div>
                        <span class="material-symbols-outlined text-emerald-500 ml-auto">check_circle</span>
                    </div>
                @endif
            </div>
        </div>

        {{-- LANGKAH 2: PILIH DOKTER & PROFIL --}}
        @if($searchPhone && !$apiError && $foundUser)
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 bg-emerald-50 flex items-center justify-between">
                    <h2 class="font-semibold text-emerald-800">Langkah 2: Assign Profil ke Dokter</h2>
                    <span class="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                        API ID #{{ $foundUser['id_user'] }}
                    </span>
                </div>
                
                <form method="POST" action="{{ route('admin.assign-patient.store') }}" class="p-6">
                    @csrf
                    <input type="hidden" name="api_user_id" value="{{ $foundUser['id_user'] }}">

                    {{-- Pilih Dokter --}}
                    <div class="mb-6">
                        <label for="doctor_id" class="block text-sm font-semibold text-slate-700 mb-2">Pilih Dokter</label>
                        <div class="relative">
                            <select name="doctor_id" id="doctor_id" required
                                    class="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 appearance-none bg-white">
                                <option value="" disabled selected>-- Pilih Dokter --</option>
                                @foreach($doctors as $doc)
                                    <option value="{{ $doc->id }}">{{ $doc->name }} ({{ $doc->email }})</option>
                                @endforeach
                            </select>
                            <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                        </div>
                    </div>

                    {{-- Pilih Profil --}}
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">Pilih Profil yang akan di-assign</label>
                        @if(count($availableProfiles) === 0)
                            <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-500 text-center">
                                User ini belum memiliki profil pasien.
                            </div>
                        @else
                            <div class="space-y-2 border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto">
                                @foreach($availableProfiles as $profile)
                                    <label class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                                        <input type="checkbox" name="profile_ids[]" value="{{ $profile['id'] }}"
                                               class="profile-checkbox w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
                                        <input type="hidden" name="profile_names[]" value="{{ $profile['name'] ?? 'Profil' }}" class="profile-name-input" disabled>
                                        <div class="flex-1">
                                            <p class="text-sm font-medium text-slate-800">{{ $profile['name'] ?? 'Tanpa Nama' }}</p>
                                            <p class="text-xs text-slate-400">Profile ID: {{ $profile['id'] }} &bull; {{ ucfirst($profile['gender'] ?? '-') }}, {{ $profile['age'] ?? '-' }} thn</p>
                                        </div>
                                    </label>
                                @endforeach
                            </div>
                            <p class="text-xs text-slate-400 mt-2">* Anda bisa memilih lebih dari satu profil.</p>
                        @endif
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-100 text-right">
                        <button type="submit" class="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm">
                            Assign Profil
                        </button>
                    </div>
                </form>
            </div>
        @endif
    </div>


    {{-- BAGIAN KANAN: STATUS ASSIGNMENT --}}
    <div>
        <h3 class="font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-[20px] text-slate-400">list_alt</span>
            Daftar Assign Profil Pasien
        </h3>
        
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            @if(count($assignments) === 0)
                <div class="p-8 text-center text-slate-400 text-sm">
                    Belum ada pasien yang di-assign ke dokter manapun.
                </div>
            @else
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th class="px-5 py-3">Pasien</th>
                            <th class="px-5 py-3">Dokter</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @foreach($assignments as $assign)
                            <tr class="hover:bg-slate-50">
                                <td class="px-5 py-3">
                                    <p class="font-medium text-slate-800">{{ $assign['profile_name'] }}</p>
                                    <p class="text-xs text-slate-400">
                                        API User: #{{ $assign['api_user_id'] }} | Profile: #{{ $assign['profile_id'] }}
                                    </p>
                                </td>
                                <td class="px-5 py-3">
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                            {{ strtoupper(substr($assign['doctor_name'], 0, 1)) }}
                                        </div>
                                        <span class="text-slate-600">{{ $assign['doctor_name'] }}</span>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>
    </div>

</div>

<script>
    // Enable/disable hidden name inputs saat checkbox dicentang
    document.querySelectorAll('.profile-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            // Cari sibling input hidden terdekat
            const nameInput = this.parentElement.querySelector('.profile-name-input');
            if (nameInput) {
                nameInput.disabled = !this.checked;
            }
        });
    });
</script>

@endsection
