<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    use HasFactory;

    protected $table = 'permisos';
    protected $primaryKey = 'id_permiso';
    public $timestamps = false;

    protected $fillable = [
        'nombre_permiso',
    ];

    /**
     * Usuarios que tienen este permiso.
     */
    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class, 'usuario_permisos', 'id_permiso', 'id_usuario');
    }
}
