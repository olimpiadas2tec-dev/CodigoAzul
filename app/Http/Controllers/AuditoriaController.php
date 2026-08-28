<?php

namespace App\Http\Controllers;

use App\Models\Auditoria;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    /**
     * Listar registros de auditoría con filtros opcionales.
     */
    public function index(Request $request)
    {
        $query = Auditoria::with('usuario');

        if ($request->has('id_usuario') && !empty($request->id_usuario)) {
            $query->where('id_usuario', $request->id_usuario);
        }

        if ($request->has('entidad_afectada') && !empty($request->entidad_afectada)) {
            $query->where('entidad_afectada', $request->entidad_afectada);
        }

        if ($request->has('fecha_desde') && !empty($request->fecha_desde)) {
            $query->where('fecha_hora', '>=', $request->fecha_desde);
        }

        if ($request->has('fecha_hasta') && !empty($request->fecha_hasta)) {
            $query->where('fecha_hora', '<=', $request->fecha_hasta);
        }

        $registros = $query->orderBy('fecha_hora', 'desc')->limit(500)->get();

        return response()->json($registros);
    }

    /**
     * Ver detalle de un registro de auditoría.
     */
    public function show($id)
    {
        $registro = Auditoria::with('usuario')->findOrFail($id);
        return response()->json($registro);
    }
}
