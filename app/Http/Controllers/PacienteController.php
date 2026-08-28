<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\Persona;
use App\Models\Cama;
use App\Models\Auditoria;
use Illuminate\Http\Request;

class PacienteController extends Controller
{
    public function index(Request $request)
    {
        $query = Paciente::with(['persona', 'area', 'cama', 'personalSalud.persona']);

        if ($request->has('activo')) {
            $query->where('activo', filter_var($request->activo, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('id_area') && !empty($request->id_area)) {
            $query->where('id_area', $request->id_area);
        }

        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->whereHas('persona', function ($q) use ($s) {
                $q->where('nombre', 'like', "%{$s}%")
                  ->orWhere('apellido', 'like', "%{$s}%")
                  ->orWhere('dni', 'like', "%{$s}%");
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'apellido' => 'required|string|max:50',
            'nombre' => 'required|string|max:50',
            'dni' => 'nullable|string|max:15|unique:personas,dni',
            'fecha_nacimiento' => 'nullable|date',
            'telefono' => 'nullable|string|max:20',
            'grupo_sanguineo' => 'nullable|string|max:5',
            'alergias' => 'nullable|string|max:255',
            'diagnostico' => 'nullable|string|max:255',
            'id_cama' => 'nullable|exists:camas,id_cama',
            'fecha_ingreso' => 'nullable|date',
            'fecha_alta' => 'nullable|date',
            'activo' => 'nullable|boolean',
            'id_area' => 'required|exists:areas,id_area',
            'id_personal' => 'required|exists:personal_salud,id_personal',
        ]);

        $persona = Persona::create([
            'apellido' => $validated['apellido'],
            'nombre' => $validated['nombre'],
            'dni' => $validated['dni'] ?? null,
            'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
            'telefono' => $validated['telefono'] ?? null,
        ]);

        $paciente = Paciente::create([
            'id_paciente' => $persona->id_persona,
            'grupo_sanguineo' => $validated['grupo_sanguineo'] ?? null,
            'alergias' => $validated['alergias'] ?? null,
            'diagnostico' => $validated['diagnostico'] ?? null,
            'id_cama' => $validated['id_cama'] ?? null,
            'fecha_ingreso' => $validated['fecha_ingreso'] ?? now()->toDateString(),
            'fecha_alta' => $validated['fecha_alta'] ?? null,
            'activo' => $validated['activo'] ?? true,
            'id_area' => $validated['id_area'],
            'id_personal' => $validated['id_personal'],
        ]);

        // Si se asignó cama, marcarla como ocupada
        if (!empty($validated['id_cama'])) {
            Cama::where('id_cama', $validated['id_cama'])->update(['estado' => 'Ocupada']);
        }

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Alta de Paciente', 'pacientes', $paciente->id_paciente);

        $paciente->load(['persona', 'area', 'cama', 'personalSalud.persona']);

        return response()->json([
            'message' => 'Paciente registrado exitosamente',
            'data' => $paciente
        ], 201);
    }

    public function show($id)
    {
        $paciente = Paciente::with([
            'persona',
            'area',
            'cama',
            'personalSalud.persona',
            'personalSalud.rolProfesional',
            'llamados.origen'
        ])->findOrFail($id);

        return response()->json($paciente);
    }

    public function update(Request $request, $id)
    {
        $paciente = Paciente::with('persona')->findOrFail($id);

        $validated = $request->validate([
            'apellido' => 'sometimes|required|string|max:50',
            'nombre' => 'sometimes|required|string|max:50',
            'dni' => 'sometimes|nullable|string|max:15|unique:personas,dni,' . $paciente->id_paciente . ',id_persona',
            'fecha_nacimiento' => 'nullable|date',
            'telefono' => 'nullable|string|max:20',
            'grupo_sanguineo' => 'nullable|string|max:5',
            'alergias' => 'nullable|string|max:255',
            'diagnostico' => 'nullable|string|max:255',
            'id_cama' => 'nullable|exists:camas,id_cama',
            'fecha_ingreso' => 'nullable|date',
            'fecha_alta' => 'nullable|date',
            'activo' => 'nullable|boolean',
            'id_area' => 'sometimes|required|exists:areas,id_area',
            'id_personal' => 'sometimes|required|exists:personal_salud,id_personal',
        ]);

        // Actualizar datos de persona
        $personaFields = array_intersect_key($validated, array_flip(['apellido', 'nombre', 'dni', 'fecha_nacimiento', 'telefono']));
        if (!empty($personaFields)) {
            $paciente->persona->update($personaFields);
        }

        // Manejo de cambio de cama
        $camaAnterior = $paciente->id_cama;
        $camaNueva = $validated['id_cama'] ?? $camaAnterior;

        if (array_key_exists('id_cama', $validated) && $camaAnterior !== $camaNueva) {
            if ($camaAnterior) {
                Cama::where('id_cama', $camaAnterior)->update(['estado' => 'Libre']);
            }
            if ($camaNueva) {
                Cama::where('id_cama', $camaNueva)->update(['estado' => 'Ocupada']);
            }
        }

        // Si se da de alta, liberar la cama
        if (isset($validated['activo']) && !$validated['activo'] && $paciente->id_cama) {
            Cama::where('id_cama', $paciente->id_cama)->update(['estado' => 'Libre']);
        }

        $pacienteFields = array_intersect_key($validated, array_flip([
            'grupo_sanguineo', 'alergias', 'diagnostico', 'id_cama',
            'fecha_ingreso', 'fecha_alta', 'activo', 'id_area', 'id_personal'
        ]));

        if (!empty($pacienteFields)) {
            $paciente->update($pacienteFields);
        }

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Modificación de Paciente', 'pacientes', $paciente->id_paciente);

        $paciente->load(['persona', 'area', 'cama', 'personalSalud.persona']);

        return response()->json([
            'message' => 'Datos del paciente actualizados',
            'data' => $paciente
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $paciente = Paciente::findOrFail($id);

        if ($paciente->id_cama) {
            Cama::where('id_cama', $paciente->id_cama)->update(['estado' => 'Libre']);
        }

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Baja de Paciente', 'pacientes', $id);

        Persona::where('id_persona', $paciente->id_paciente)->delete();

        return response()->json(['message' => 'Paciente eliminado']);
    }
}
