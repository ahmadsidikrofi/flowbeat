<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnomalyLog extends Model
{
    protected $fillable = ['device_model', 'raw_payload', 'reason'];//
}
