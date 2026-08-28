<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalSalud extends Model
{
    use HasFactory;

    protected $table = 'personal_salud';
    protected $primaryKey = 'id_personal';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_personal',
        'id_rol_profesional',
    ];

    /**
     * Datos de identidad de la persona.
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'id_personal', 'id_persona');
    }

    /**
     * Rol profesional (Intensivista, Cardiólogo, etc.).
     */
    public function rolProfesional()
    {
        return $this->belongsTo(RolProfesional::class, 'id_rol_profesional', 'id_rol_profesional');
    }

    /**
     * Áreas asignadas al personal.
     */
    public function areas()
    {
        return $this->belongsToMany(Area::class, 'personal_areas', 'id_personal', 'id_area');
    }

    /**
     * Pacientes asignados a este profesional.
     */
    public function pacientes()
    {
        return $this->hasMany(Paciente::class, 'id_personal', 'id_personal');
    }

    /**
     * Cuenta de usuario del sistema.
     */
    public function usuario()
    {
        return $this->hasOne(Usuario::class, 'id_personal', 'id_personal');
    }

    /**
     * Equipos de Código Azul a los que pertenece.
     */
    public function equipos()
    {
        return $this->belongsToMany(EquipoCodigoAzul::class, 'equipo_codigo_azul_personal', 'id_personal', 'id_equipo')
            ->withPivot('rol_en_equipo');
    }

    /**
     * Llamados activados por este profesional.
     */
    public function llamadosActivados()
    {
        return $this->hasMany(Llamado::class, 'id_personal_activacion', 'id_personal');
    }

    /**
     * Accessor: nombre completo delegado a persona.
     */
    public function getNombreCompletoAttribute()
    {
        return $this->persona ? $this->persona->nombre_completo : '';
    }
}
