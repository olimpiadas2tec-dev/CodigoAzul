<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Turno extends Model
{
    use HasFactory;

    protected $table = 'turnos';
    protected $primaryKey = 'id_turno';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'hora_inicio',
        'hora_fin',
    ];

    /**
     * Equipos asignados a este turno.
     */
    public function equipos()
    {
        return $this->belongsToMany(EquipoCodigoAzul::class, 'equipo_turno_asignacion', 'id_turno', 'id_equipo')
            ->withPivot('fecha_desde', 'fecha_hasta');
    }
}
