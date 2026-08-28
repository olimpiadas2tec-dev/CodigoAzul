<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $table = 'materiales';
    protected $primaryKey = 'id_material';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'tipo',
        'unidad_medida',
    ];

    /**
     * Llamados en los que se usó este material.
     */
    public function llamados()
    {
        return $this->belongsToMany(Llamado::class, 'llamado_materiales', 'id_material', 'id_llamado')
            ->withPivot('cantidad');
    }
}
