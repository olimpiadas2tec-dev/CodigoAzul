<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index()
    {
        $usuarios = Usuario::with(['personalSalud.persona', 'personalSalud.rolProfesional', 'permisos'])->get();
        return response()->json($usuarios);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_usuario' => 'required|string|max:50|unique:usuarios,nombre_usuario',
            'password' => 'required|string|min:6',
            'rol' => 'required|in:Administrador,Generico',
            'id_personal' => 'nullable|exists:personal_salud,id_personal',
            'permiso_ids' => 'nullable|array',
            'permiso_ids.*' => 'exists:permisos,id_permiso',
        ]);

        $usuario = Usuario::create([
            'nombre_usuario' => $validated['nombre_usuario'],
            'contrasena_hash' => Hash::make($validated['password']),
            'rol' => $validated['rol'],
            'id_personal' => $validated['id_personal'] ?? null,
        ]);

        if (!empty($validated['permiso_ids'])) {
            $usuario->permisos()->sync($validated['permiso_ids']);
        }

        $usuario->load(['personalSalud.persona', 'permisos']);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'data' => $usuario
        ], 201);
    }

    public function show($id)
    {
        $usuario = Usuario::with(['personalSalud.persona', 'personalSalud.rolProfesional', 'permisos'])->findOrFail($id);
        return response()->json($usuario);
    }

    public function update(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);

        $validated = $request->validate([
            'nombre_usuario' => 'sometimes|required|string|max:50|unique:usuarios,nombre_usuario,' . $id . ',id_usuario',
            'password' => 'nullable|string|min:6',
            'rol' => 'sometimes|required|in:Administrador,Generico',
            'id_personal' => 'nullable|exists:personal_salud,id_personal',
            'permiso_ids' => 'nullable|array',
            'permiso_ids.*' => 'exists:permisos,id_permiso',
        ]);

        $updateData = array_intersect_key($validated, array_flip(['nombre_usuario', 'rol', 'id_personal']));
        if (!empty($validated['password'])) {
            $updateData['contrasena_hash'] = Hash::make($validated['password']);
        }

        $usuario->update($updateData);

        if (array_key_exists('permiso_ids', $validated)) {
            $usuario->permisos()->sync($validated['permiso_ids'] ?? []);
        }

        $usuario->load(['personalSalud.persona', 'permisos']);

        return response()->json([
            'message' => 'Usuario actualizado',
            'data' => $usuario
        ]);
    }

    public function destroy($id)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }
}
