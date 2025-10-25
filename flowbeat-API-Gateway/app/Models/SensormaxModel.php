<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensormaxModel extends Model
{
    protected $table = "sensormax";
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, "user_id");
    }
}
