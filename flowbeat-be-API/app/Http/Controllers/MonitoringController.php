<?php

namespace App\Http\Controllers;

use App\Services\VitalSignClassifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonitoringController extends Controller
{
    public function __construct(private VitalSignClassifier $classifier) {}

    /**
     * Menyajikan pengukuran terbaru beserta klasifikasi status,
     * sebagai demonstrasi kesiapan data untuk pemantauan.
     *
     * Sesuaikan nama tabel dan kolom dengan skema Anda bila berbeda.
     */
    public function latest(Request $request): JsonResponse
    {
        // Ambil catatan terbaru dari tabel kanonis.
        // Ganti 'patient_records' bila nama tabel Anda berbeda.
        $records = DB::table('patient_records')
            ->orderByDesc('measured_at')
            ->limit(20)
            ->get();

        $data = $records->map(function ($row) {
            return [
                'device_model' => $row->device_model ?? null,
                'systolic'     => (int) ($row->systolic ?? 0),
                'diastolic'    => (int) ($row->diastolic ?? 0),
                'pulse'        => (int) ($row->pulse_rate ?? $row->pulse ?? 0),
                'measured_at'  => $row->measured_at ?? null,
                'quality_flag' => $row->quality_flag ?? null,
                'status'       => $this->classifier->classify(
                    (int) ($row->systolic ?? 0),
                    (int) ($row->diastolic ?? 0)
                ),
            ];
        });

        return response()->json([
            'status' => 'berhasil',
            'jumlah' => $data->count(),
            'data'   => $data,
        ]);
    }
}
