<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VitalSignModel extends Model
{
    protected $table = 'oximetry_measurements';
    protected $guarded = [];

    public function patient()
    {
        return $this->belongsTo(PatientModel::class, 'patient_id');
    }
}
