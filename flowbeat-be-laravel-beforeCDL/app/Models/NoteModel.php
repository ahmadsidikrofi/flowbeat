<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NoteModel extends Model
{
    protected $table = "notes";
    protected $guarded = [];
    protected $casts = [
        'tags' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(PatientModel::class, 'patient_id');
    }

}
