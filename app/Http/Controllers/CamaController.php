<?php

namespace App\Http\Controllers;

use App\Models\Cama;
use Illuminate\Http\Request;

class CamaController extends Controller
{
    public function index(Request $request)
    {
        $query = Cama::with(['area', 'paciente.persona']);

        if ($request->has('id_area') && !empty($request->id_area)) {
            $query->where('id_area', $request->id_area);
        }

        if ($request->has('estado') && !empty($request->estado)) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero' => 'required|string|max:10',
            'estado' => 'nullable|in:Libre,Ocupada',
            'id_area' => 'required|exists:areas,id_area',
        ]);

        $cama = Cama::create($validated);
        $cama->load('area');

        return response()->json([
            'message' => 'Cama registrada exitosamente',
            'data' => $cama
        ], 201);
    }

    public function show($id)
    {
        $cama = Cama::with(['area', 'paciente.persona'])->findOrFail($id);
        return response()->json($cama);
    }

    public function update(Request $request, $id)
    {
        $cama = Cama::findOrFail($id);

        $validated = $request->validate([
            'numero' => 'sometimes|required|string|max:10',
            'estado' => 'nullable|in:Libre,Ocupada',
            'id_area' => 'sometimes|required|exists:areas,id_area',
        ]);

        $cama->update($validated);
        $cama->load('area');

        return response()->json([
            'message' => 'Cama actualizada',
            'data' => $cama
        ]);
    }

    public function destroy($id)
    {
        $cama = Cama::findOrFail($id);
        $cama->delete();

        return response()->json(['message' => 'Cama eliminada']);
    }
}
