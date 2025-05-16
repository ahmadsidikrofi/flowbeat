<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodPressureModel extends Model
{
    protected $table = 'patient_blood_pressure';
    protected $guarded = [];

    public function patient()
    {
        return $this->belongsTo(PatientModel::class, 'patient_id');
    }
}
