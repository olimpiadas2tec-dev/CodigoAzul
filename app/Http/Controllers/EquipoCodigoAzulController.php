<?php

namespace App\Http\Controllers;

use App\Models\EquipoCodigoAzul;
use Illuminate\Http\Request;

class EquipoCodigoAzulController extends Controller
{
    public function index()
    {
        $equipos = EquipoCodigoAzul::with(['integrantes.persona', 'integrantes.rolProfesional', 'turnos'])->get();
        return response()->json($equipos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:equipos_codigo_azul,nombre',
            'integrante_ids' => 'nullable|array',
            'integrante_ids.*' => 'exists:personal_salud,id_personal',
        ]);

        $equipo = EquipoCodigoAzul::create(['nombre' => $validated['nombre']]);

        if (!empty($validated['integrante_ids'])) {
            $equipo->integrantes()->sync($validated['integrante_ids']);
        }

        $equipo->load(['integrantes.persona', 'turnos']);

        return response()->json([
            'message' => 'Equipo de Código Azul creado exitosamente',
            'data' => $equipo
        ], 201);
    }

    public function show($id)
    {
        $equipo = EquipoCodigoAzul::with([
            'integrantes.persona', 'integrantes.rolProfesional',
            'turnos', 'llamados'
        ])->findOrFail($id);

        return response()->json($equipo);
    }

    public function update(Request $request, $id)
    {
        $equipo = EquipoCodigoAzul::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:50|unique:equipos_codigo_azul,nombre,' . $id . ',id_equipo',
            'integrante_ids' => 'nullable|array',
            'integrante_ids.*' => 'exists:personal_salud,id_personal',
        ]);

        if (isset($validated['nombre'])) {
            $equipo->update(['nombre' => $validated['nombre']]);
        }

        if (array_key_exists('integrante_ids', $validated)) {
            $equipo->integrantes()->sync($validated['integrante_ids'] ?? []);
        }

        $equipo->load(['integrantes.persona', 'turnos']);

        return response()->json([
            'message' => 'Equipo actualizado',
            'data' => $equipo
        ]);
    }

    public function destroy($id)
    {
        $equipo = EquipoCodigoAzul::findOrFail($id);
        $equipo->delete();

        return response()->json(['message' => 'Equipo eliminado']);
    }
}
