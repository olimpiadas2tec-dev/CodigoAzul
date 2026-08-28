<?php

namespace App\Http\Controllers;

use App\Models\PersonalSalud;
use App\Models\Persona;
use Illuminate\Http\Request;

class PersonalSaludController extends Controller
{
    /**
     * Listar todo el personal de salud con su persona, rol y áreas.
     */
    public function index(Request $request)
    {
        $query = PersonalSalud::with(['persona', 'rolProfesional', 'areas', 'pacientes' => function ($q) {
            $q->where('activo', true);
        }]);

        if ($request->has('id_rol_profesional') && !empty($request->id_rol_profesional)) {
            $query->where('id_rol_profesional', $request->id_rol_profesional);
        }

        if ($request->has('id_area') && !empty($request->id_area)) {
            $query->whereHas('areas', function ($q) use ($request) {
                $q->where('areas.id_area', $request->id_area);
            });
        }

        return response()->json($query->get());
    }

    /**
     * Crear nuevo personal de salud (persona + personal_salud).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'apellido' => 'required|string|max:50',
            'nombre' => 'required|string|max:50',
            'dni' => 'nullable|string|max:15|unique:personas,dni',
            'fecha_nacimiento' => 'nullable|date',
            'telefono' => 'nullable|string|max:20',
            'id_rol_profesional' => 'required|exists:roles_profesionales,id_rol_profesional',
            'area_ids' => 'nullable|array',
            'area_ids.*' => 'exists:areas,id_area',
        ]);

        $persona = Persona::create([
            'apellido' => $validated['apellido'],
            'nombre' => $validated['nombre'],
            'dni' => $validated['dni'] ?? null,
            'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
            'telefono' => $validated['telefono'] ?? null,
        ]);

        $personal = PersonalSalud::create([
            'id_personal' => $persona->id_persona,
            'id_rol_profesional' => $validated['id_rol_profesional'],
        ]);

        if (!empty($validated['area_ids'])) {
            $personal->areas()->sync($validated['area_ids']);
        }

        $personal->load(['persona', 'rolProfesional', 'areas']);

        return response()->json([
            'message' => 'Personal de salud registrado exitosamente',
            'data' => $personal
        ], 201);
    }

    /**
     * Mostrar detalle de un personal de salud.
     */
    public function show($id)
    {
        $personal = PersonalSalud::with([
            'persona', 'rolProfesional', 'areas',
            'pacientes.persona', 'pacientes.area',
            'equipos', 'usuario'
        ])->findOrFail($id);

        return response()->json($personal);
    }

    /**
     * Actualizar datos de personal de salud.
     */
    public function update(Request $request, $id)
    {
        $personal = PersonalSalud::with('persona')->findOrFail($id);

        $validated = $request->validate([
            'apellido' => 'sometimes|required|string|max:50',
            'nombre' => 'sometimes|required|string|max:50',
            'dni' => 'sometimes|nullable|string|max:15|unique:personas,dni,' . $personal->id_personal . ',id_persona',
            'fecha_nacimiento' => 'nullable|date',
            'telefono' => 'nullable|string|max:20',
            'id_rol_profesional' => 'sometimes|required|exists:roles_profesionales,id_rol_profesional',
            'area_ids' => 'nullable|array',
            'area_ids.*' => 'exists:areas,id_area',
        ]);

        // Actualizar persona
        $personaFields = array_intersect_key($validated, array_flip(['apellido', 'nombre', 'dni', 'fecha_nacimiento', 'telefono']));
        if (!empty($personaFields)) {
            $personal->persona->update($personaFields);
        }

        // Actualizar rol si cambió
        if (isset($validated['id_rol_profesional'])) {
            $personal->update(['id_rol_profesional' => $validated['id_rol_profesional']]);
        }

        // Actualizar áreas
        if (array_key_exists('area_ids', $validated)) {
            $personal->areas()->sync($validated['area_ids'] ?? []);
        }

        $personal->load(['persona', 'rolProfesional', 'areas']);

        return response()->json([
            'message' => 'Datos del personal actualizados',
            'data' => $personal
        ]);
    }

    /**
     * Eliminar personal de salud (cascadea a persona).
     */
    public function destroy($id)
    {
        $personal = PersonalSalud::findOrFail($id);
        // Al eliminar la persona, cascade borra personal_salud
        Persona::where('id_persona', $personal->id_personal)->delete();

        return response()->json(['message' => 'Personal de salud eliminado']);
    }
}
