<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Auditoria;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index()
    {
        $areas = Area::with(['camas', 'origenes'])->get();

        $areas->each(function ($area) {
            $totalCamas = $area->camas->count();
            $camasLibres = $area->camas->where('estado', 'Libre')->count();
            $camasOcupadas = $area->camas->where('estado', 'Ocupada')->count();

            $area->total_camas_registradas = $totalCamas;
            $area->camas_libres = $camasLibres;
            $area->camas_ocupadas = $camasOcupadas;
            $area->camas_disponibles = $camasLibres;
        });

        return response()->json($areas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:areas,nombre',
            'cantidad_camas' => 'required|integer|min:0',
        ]);

        $area = Area::create($validated);

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Alta de Área', 'areas', $area->id_area);

        return response()->json([
            'message' => 'Área registrada exitosamente',
            'data' => $area
        ], 201);
    }

    public function show($id)
    {
        $area = Area::with([
            'camas.paciente.persona',
            'pacientes' => function ($q) {
                $q->where('activo', true)->with(['persona', 'personalSalud.persona', 'cama']);
            },
            'personalSalud.persona',
            'personalSalud.rolProfesional',
            'origenes'
        ])->findOrFail($id);

        $totalCamas = $area->camas->count();
        $camasLibres = $area->camas->where('estado', 'Libre')->count();
        $area->camas_disponibles = $camasLibres;
        $area->camas_ocupadas = $area->camas->where('estado', 'Ocupada')->count();

        return response()->json($area);
    }

    public function update(Request $request, $id)
    {
        $area = Area::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:50|unique:areas,nombre,' . $id . ',id_area',
            'cantidad_camas' => 'sometimes|required|integer|min:0',
        ]);

        $area->update($validated);

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Modificación de Área', 'areas', $area->id_area);

        return response()->json([
            'message' => 'Área actualizada',
            'data' => $area
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $area = Area::findOrFail($id);

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Baja de Área', 'areas', $id);

        $area->delete();

        return response()->json(['message' => 'Área eliminada']);
    }
}
