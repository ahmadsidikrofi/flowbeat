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
        Schema::create('patient_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id'); // Hubungan ke tabel users
            $table->integer('pulse_rate'); // Standarisasi BPM/HR
            $table->float('spo2')->nullable(); // Khusus sensor MAX
            $table->string('device_id'); // 'OMRON_01' atau 'MAX_01'
            $table->enum('quality_flag', ['Verified', 'Experimental']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_records');
    }
};
