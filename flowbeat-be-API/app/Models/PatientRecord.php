<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientRecord extends Model
{
    protected $fillable = [
    'device_model', 'systolic', 'diastolic', 'pulse',
    'measured_at', 'quality_flag', 'record_hash', 'processing_ms',
];
//
}
