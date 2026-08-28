<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'nombre_usuario',
        'contrasena_hash',
        'rol',
        'id_personal',
    ];

    protected $hidden = [
        'contrasena_hash',
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
        'ultima_actualizacion' => 'datetime',
    ];

    public function getAuthPassword()
    {
        return $this->contrasena_hash;
    }

    /**
     * Personal de salud vinculado a esta cuenta.
     */
    public function personalSalud()
    {
        return $this->belongsTo(PersonalSalud::class, 'id_personal', 'id_personal');
    }

    /**
     * Permisos habilitados para este usuario.
     */
    public function permisos()
    {
        return $this->belongsToMany(Permiso::class, 'usuario_permisos', 'id_usuario', 'id_permiso');
    }

    /**
     * Llamados atendidos por este usuario.
     */
    public function llamadosAtendidos()
    {
        return $this->hasMany(Llamado::class, 'id_usuario_atencion', 'id_usuario');
    }

    /**
     * Dispositivos registrados para notificaciones push.
     */
    public function dispositivosPush()
    {
        return $this->hasMany(DispositivoPush::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Registros de auditoría generados por este usuario.
     */
    public function auditorias()
    {
        return $this->hasMany(Auditoria::class, 'id_usuario', 'id_usuario');
    }

    public function esAdministrador(): bool
    {
        return $this->rol === 'Administrador';
    }

    /**
     * Verificar si el usuario tiene un permiso específico.
     */
    public function tienePermiso(string $nombrePermiso): bool
    {
        return $this->permisos()->where('nombre_permiso', $nombrePermiso)->exists();
    }
}
