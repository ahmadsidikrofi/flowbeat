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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->index('uuid');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone_number')->unique();
            $table->timestamp('phone_number_verified_at')->nullable();
            $table->string('password');
            $table->string('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('age')->nullable();
            $table->string('address')->nullable();
            $table->string('height')->nullable();
            $table->string('weight')->nullable();
            // $table->boolean('is_login')->default(0);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
