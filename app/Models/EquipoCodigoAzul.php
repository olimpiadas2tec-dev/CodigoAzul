<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipoCodigoAzul extends Model
{
    use HasFactory;

    protected $table = 'equipos_codigo_azul';
    protected $primaryKey = 'id_equipo';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
    ];

    /**
     * Integrantes del equipo de respuesta.
     */
    public function integrantes()
    {
        return $this->belongsToMany(PersonalSalud::class, 'equipo_codigo_azul_personal', 'id_equipo', 'id_personal')
            ->withPivot('rol_en_equipo');
    }

    /**
     * Turnos asignados a este equipo.
     */
    public function turnos()
    {
        return $this->belongsToMany(Turno::class, 'equipo_turno_asignacion', 'id_equipo', 'id_turno')
            ->withPivot('fecha_desde', 'fecha_hasta');
    }

    /**
     * Llamados respondidos por este equipo.
     */
    public function llamados()
    {
        return $this->hasMany(Llamado::class, 'id_equipo_respuesta', 'id_equipo');
    }
}
