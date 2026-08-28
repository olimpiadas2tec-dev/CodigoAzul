<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    use HasFactory;

    protected $table = 'pacientes';
    protected $primaryKey = 'id_paciente';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_paciente',
        'grupo_sanguineo',
        'alergias',
        'diagnostico',
        'fecha_ingreso',
        'fecha_alta',
        'activo',
        'id_cama',
        'id_area',
        'id_personal',
    ];

    protected $casts = [
        'fecha_ingreso' => 'date',
        'fecha_alta' => 'date',
        'activo' => 'boolean',
    ];

    protected $appends = ['nombre_completo'];

    /**
     * Datos de identidad de la persona (nombre, apellido, dni, etc.).
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'id_paciente', 'id_persona');
    }

    /**
     * Nombre completo delegado a la tabla personas.
     */
    public function getNombreCompletoAttribute()
    {
        return $this->persona ? $this->persona->nombre_completo : '';
    }

    /**
     * Área hospitalaria asignada.
     */
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    /**
     * Cama asignada.
     */
    public function cama()
    {
        return $this->belongsTo(Cama::class, 'id_cama', 'id_cama');
    }

    /**
     * Profesional de salud responsable.
     */
    public function personalSalud()
    {
        return $this->belongsTo(PersonalSalud::class, 'id_personal', 'id_personal');
    }

    /**
     * Llamados de código azul del paciente.
     */
    public function llamados()
    {
        return $this->hasMany(Llamado::class, 'id_paciente', 'id_paciente');
    }
}
