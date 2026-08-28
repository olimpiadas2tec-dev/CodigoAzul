<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cama extends Model
{
    use HasFactory;

    protected $table = 'camas';
    protected $primaryKey = 'id_cama';
    public $timestamps = false;

    protected $fillable = [
        'numero',
        'estado',
        'id_area',
    ];

    /**
     * Área a la que pertenece la cama.
     */
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    /**
     * Paciente actualmente asignado a esta cama (si la cama está ocupada).
     */
    public function paciente()
    {
        return $this->hasOne(Paciente::class, 'id_cama', 'id_cama');
    }

    /**
     * Si la cama está libre.
     */
    public function estaLibre(): bool
    {
        return $this->estado === 'Libre';
    }
}
