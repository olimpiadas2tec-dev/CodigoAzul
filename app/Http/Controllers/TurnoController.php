<?php

namespace App\Http\Controllers;

use App\Models\Turno;
use Illuminate\Http\Request;

class TurnoController extends Controller
{
    public function index()
    {
        $turnos = Turno::with('equipos')->get();
        return response()->json($turnos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:30|unique:turnos,nombre',
            'hora_inicio' => 'required|date_format:H:i:s',
            'hora_fin' => 'required|date_format:H:i:s',
        ]);

        $turno = Turno::create($validated);

        return response()->json([
            'message' => 'Turno creado exitosamente',
            'data' => $turno
        ], 201);
    }

    public function show($id)
    {
        $turno = Turno::with('equipos.integrantes.persona')->findOrFail($id);
        return response()->json($turno);
    }

    public function update(Request $request, $id)
    {
        $turno = Turno::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:30|unique:turnos,nombre,' . $id . ',id_turno',
            'hora_inicio' => 'sometimes|required|date_format:H:i:s',
            'hora_fin' => 'sometimes|required|date_format:H:i:s',
        ]);

        $turno->update($validated);

        return response()->json([
            'message' => 'Turno actualizado',
            'data' => $turno
        ]);
    }

    public function destroy($id)
    {
        $turno = Turno::findOrFail($id);
        $turno->delete();

        return response()->json(['message' => 'Turno eliminado']);
    }
}
