<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_blue_id',
        'event_type',
        'description',
        'elapsed_seconds'
    ];

    public function codeBlue()
    {
        return $this->belongsTo(CodeBlue::class);
    }
}
