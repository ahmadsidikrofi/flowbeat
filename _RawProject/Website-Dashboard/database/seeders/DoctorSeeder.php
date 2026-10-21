<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    /**
     * Seed akun-akun dokter untuk keperluan login ke dashboard RPMS.
     *
     * Kredensial login:
     * ┌─────────────────────────────────┬──────────────────────────┬────────────────────┐
     * │ Nama                            │ Email                    │ Password           │
     * ├─────────────────────────────────┼──────────────────────────┼────────────────────┤
     * │ Dr. Ahmad Fauzi (Admin)         │ dr.fauzi@rpms.test       │ password           │
     * │ Dr. Siti Rahayu                 │ dr.rahayu@rpms.test      │ password           │
     * │ Dr. Budi Santoso                │ dr.santoso@rpms.test     │ password           │
     * │ Dr. Dewi Lestari                │ dr.lestari@rpms.test     │ password           │
     * └─────────────────────────────────┴──────────────────────────┴────────────────────┘
     */
    public function run(): void
    {
        $doctors = [
            [
                'name'              => 'Dr. Ahmad Fauzi',
                'email'             => 'dr.fauzi@rpms.test',
                'password'          => Hash::make('password'),
                'role'              => 'doctor',     // ← Dokter biasa
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Dr. Siti Rahayu',
                'email'             => 'dr.rahayu@rpms.test',
                'password'          => Hash::make('password'),
                'role'              => 'doctor',
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Dr. Budi Santoso',
                'email'             => 'dr.santoso@rpms.test',
                'password'          => Hash::make('password'),
                'role'              => 'doctor',
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Dr. Dewi Lestari',
                'email'             => 'dr.lestari@rpms.test',
                'password'          => Hash::make('password'),
                'role'              => 'doctor',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($doctors as $doctor) {
            // firstOrCreate: tidak membuat duplikat jika email sudah ada
            // updateOrCreate juga memperbarui role jika sudah ada
            User::updateOrCreate(
                ['email' => $doctor['email']],
                $doctor
            );
        }

        $this->command->info('✅ DoctorSeeder: ' . count($doctors) . ' akun dokter berhasil dibuat.');
        $this->command->table(
            ['Nama', 'Email', 'Password'],
            array_map(fn($d) => [$d['name'], $d['email'], 'password'], $doctors)
        );
    }
}
