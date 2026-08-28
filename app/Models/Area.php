<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $table = 'areas';
    protected $primaryKey = 'id_area';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'cantidad_camas',
    ];

    /**
     * Camas físicas de esta área.
     */
    public function camas()
    {
        return $this->hasMany(Cama::class, 'id_area', 'id_area');
    }

    /**
     * Pacientes actualmente en esta área.
     */
    public function pacientes()
    {
        return $this->hasMany(Paciente::class, 'id_area', 'id_area');
    }

    /**
     * Personal de salud asignado a esta área.
     */
    public function personalSalud()
    {
        return $this->belongsToMany(PersonalSalud::class, 'personal_areas', 'id_area', 'id_personal');
    }

    /**
     * Orígenes de alerta en esta área.
     */
    public function origenes()
    {
        return $this->hasMany(Origen::class, 'id_area', 'id_area');
    }

    /**
     * Camas disponibles (libres) en esta área.
     */
    public function getCamasDisponiblesAttribute()
    {
        return $this->camas()->where('estado', 'Libre')->count();
    }
}
