<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_profiles', function (Blueprint $table) {
            $table->id();
            // ID dokter di tabel users lokal
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            // ID user di Mobile API (pemilik profil)
            $table->unsignedInteger('api_user_id');
            // ID profil spesifik di Mobile API
            $table->unsignedInteger('profile_id');
            // Simpan nama profil agar bisa ditampilkan tanpa hit API
            $table->string('profile_name')->nullable();
            $table->timestamps();

            // Satu dokter tidak bisa di-assign ke profil yang sama dua kali
            $table->unique(['doctor_id', 'profile_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_profiles');
    }
};
