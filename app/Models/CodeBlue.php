<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CodeBlue extends Model
{
    use HasFactory;

    protected $table = 'code_blues';

    protected $fillable = [
        'location',
        'patient',
        'team_leader',
        'status',
        'details',
        'duration_seconds',
        'resolved_at'
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function eventLogs()
    {
        return $this->hasMany(EventLog::class);
    }
}
