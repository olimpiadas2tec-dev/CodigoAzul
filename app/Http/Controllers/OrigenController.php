<?php

namespace App\Http\Controllers;

use App\Models\Origen;
use App\Models\Auditoria;
use Illuminate\Http\Request;

class OrigenController extends Controller
{
    public function index(Request $request)
    {
        $query = Origen::with('area');

        if ($request->has('id_area') && !empty($request->id_area)) {
            $query->where('id_area', $request->id_area);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'descripcion' => 'required|string|max:50',
            'id_area' => 'required|exists:areas,id_area',
        ]);

        $origen = Origen::create($validated);
        $origen->load('area');

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Alta de Origen', 'origenes', $origen->id_origen);

        return response()->json([
            'message' => 'Origen de alerta creado exitosamente',
            'data' => $origen
        ], 201);
    }

    public function show($id)
    {
        $origen = Origen::with(['area', 'llamados.paciente.persona'])->findOrFail($id);
        return response()->json($origen);
    }

    public function update(Request $request, $id)
    {
        $origen = Origen::findOrFail($id);

        $validated = $request->validate([
            'descripcion' => 'sometimes|required|string|max:50',
            'id_area' => 'sometimes|required|exists:areas,id_area',
        ]);

        $origen->update($validated);
        $origen->load('area');

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Modificación de Origen', 'origenes', $origen->id_origen);

        return response()->json([
            'message' => 'Origen actualizado',
            'data' => $origen
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $origen = Origen::findOrFail($id);

        $userId = $request->user() ? $request->user()->id_usuario : null;
        Auditoria::registrar($userId, 'Baja de Origen', 'origenes', $id);

        $origen->delete();

        return response()->json(['message' => 'Origen eliminado']);
    }
}
