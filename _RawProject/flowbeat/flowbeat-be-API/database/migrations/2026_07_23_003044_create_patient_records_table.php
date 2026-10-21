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
            $table->string('device_model');
            $table->unsignedSmallInteger('systolic');
            $table->unsignedSmallInteger('diastolic');
            $table->unsignedSmallInteger('pulse');
            $table->timestamp('measured_at');
            $table->enum('quality_flag', ['Verified', 'Experimental']);
            $table->string('record_hash', 64)->unique();
            $table->unsignedInteger('processing_ms')->nullable();
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
