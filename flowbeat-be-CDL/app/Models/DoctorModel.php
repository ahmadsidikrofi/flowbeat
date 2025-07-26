<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorModel extends Model
{
    protected $table = 'doctors';
    protected $guarded = [];

    public function patients()
    {
        return $this->hasMany(PatientModel::class);
    }
}
