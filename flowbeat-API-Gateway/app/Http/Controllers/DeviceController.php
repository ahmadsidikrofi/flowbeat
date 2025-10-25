<?php

namespace App\Http\Controllers;

use App\Models\OmronModel;
use App\Models\SensormaxModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class DeviceController extends Controller
{
    public function omron()
    {
        $response = Http::get('http://10.60.231.253:8000/latest-bp-records');

        if ($response->successful()) {
            $data = $response->json();
            return view('omron', ['data' => $data]);
        } else {
            return view('omron', ['error' => 'Gagal mengambil data dari API.']);
        }
    }

    public function StoreOmronData(Request $request, $id)
    {
        $validated = $request->validate([
            'sys' => 'required|numeric',
            'dia' => 'required|numeric',
            'bpm' => 'required|numeric',
            'ihb' => 'required|boolean',
            'mov' => 'required|boolean',
            'device' => 'required|string',
        ]);

        $userId = User::find($id);
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        if ($userId) {
            $omron = OmronModel::create([
                'user_id' => $userId->id,
                'sys' => $validated['sys'],
                'dia' => $validated['dia'],
                'bpm' => $validated['bpm'],
                'ihb' => $validated['ihb'],
                'mov' => $validated['mov'],
                'device' => $validated['device'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data Omron berhasil disimpan',
                'data' => $omron
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }
    }

    public function GetOmronDataByUserId($id)
    {
        $userId = User::where('id', $id)->first();
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $omronData = OmronModel::where('user_id', $userId->id)->get();
        return response()->json([
            'success' => true,
            'data' => $omronData
        ]);
    }

    ## Menampilkan Data MAX30100 di View

    public function max30100()
    {

        $response = Http::get('http://127.0.0.1:8000/api/vital-sign?hr={{randomHrPatient}}&SpO2={{randomSpO2Patient}}&patient_id={{randomIdPatient}}');

        if ($response->successful()) {
            $data = $response->json();
            return view('sensormax', ['data' => $data]);
        } else {
            return view('sensormax', ['error' => 'Gagal mengambil data dari API MAX30100.']);
        }
    }

    ## Menyimpan Data MAX30100 ke Database

    public function StoreMax30100Data(Request $request, $id)
    {

        // Validasi berdasarkan kolom yang ada di model Sensormax (SpO2 dan bpm)
        $validated = $request->validate([
            'SpO2' => 'required|numeric',
            'hr' => 'required|integer',

        ]);

        // 2. Cari User
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // 3. Simpan Data ke Database
        $sensormax = SensormaxModel::create([
            'user_id' => $user->id,
            'SpO2' => $validated['SpO2'],
            'hr' => $validated['hr'],

        ]);

        // 4. Respon Berhasil
        return response()->json([
            'success' => true,
            'message' => 'Data MAX30100 berhasil disimpan',
            'data' => $sensormax
        ], 201); // 201 Created
    }

    ## Mengambil Data MAX30100 Berdasarkan User ID

    public function GetMax30100DataByUserId($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // Ambil semua data MAX30100 untuk user tersebut
        $sensormaxData = SensormaxModel::where('user_id', $user->id)->get();

        return response()->json([
            'success' => true,
            'data' => $sensormaxData
        ]);
    }


    /**
     * Menampilkan dashboard utama dan mengambil data untuk semua user ID mock.
     * @param int $userId ID User yang sedang aktif.
     */
    public function showDashboard($userId = 1)
    {
        // Mocking user IDs (ganti jika Anda mengambil dari database)
        $mockUserIds = [201, 202, 203, 204, 205];

        $user = User::find($userId);

        $omronData = [];
        $maxData = [];
        $error = null;

        if (!$user) {
            $error = 'User ID ' . $userId . ' tidak ditemukan.';
        } else {
            try {
                // Ambil data Omron
                $omronData = OmronModel::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();

                // Ambil data MAX30100
                $maxData = SensormaxModel::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
            } catch (\Exception $e) {
                $error = "Gagal memuat data dari database: " . $e->getMessage();
            }
        }

        return view('dashboard_device', [
            'userId' => $userId,
            'userIds' => $mockUserIds,
            'omronData' => $omronData,
            'maxData' => $maxData,
            'error' => $error,
        ]);
    }
}
