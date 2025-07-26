<?php

namespace Database\Seeders;

use App\Models\PatientModel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PatientModel::factory(500)->create();
    }
}
