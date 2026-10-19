<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientRecord extends Model
{
    protected $fillable = ['user_id', 'pulse_rate', 'spo2', 'device_id', 'quality_flag'];
}
