<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 'admin' | 'doctor'
            $table->string('role')->default('doctor')->after('email');
            // ID user di mobile API (diisi saat buat akun dokter / assign pasien)
            $table->unsignedInteger('api_user_id')->nullable()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'api_user_id']);
        });
    }
};
