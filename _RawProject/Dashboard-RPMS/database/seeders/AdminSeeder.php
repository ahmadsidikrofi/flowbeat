<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed akun administrator RPMS Portal.
     *
     * Kredensial login admin:
     * ┌──────────────────┬─────────────────────────┬────────────────────┐
     * │ Nama             │ Email                   │ Password           │
     * ├──────────────────┼─────────────────────────┼────────────────────┤
     * │ Admin RPMS       │ admin@rpms.test          │ admin123           │
     * └──────────────────┴─────────────────────────┴────────────────────┘
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@rpms.test'],
            [
                'name'              => 'Admin RPMS',
                'email'             => 'admin@rpms.test',
                'password'          => Hash::make('admin123'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ AdminSeeder: Akun admin berhasil dibuat.');
        $this->command->table(
            ['Nama', 'Email', 'Password', 'Role'],
            [['Admin RPMS', 'admin@rpms.test', 'admin123', 'admin']]
        );
    }
}
