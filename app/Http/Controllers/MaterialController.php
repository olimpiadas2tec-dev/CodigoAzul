<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = Material::query();

        if ($request->has('tipo') && !empty($request->tipo)) {
            $query->where('tipo', $request->tipo);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:materiales,nombre',
            'tipo' => 'required|in:Medicamento,Insumo',
            'unidad_medida' => 'required|string|max:20',
        ]);

        $material = Material::create($validated);

        return response()->json([
            'message' => 'Material registrado exitosamente',
            'data' => $material
        ], 201);
    }

    public function show($id)
    {
        $material = Material::with('llamados')->findOrFail($id);
        return response()->json($material);
    }

    public function update(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:100|unique:materiales,nombre,' . $id . ',id_material',
            'tipo' => 'sometimes|required|in:Medicamento,Insumo',
            'unidad_medida' => 'sometimes|required|string|max:20',
        ]);

        $material->update($validated);

        return response()->json([
            'message' => 'Material actualizado',
            'data' => $material
        ]);
    }

    public function destroy($id)
    {
        $material = Material::findOrFail($id);
        $material->delete();

        return response()->json(['message' => 'Material eliminado']);
    }
}
