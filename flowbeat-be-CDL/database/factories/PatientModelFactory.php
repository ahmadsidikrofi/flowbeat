<?php

namespace Database\Factories;

use App\Models\PatientModel;
use Illuminate\Database\Eloquent\Factories\Factory;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PatientModel>
 */
class PatientModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = Faker::create('id_ID');

        return [
            'uuid' => $faker->uuid,
            'first_name' => $faker->firstName,
            'last_name' => $faker->lastName,
            'phone_number' => '085' . $faker->numberBetween(1000000000, 9999999999),
            'password' => Hash::make('1234567'),
            'address' => $faker->address,
            'height' => $faker->numberBetween(150, 200),
            'weight' => $faker->numberBetween(50, 100),
        ];
    }
}
