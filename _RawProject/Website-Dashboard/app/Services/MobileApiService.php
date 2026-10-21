<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

/**
 * MobileApiService
 *
 * Kelas terpusat untuk mengakses API backend mobile RPMS.
 * Base URL dibaca dari .env → RPMS_API_BASE_URL
 *
 * Endpoint yang digunakan:
 *   GET /api/profiles/{id_user}              → daftar profile (nama, umur, gender, tb, bb)
 *   GET /api/measurements/{id_profile}        → semua riwayat pengukuran
 *   GET /api/measurements/{id_profile}/latest → pengukuran terbaru
 */
class MobileApiService
{
    protected string $baseUrl;
    protected int    $timeout;
    protected string $serviceKey;

    public function __construct()
    {
        $this->baseUrl    = rtrim(config('services.rpms_api.base_url', 'http://10.20.31.178:8000'), '/');
        $this->timeout    = (int) config('services.rpms_api.timeout', 10);
        $this->serviceKey = (string) config('services.rpms_api.service_key', '');
    }

    /**
     * Helper: buat HTTP request dengan service key header.
     */
    protected function apiRequest()
    {
        return Http::timeout($this->timeout)
            ->withHeaders(['X-Service-Key' => $this->serviceKey]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROFILES
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Ambil semua profile milik satu user.
     *
     * Response tiap item:
     *   id, id_user, name, age, gender, tb, bb, image_url
     *
     * @return array<int, array>  kosong jika error / tidak ada data
     */
    public function getProfiles(int $idUser): array
    {
        try {
            $response = $this->apiRequest()
                ->get("{$this->baseUrl}/api/profiles/{$idUser}");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            // 404 = belum ada profile, kembalikan array kosong
            if ($response->status() === 404) {
                return [];
            }

            Log::warning('MobileApi: getProfiles error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return [];

        } catch (\Exception $e) {
            Log::error('MobileApi: getProfiles exception', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Ambil satu profile berdasarkan id_user dan id_profile.
     * Wrapper atas getProfiles() — cocok untuk halaman detail.
     *
     * @return array|null  null jika tidak ditemukan
     */
    public function getProfile(int $idUser, int $idProfile): ?array
    {
        $profiles = $this->getProfiles($idUser);
        foreach ($profiles as $profile) {
            if ((int) $profile['id'] === $idProfile) {
                return $profile;
            }
        }
        return null;
    }

    /**
     * Cari user Mobile API berdasarkan nomor telepon.
     * Memanggil: GET /api/profiles/search?phone={phone}
     *
     * Response berisi:
     *   id_user, name, phone, profiles: [{ id, id_user, name, age, gender, tb, bb, image_url }]
     *
     * @return array|null  null jika tidak ditemukan atau error
     */
    public function searchUserByPhone(string $phone): ?array
    {
        try {
            $response = $this->apiRequest()
                ->get("{$this->baseUrl}/api/profiles/search", ['phone' => $phone]);

            if ($response->successful()) {
                return $response->json();
            }

            if ($response->status() === 404) {
                return null; // Nomor tidak ditemukan
            }

            Log::warning('MobileApi: searchUserByPhone error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return null;

        } catch (\Exception $e) {
            Log::error('MobileApi: searchUserByPhone exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MEASUREMENTS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Ambil semua riwayat pengukuran untuk satu profile.
     *
     * Response tiap item:
     *   id, id_user, id_profile, bpm, dia, sys, ihb, mov, datetime
     *
     * @return array<int, array>
     */
    public function getMeasurements(int $idProfile): array
    {
        try {
            $response = $this->apiRequest()
                ->get("{$this->baseUrl}/api/measurements/{$idProfile}");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            if ($response->status() === 404) {
                return [];
            }

            Log::warning('MobileApi: getMeasurements error', [
                'status' => $response->status(),
            ]);
            return [];

        } catch (\Exception $e) {
            Log::error('MobileApi: getMeasurements exception', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Ambil pengukuran terbaru saja untuk satu profile.
     *
     * @return array|null  null jika belum ada data atau error
     */
    public function getLatestMeasurement(int $idProfile): ?array
    {
        try {
            $response = $this->apiRequest()
                ->get("{$this->baseUrl}/api/measurements/{$idProfile}/latest");

            if ($response->successful()) {
                return $response->json();
            }

            return null;

        } catch (\Exception $e) {
            Log::error('MobileApi: getLatestMeasurement exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Ambil semua riwayat pengukuran SpO2 untuk satu profile.
     * Response tiap item: id, id_user, id_profile, spo2, bpm, temperature, blood_sugar, datetime
     *
     * @return array<int, array>
     */
    public function getSpo2Measurements(int $idProfile): array
    {
        try {
            $response = $this->apiRequest()
                ->get("{$this->baseUrl}/api/measurements/{$idProfile}/spo2");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            if ($response->status() === 404) {
                return [];
            }

            Log::warning('MobileApi: getSpo2Measurements error', [
                'status' => $response->status(),
            ]);
            return [];

        } catch (\Exception $e) {
            Log::error('MobileApi: getSpo2Measurements exception', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Ambil pengukuran SpO2 terbaru satu profile.
     * Response berisi: spo2, bpm, temperature, blood_sugar, datetime
     *
     * @return array|null  null jika belum ada data atau error
     */
    public function getLatestSpo2Measurement(int $idProfile): ?array
    {
        try {
            $response = $this->apiRequest()
                ->get("{$this->baseUrl}/api/measurements/{$idProfile}/spo2/latest");

            if ($response->successful()) {
                return $response->json();
            }

            return null;

        } catch (\Exception $e) {
            Log::error('MobileApi: getLatestSpo2Measurement exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER: ambil semua profiles + pengukuran terbaru sekaligus
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Kembalikan daftar pasien yang di-assign lengkap dengan vital terbaru.
     * Cocok untuk ditampilkan di tabel dashboard.
     *
     * @param  array  $assignedProfiles  Array of ['api_user_id' => x, 'profile_id' => y, 'profile_name' => z]
     */
    public function getAssignedPatientsWithLatestVitals(array $assignedProfiles): array
    {
        $result = [];

        foreach ($assignedProfiles as $dp) {
            $profile = $this->getProfile((int) $dp['api_user_id'], (int) $dp['profile_id']);
            if (!$profile) continue;

            $latest     = $this->getLatestMeasurement((int) $profile['id']);
            $latestSpo2 = $this->getLatestSpo2Measurement((int) $profile['id']);
            
            $result[] = [
                'id'          => $profile['id'],
                'name'        => $dp['profile_name'] ?? $profile['name'],
                'age'         => $profile['age'],
                'gender'      => $profile['gender'],
                'tb'          => $profile['tb'],
                'bb'          => $profile['bb'],
                'image_url'   => $profile['image_url'] ?? null,
                'latest'      => $latest,
                'latest_spo2' => $latestSpo2,
            ];
        }

        return $result;
    }
}
