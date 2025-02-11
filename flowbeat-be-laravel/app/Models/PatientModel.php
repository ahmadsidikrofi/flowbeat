<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class PatientModel extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = "patients";
    protected $guarded = [];

    public function healthData()
    {
        return $this->hasMany(BloodPressureModel::class, 'patient_id');
    }
    public function vitalsData()
    {
        return $this->hasMany(VitalSignModel::class, 'patient_id');
    }
}
