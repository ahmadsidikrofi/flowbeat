<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PatientRecord;

class IngestController extends Controller
{
    public function store(Request $request)
    {
        // FILTERING: Menolak data anomali (BPM 0)
        if ($request->pulse_rate <= 0) {
            return response()->json(['message' => 'Anomali terdeteksi!'], 422);
        }

        // MAPPING & FLAGGING: Menentukan tingkat kepercayaan data
        $isOmron = str_contains(strtolower($request->device_id), 'omron');
        $flag = $isOmron ? 'Verified' : 'Experimental';

        // STORAGE: Simpan ke tabel tunggal (CDM)
        $data = PatientRecord::create([
            'user_id' => $request->user_id,
            'pulse_rate' => $request->pulse_rate,
            'spo2' => $request->spo2,
            'device_id' => $request->device_id,
            'quality_flag' => $flag
        ]);

        return response()->json(['status' => 'Success', 'quality' => $flag], 201);
    }

    // Fungsi untuk mengambil data yang akan ditampilkan di Dashboard
    public function index()
    {
        // Mengambil 10 data terbaru yang sudah masuk ke Canonical Database
        $records = PatientRecord::orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Data rekam medis berhasil ditarik',
            'total' => $records->count(),
            'data' => $records
        ], 200);
    }
}
