<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Origen extends Model
{
    use HasFactory;

    protected $table = 'origenes';
    protected $primaryKey = 'id_origen';
    public $timestamps = false;

    protected $fillable = [
        'descripcion',
        'id_area',
    ];

    /**
     * Área a la que pertenece este origen.
     */
    public function area()
    {
        return $this->belongsTo(Area::class, 'id_area', 'id_area');
    }

    /**
     * Llamados generados desde este origen.
     */
    public function llamados()
    {
        return $this->hasMany(Llamado::class, 'id_origen', 'id_origen');
    }
}
