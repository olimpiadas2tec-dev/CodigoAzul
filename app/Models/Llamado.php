<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Llamado extends Model
{
    use HasFactory;

    protected $table = 'llamados';
    protected $primaryKey = 'id_llamado';
    public $timestamps = false;

    protected $fillable = [
        'fecha_hora_activacion',
        'fecha_hora_atencion',
        'estado',
        'resultado',
        'id_paciente',
        'id_origen',
        'id_personal_activacion',
        'id_usuario_atencion',
        'id_equipo_respuesta',
    ];

    protected $casts = [
        'fecha_hora_activacion' => 'datetime',
        'fecha_hora_atencion' => 'datetime',
        'fecha_creacion' => 'datetime',
    ];

    protected $appends = ['tiempo_respuesta_segundos'];

    /**
     * Paciente del llamado.
     */
    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente', 'id_paciente');
    }

    /**
     * Origen de la alerta.
     */
    public function origen()
    {
        return $this->belongsTo(Origen::class, 'id_origen', 'id_origen');
    }

    /**
     * Personal que activó el llamado.
     */
    public function personalActivacion()
    {
        return $this->belongsTo(PersonalSalud::class, 'id_personal_activacion', 'id_personal');
    }

    /**
     * Usuario que atendió el llamado.
     */
    public function usuarioAtencion()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario_atencion', 'id_usuario');
    }

    /**
     * Equipo de respuesta asignado.
     */
    public function equipoRespuesta()
    {
        return $this->belongsTo(EquipoCodigoAzul::class, 'id_equipo_respuesta', 'id_equipo');
    }

    /**
     * Materiales utilizados en este llamado.
     */
    public function materiales()
    {
        return $this->belongsToMany(Material::class, 'llamado_materiales', 'id_llamado', 'id_material')
            ->withPivot('cantidad');
    }

    // --- Scopes ---

    public function scopeSinAtender($query)
    {
        return $query->where('estado', 'Sin atender');
    }

    public function scopeAtendidos($query)
    {
        return $query->where('estado', 'Atendido');
    }

    // --- Accessors ---

    public function getTiempoRespuestaSegundosAttribute()
    {
        if (!$this->fecha_hora_atencion || !$this->fecha_hora_activacion) {
            return null;
        }

        return $this->fecha_hora_activacion->diffInSeconds($this->fecha_hora_atencion);
    }
}
