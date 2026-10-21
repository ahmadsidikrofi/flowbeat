<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoctorProfile;
use Illuminate\Http\JsonResponse;

class DoctorApiController extends Controller
{
    /**
     * GET /api/doctor/by-profile/{profile_id}
     *
     * Kembalikan data dokter pendamping untuk profile tertentu.
     * Dipanggil oleh mobile app (Expo) untuk menampilkan info dokter.
     *
     * Response:
     *   { doctor_name, doctor_phone, profile_id, profile_name }
     */
    public function getByProfile(int $profileId): JsonResponse
    {
        $assignment = DoctorProfile::with('doctor')
            ->where('profile_id', $profileId)
            ->first();

        if (! $assignment || ! $assignment->doctor) {
            return response()->json([
                'doctor_name'  => null,
                'doctor_phone' => null,
                'profile_id'   => $profileId,
                'profile_name' => null,
            ]);
        }

        return response()->json([
            'doctor_name'  => $assignment->doctor->name,
            'doctor_phone' => $assignment->doctor->phone,
            'profile_id'   => $assignment->profile_id,
            'profile_name' => $assignment->profile_name,
        ]);
    }
}
