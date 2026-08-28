<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use Illuminate\Http\Request;

class PermisoController extends Controller
{
    public function index()
    {
        return response()->json(Permiso::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_permiso' => 'required|string|max:50|unique:permisos,nombre_permiso',
        ]);

        $permiso = Permiso::create($validated);

        return response()->json([
            'message' => 'Permiso creado exitosamente',
            'data' => $permiso
        ], 201);
    }

    public function show($id)
    {
        $permiso = Permiso::with('usuarios')->findOrFail($id);
        return response()->json($permiso);
    }

    public function destroy($id)
    {
        $permiso = Permiso::findOrFail($id);
        $permiso->delete();

        return response()->json(['message' => 'Permiso eliminado']);
    }
}
