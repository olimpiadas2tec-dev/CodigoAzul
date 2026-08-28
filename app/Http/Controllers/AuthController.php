<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Authenticate user and issue API Token.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'nombre_usuario' => 'required|string',
            'contrasena_hash' => 'nullable|string',
            'password' => 'nullable|string',
        ]);

        $username = $validated['nombre_usuario'];
        $password = $validated['contrasena_hash'] ?? $validated['password'] ?? '';

        if (empty($password)) {
            return response()->json(['message' => 'Debe ingresar la contraseña.'], 422);
        }

        $usuario = Usuario::with([
            'personalSalud.persona',
            'personalSalud.rolProfesional',
            'personalSalud.areas',
            'permisos'
        ])->where('nombre_usuario', $username)->first();

        if (!$usuario || !Hash::check($password, $usuario->contrasena_hash)) {
            return response()->json(['message' => 'Credenciales inválidas. Compruebe el usuario y la contraseña.'], 401);
        }

        // Issue Sanctum token
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Bienvenido al Sistema de Gestión de Código Azul',
            'token' => $token,
            'token_type' => 'Bearer',
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'nombre_usuario' => $usuario->nombre_usuario,
                'rol' => $usuario->rol,
                'personal_salud' => $usuario->personalSalud,
                'permisos' => $usuario->permisos->pluck('nombre_permiso'),
            ]
        ], 200);
    }

    /**
     * Logout and revoke token.
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    /**
     * Get profile of authenticated user.
     */
    public function me(Request $request)
    {
        $usuario = $request->user();
        if (!$usuario) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $usuario->load([
            'personalSalud.persona',
            'personalSalud.rolProfesional',
            'personalSalud.areas',
            'permisos'
        ]);

        return response()->json([
            'usuario' => $usuario
        ]);
    }
}
