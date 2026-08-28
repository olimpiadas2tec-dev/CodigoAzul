<?php

namespace App\Http\Controllers;

use App\Models\Llamado;
use App\Models\Auditoria;
use App\Models\Material;
use Illuminate\Http\Request;

class LlamadoController extends Controller
{
    /**
     * List all calls with optional filters.
     */
    public function index(Request $request)
    {
        $query = Llamado::with([
            'paciente.persona',
            'paciente.area',
            'paciente.cama',
            'origen.area',
            'personalActivacion.persona',
            'usuarioAtencion.personalSalud.persona',
            'equipoRespuesta.integrantes.persona',
            'materiales'
        ]);

        if ($request->has('estado') && !empty($request->estado)) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('id_area') && !empty($request->id_area)) {
            $query->whereHas('paciente', function ($q) use ($request) {
                $q->where('id_area', $request->id_area);
            });
        }

        if ($request->has('resultado') && !empty($request->resultado)) {
            $query->where('resultado', $request->resultado);
        }

        $llamados = $query->orderBy('fecha_hora_activacion', 'desc')->get();

        return response()->json($llamados);
    }

    /**
     * Get active calls (Sin atender).
     */
    public function sinAtender()
    {
        $llamados = Llamado::with([
            'paciente.persona',
            'paciente.area',
            'paciente.cama',
            'origen.area',
            'personalActivacion.persona'
        ])
            ->sinAtender()
            ->orderBy('fecha_hora_activacion', 'asc')
            ->get();

        return response()->json($llamados);
    }

    /**
     * Trigger a new Code Blue emergency call.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_paciente' => 'required|exists:pacientes,id_paciente',
            'id_origen' => 'required|exists:origenes,id_origen',
            'id_personal_activacion' => 'nullable|exists:personal_salud,id_personal',
            'id_equipo_respuesta' => 'nullable|exists:equipos_codigo_azul,id_equipo',
            'fecha_hora_activacion' => 'nullable|date',
        ]);

        $llamado = Llamado::create([
            'fecha_hora_activacion' => $validated['fecha_hora_activacion'] ?? now(),
            'estado' => 'Sin atender',
            'id_paciente' => $validated['id_paciente'],
            'id_origen' => $validated['id_origen'],
            'id_personal_activacion' => $validated['id_personal_activacion'] ?? null,
            'id_equipo_respuesta' => $validated['id_equipo_respuesta'] ?? null,
            'id_usuario_atencion' => null,
        ]);

        // Registrar en auditoría
        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Activación de Código Azul', 'llamados', $llamado->id_llamado);

        $llamado->load([
            'paciente.persona',
            'paciente.area',
            'paciente.cama',
            'origen.area',
            'personalActivacion.persona',
            'equipoRespuesta'
        ]);

        return response()->json([
            'message' => '🚨 Alerta de Código Azul activada con éxito',
            'data' => $llamado
        ], 201);
    }

    /**
     * Mark a call as attended, record outcome, team and materials used.
     */
    public function atender(Request $request, $id)
    {
        $llamado = Llamado::findOrFail($id);

        $validated = $request->validate([
            'id_usuario_atencion' => 'nullable|exists:usuarios,id_usuario',
            'id_equipo_respuesta' => 'nullable|exists:equipos_codigo_azul,id_equipo',
            'resultado' => 'nullable|in:ROSC,Fallecido,Derivado',
            'materiales' => 'nullable|array',
            'materiales.*.id_material' => 'required|exists:materiales,id_material',
            'materiales.*.cantidad' => 'required|numeric|min:0.01',
        ]);

        $userId = $request->user() ? $request->user()->id_usuario : ($validated['id_usuario_atencion'] ?? 1);

        $updateData = [
            'estado' => 'Atendido',
            'fecha_hora_atencion' => now(),
            'id_usuario_atencion' => $userId,
        ];

        if (isset($validated['resultado'])) {
            $updateData['resultado'] = $validated['resultado'];
        }

        if (isset($validated['id_equipo_respuesta'])) {
            $updateData['id_equipo_respuesta'] = $validated['id_equipo_respuesta'];
        }

        $llamado->update($updateData);

        // Guardar materiales utilizados
        if (!empty($validated['materiales'])) {
            $materialSync = [];
            foreach ($validated['materiales'] as $mat) {
                $materialSync[$mat['id_material']] = ['cantidad' => $mat['cantidad']];
            }
            $llamado->materiales()->sync($materialSync);
        }

        // Registrar en auditoría
        Auditoria::registrar($userId, 'Atención de Código Azul', 'llamados', $llamado->id_llamado);

        $llamado->load([
            'paciente.persona',
            'paciente.area',
            'paciente.cama',
            'origen',
            'usuarioAtencion.personalSalud.persona',
            'equipoRespuesta',
            'materiales'
        ]);

        return response()->json([
            'message' => '🟢 Llamado atendido con éxito',
            'tiempo_respuesta_segundos' => $llamado->tiempo_respuesta_segundos,
            'data' => $llamado
        ]);
    }

    /**
     * Display a specific call.
     */
    public function show($id)
    {
        $llamado = Llamado::with([
            'paciente.persona',
            'paciente.area',
            'paciente.cama',
            'paciente.personalSalud.persona',
            'origen.area',
            'personalActivacion.persona',
            'usuarioAtencion.personalSalud.persona',
            'equipoRespuesta.integrantes.persona',
            'materiales'
        ])->findOrFail($id);

        return response()->json($llamado);
    }

    /**
     * Delete a call.
     */
    public function destroy(Request $request, $id)
    {
        $llamado = Llamado::findOrFail($id);
        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Eliminación de Llamado', 'llamados', $id);
        $llamado->delete();

        return response()->json(['message' => 'Llamado eliminado']);
    }
}
