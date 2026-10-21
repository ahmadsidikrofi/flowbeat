<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DoctorProfile;
use App\Services\MobileApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminController extends Controller
{
    public function __construct(protected MobileApiService $api) {}

    // ─────────────────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────────────────

    public function dashboard()
    {
        $doctors      = User::withCount('assignedProfiles')->where('role', 'doctor')->get();
        $doctorCount  = $doctors->count();
        $totalPatients = DoctorProfile::count();

        // Daftar dokter dengan jumlah pasien masing-masing
        $doctorList = $doctors->map(function ($doc) {
            return [
                'id'            => $doc->id,
                'name'          => $doc->name,
                'email'         => $doc->email,
                'patient_count' => $doc->assigned_profiles_count,
                'initials'      => $this->initials($doc->name),
            ];
        })->values()->toArray();

        return view('admin.dashboard', compact('doctorCount', 'totalPatients', 'doctorList'));
    }

    // ─────────────────────────────────────────────────────────────────────
    // BUAT AKUN DOKTER
    // ─────────────────────────────────────────────────────────────────────

    public function createDoctorForm()
    {
        return view('admin.create-doctor');
    }

    public function storeDoctor(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:100',
            'email'                 => 'required|email|unique:users,email',
            'password'              => ['required', 'confirmed', Password::min(8)],
        ]);

        User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
            'role'        => 'doctor',
        ]);

        return redirect()->route('admin.dashboard')
            ->with('success', "Akun dokter {$data['name']} berhasil dibuat.");
    }

    // ─────────────────────────────────────────────────────────────────────
    // ASSIGN PASIEN
    // ─────────────────────────────────────────────────────────────────────

    public function assignPatientForm(Request $request)
    {
        $doctors = User::where('role', 'doctor')->get();

        // Ambil semua assignment saat ini
        $assignments = DoctorProfile::with('doctor')->get()->map(function ($dp) {
            return [
                'doctor_name'  => $dp->doctor->name,
                'api_user_id'  => $dp->api_user_id,
                'profile_id'   => $dp->profile_id,
                'profile_name' => $dp->profile_name,
            ];
        })->toArray();

        // Jika admin sedang mencari user berdasarkan nomor telepon
        $searchPhone       = $request->query('search_phone');
        $availableProfiles = [];
        $foundUser         = null;   // ['id_user', 'name', 'phone']
        $apiError          = null;

        if ($searchPhone) {
            $result = $this->api->searchUserByPhone(trim($searchPhone));

            if ($result) {
                $foundUser         = [
                    'id_user' => $result['id_user'],
                    'name'    => $result['name'],
                    'phone'   => $result['phone'],
                ];
                $availableProfiles = $result['profiles'] ?? [];
            } else {
                $apiError = "Tidak ada user dengan nomor telepon \"{$searchPhone}\" di Mobile API.";
            }
        }

        return view('admin.assign-patient', compact(
            'doctors', 'assignments',
            'searchPhone', 'foundUser', 'availableProfiles', 'apiError'
        ));
    }


    public function assignPatient(Request $request)
    {
        $data = $request->validate([
            'doctor_id'     => 'required|exists:users,id',
            'api_user_id'   => 'required|integer|min:1',
            'profile_ids'   => 'required|array|min:1',
            'profile_ids.*' => 'required|integer|min:1',
            'profile_names' => 'nullable|array',   // nullable: boleh tidak ada jika JS disabled
        ]);

        $doctor = User::where('id', $data['doctor_id'])->where('role', 'doctor')->firstOrFail();

        // Ambil semua profiles dari API untuk fallback nama
        $apiProfiles = collect($this->api->getProfiles((int) $data['api_user_id']))
                        ->keyBy('id');

        $assignedCount = 0;

        foreach ($data['profile_ids'] as $index => $profileId) {
            // Prioritas nama: dari form → dari API → fallback string
            $profileName = $data['profile_names'][$index]
                ?? ($apiProfiles->get($profileId)['name'] ?? "Profile #{$profileId}");

            // Assign jika belum ada
            DoctorProfile::firstOrCreate([
                'doctor_id'   => $doctor->id,
                'profile_id'  => $profileId,
            ], [
                'api_user_id'  => $data['api_user_id'],
                'profile_name' => $profileName,
            ]);
            $assignedCount++;
        }

        return redirect()->route('admin.assign-patient')
            ->with('success', "{$assignedCount} profil pasien berhasil di-assign ke {$doctor->name}.");
    }

    // ─────────────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────────────

    private function initials(string $name): string
    {
        $words = explode(' ', trim($name));
        $init  = strtoupper(substr($words[0], 0, 1));
        if (count($words) > 1) {
            $init .= strtoupper(substr(end($words), 0, 1));
        }
        return $init;
    }
}
