<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    use HasFactory;

    protected $table = 'personas';
    protected $primaryKey = 'id_persona';
    public $timestamps = false;

    protected $fillable = [
        'apellido',
        'nombre',
        'dni',
        'fecha_nacimiento',
        'telefono',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    protected $appends = ['nombre_completo'];

    public function getNombreCompletoAttribute()
    {
        return "{$this->apellido}, {$this->nombre}";
    }

    /**
     * Si esta persona es personal de salud.
     */
    public function personalSalud()
    {
        return $this->hasOne(PersonalSalud::class, 'id_personal', 'id_persona');
    }

    /**
     * Si esta persona es paciente.
     */
    public function paciente()
    {
        return $this->hasOne(Paciente::class, 'id_paciente', 'id_persona');
    }
}
