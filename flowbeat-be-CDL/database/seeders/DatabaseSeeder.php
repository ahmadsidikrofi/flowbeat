<?php

namespace Database\Seeders;

use App\Models\PatientModel;
use App\Models\User;
use Database\Seeders\PatientSeeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        PatientModel::factory(500)->create();
    }
}
