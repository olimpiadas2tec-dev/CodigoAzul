<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auditoria extends Model
{
    use HasFactory;

    protected $table = 'auditoria';
    protected $primaryKey = 'id_auditoria';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'accion',
        'entidad_afectada',
        'id_entidad_afectada',
        'fecha_hora',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
    ];

    /**
     * Usuario que realizó la acción.
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Registrar una acción de auditoría.
     */
    public static function registrar(?int $idUsuario, string $accion, string $entidad, int $idEntidad): self
    {
        return static::create([
            'id_usuario' => $idUsuario,
            'accion' => $accion,
            'entidad_afectada' => $entidad,
            'id_entidad_afectada' => $idEntidad,
            'fecha_hora' => now(),
        ]);
    }
}
