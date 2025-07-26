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
        Schema::create('patient_ews_score', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreignId('bp_measurement_id')->nullable()->constrained('blood_pressure_measurements');
            $table->foreignId('oximetry_measurement_id')->nullable()->constrained('oximetry_measurements');
            $table->integer('total_score');
            $table->enum('risk_level', ['Low', 'Medium', 'High']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_ews_score');
    }
};
