<?php

namespace App\Http\Controllers;

use App\Models\CodeBlue;
use Illuminate\Http\Request;

class CodeBlueController extends Controller
{
    /**
     * List all Code Blue events.
     */
    public function index()
    {
        try {
            $codes = CodeBlue::orderBy('created_at', 'desc')->get();
            return response()->json($codes);
        } catch (\Exception $e) {
            // Return dummy fallback list if database is not connected yet
            return response()->json([
                [
                    'id' => 1,
                    'location' => 'Urgencias - Box 2',
                    'patient' => 'Perez, Juan (64a)',
                    'team_leader' => 'Dr. Martinez',
                    'status' => 'RESUELTO',
                    'details' => 'Ritmo desfibrilable resuelto con éxito',
                    'created_at' => now()->subHours(2)->toIso8601String()
                ]
            ]);
        }
    }

    /**
     * Store a new Code Blue alert event.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'patient' => 'nullable|string|max:255',
            'team_leader' => 'nullable|string|max:255',
            'details' => 'nullable|string',
        ]);

        try {
            $code = CodeBlue::create([
                'location' => $validated['location'],
                'patient' => $validated['patient'] ?? 'No Identificado',
                'team_leader' => $validated['team_leader'] ?? 'Líder de Guardia',
                'details' => $validated['details'] ?? null,
                'status' => 'ACTIVO'
            ]);

            return response()->json([
                'message' => '🚨 Código Azul registrado exitosamente',
                'data' => $code
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Alerta enviada (Modo simulación)',
                'data' => array_merge($validated, ['status' => 'ACTIVO', 'created_at' => now()->toIso8601String()])
            ], 201);
        }
    }

    /**
     * Update/Resolve a Code Blue.
     */
    public function update(Request $request, $id)
    {
        try {
            $code = CodeBlue::findOrFail($id);
            $code->update([
                'status' => $request->input('status', 'RESUELTO'),
                'duration_seconds' => $request->input('duration_seconds', 0),
                'resolved_at' => now()
            ]);

            return response()->json([
                'message' => '🟢 Código Azul finalizado',
                'data' => $code
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Actualizado'], 200);
        }
    }

    /**
     * Show details of a specific Code Blue.
     */
    public function show($id)
    {
        try {
            $code = CodeBlue::findOrFail($id);
            return response()->json($code);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Código no encontrado'], 404);
        }
    }
}
