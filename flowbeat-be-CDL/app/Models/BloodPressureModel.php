<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodPressureModel extends Model
{
    protected $table = 'blood_pressure_measurements';
    protected $guarded = [];

    public function patient()
    {
        return $this->belongsTo(PatientModel::class, 'patient_id');
    }
}
