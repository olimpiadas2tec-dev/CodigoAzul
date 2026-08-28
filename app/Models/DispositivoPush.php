<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DispositivoPush extends Model
{
    use HasFactory;

    protected $table = 'dispositivos_push';
    protected $primaryKey = 'id_dispositivo';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'token_push',
        'plataforma',
        'fecha_registro',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
    ];

    /**
     * Usuario dueño del dispositivo.
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
