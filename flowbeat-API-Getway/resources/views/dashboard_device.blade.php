<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IoT Health Data Dashboard (Final Review)</title>
    <!-- Ganti 'css/app.css' dengan lokasi file Tailwind CSS Anda -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <!-- Style khusus untuk font Inter jika diperlukan, atau pastikan sudah diimport di app.css -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #f8fafc;
            /* bg-gray-50 - Latar belakang sangat terang */
        }

        /* Style untuk bayangan kartu yang lembut dan elegan */
        .card-shadow {
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            transition: all 0.2s ease-in-out;
        }

        .card-shadow:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
    </style>
</head>

<body class="min-h-screen p-4 sm:p-10 selection:bg-indigo-200">

    <div id="app-container" class="max-w-7xl mx-auto">

        {{-- HEADER BARU: Lebih Ramping dan Fokus --}}
        <header class="mb-10 p-6 bg-white rounded-xl card-shadow flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight">
                    <span class="text-indigo-600">Health</span> Metrics Dashboard
                </h1>
                <p class="text-gray-500 text-base mt-1">Lihat data Omron dan MAX30100 Anda secara real-time.</p>
            </div>

            {{-- Dropdown User dipindahkan ke Header untuk Tampilan yang Ramping --}}
            <div class="flex items-center space-x-3">
                <label for="user-select" class="text-base font-semibold text-gray-700 hidden sm:block">
                    Pilih Pengguna:
                </label>
                <select
                    id="user-select"

                    @foreach ($userIds as $id)
                    <option value="{{ $id }}" {{ $id == $userId ? 'selected' : '' }}>User ID: {{ $id }}</option>
                    @endforeach
                </select>
            </div>
        </header>

        <main class="space-y-6">

            {{-- Pesan Error Global --}}
            @if ($error)
            <div class="p-5 bg-red-50 border border-red-300 text-red-700 rounded-xl card-shadow" role="alert">
                <p class="font-extrabold text-xl mb-1">🚨 Kesalahan Pengambilan Data!</p>
                <p>{{ $error }}</p>
            </div>
            @endif

            {{-- 2. Navigasi Tab --}}
            <div class="bg-white rounded-xl card-shadow overflow-hidden border border-gray-100">
                <nav class="flex border-b border-gray-200">
                    <button
                        onclick="showTab('omron')"
                        id="tab-omron"
                        class="tab-button py-3 px-6 inline-flex items-center justify-center border-b-2 font-bold text-base focus:outline-none transition duration-200 ease-in-out w-1/2 border-indigo-600 text-indigo-700 hover:bg-gray-50">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        OMRON (Tekanan Darah)
                    </button>
                    <button
                        onclick="showTab('max30100')"
                        id="tab-max30100"
                        class="tab-button py-3 px-6 inline-flex items-center justify-center border-b-2 font-bold text-base focus:outline-none transition duration-200 ease-in-out w-1/2 border-transparent text-gray-500 hover:text-indigo-600 hover:border-gray-300">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        MAX30100 (SpO2 & Nadi)
                    </button>
                </nav>
            </div>

            {{-- 3. Konten Data --}}
            <div class="mt-6">

                {{-- Konten Omron --}}
                <div id="content-omron" class="tab-content">
                    <div class="overflow-x-auto bg-white p-6 rounded-xl card-shadow border border-gray-100">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-3 flex items-center">
                            Riwayat Pengukuran Omron
                        </h3>
                        @if ($omronData->isEmpty())
                        <p class="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <span class="text-4xl block mb-2">🩸</span> Belum ada data Omron untuk user ini.
                        </p>
                        @else
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Waktu</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Sistolik (mmHg)</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Diastolik (mmHg)</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Nadi (bpm)</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">IHB</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Gerakan</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Device</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-100">
                                @foreach ($omronData as $record)
                                <tr class="hover:bg-indigo-50/50 transition duration-150 ease-in-out">
                                    <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{{ $record->created_at->format('d M Y H:i') }}</td>
                                    <td class="px-6 py-3 whitespace-nowrap text-sm font-semibold">
                                        <span class="p-1 rounded-md {{ $record->systolic > 140 || $record->diastolic > 90 ? 'bg-red-50 text-red-700 border border-red-300' : 'text-green-700' }}">
                                            {{ $record->systolic }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{{ $record->diastolic }}</td>
                                    <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{{ $record->pulse_rate }}</td>
                                    <td class="px-6 py-3 whitespace-nowrap text-sm">
                                        <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full {{ $record->ihb ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800' }}">
                                            {{ $record->ihb ? 'Ya' : 'Tidak' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-3 whitespace-nowrap text-sm">
                                        <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full {{ $record->movement ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800' }}">
                                            {{ $record->movement ? 'Terdeteksi' : 'Stabil' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{{ $record->device }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                        @endif
                    </div>
                </div>

                {{-- Konten MAX30100 --}}
                <div id="content-max30100" class="tab-content hidden">
                    <div class="overflow-x-auto bg-white p-6 rounded-xl card-shadow border border-gray-100">
                        <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-3 flex items-center">
                            Riwayat Pengukuran MAX30100
                        </h3>
                        @if ($maxData->isEmpty())
                        <p class="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <span class="text-4xl block mb-2">❤️</span> Belum ada data MAX30100 untuk user ini.
                        </p>
                        @else
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Waktu</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">SpO2 (%)</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Nadi (bpm)</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-100">
                                @foreach ($maxData as $record)
                                <tr class="hover:bg-indigo-50/50 transition duration-150 ease-in-out">
                                    <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{{ $record->created_at->format('d M Y H:i') }}</td>
                                    <td class="px-6 py-3 whitespace-nowrap text-sm font-bold">
                                        <span class="px-3 py-1 rounded-full text-sm font-extrabold {{ $record->spo2 < 95 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800' }}">
                                            {{ $record->spo2 }}%
                                        </span>
                                    </td>
                                    <td class="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{{ $record->pulse_rate }}</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                        @endif
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Logic untuk mengelola Tab (Omron vs MAX30100)
        document.addEventListener('DOMContentLoaded', (event) => {
            // Tampilkan tab default (Omron)
            showTab('omron');
        });

        function showTab(device) {
            // Hapus style aktif dari semua tombol
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('border-indigo-600', 'text-indigo-700');
                btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-indigo-600', 'hover:border-gray-300');
            });

            // Sembunyikan semua konten
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });

            // Tambahkan style aktif ke tombol yang diklik
            const activeTabButton = document.getElementById(`tab-${device}`);
            activeTabButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-indigo-600', 'hover:border-gray-300');
            activeTabButton.classList.add('border-indigo-600', 'text-indigo-700');

            // Tampilkan konten yang sesuai
            document.getElementById(`content-${device}`).classList.remove('hidden');
        }

        // Logic untuk pemilihan user dilakukan di sisi server (onchange mengarahkan ke URL baru)
        // Lihat onchange di elemen <select> di atas.
    </script>
</body>

</html>