<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolProfesional extends Model
{
    use HasFactory;

    protected $table = 'roles_profesionales';
    protected $primaryKey = 'id_rol_profesional';
    public $timestamps = false;

    protected $fillable = [
        'nombre_rol',
    ];

    /**
     * Personal de salud con este rol.
     */
    public function personalSalud()
    {
        return $this->hasMany(PersonalSalud::class, 'id_rol_profesional', 'id_rol_profesional');
    }
}
