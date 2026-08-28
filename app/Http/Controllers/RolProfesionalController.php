<?php

namespace App\Http\Controllers;

use App\Models\RolProfesional;
use Illuminate\Http\Request;

class RolProfesionalController extends Controller
{
    public function index()
    {
        $roles = RolProfesional::withCount('personalSalud')->get();
        return response()->json($roles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_rol' => 'required|string|max:50|unique:roles_profesionales,nombre_rol',
        ]);

        $rol = RolProfesional::create($validated);

        return response()->json([
            'message' => 'Rol profesional creado exitosamente',
            'data' => $rol
        ], 201);
    }

    public function show($id)
    {
        $rol = RolProfesional::with('personalSalud.persona')->findOrFail($id);
        return response()->json($rol);
    }

    public function destroy($id)
    {
        $rol = RolProfesional::findOrFail($id);
        $rol->delete();

        return response()->json(['message' => 'Rol profesional eliminado']);
    }
}
