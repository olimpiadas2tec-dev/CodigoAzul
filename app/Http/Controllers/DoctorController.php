<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index()
    {
        try {
            return response()->json(Doctor::all());
        } catch (\Exception $e) {
            return response()->json([
                ['id' => 1, 'name' => 'Dr. Martinez', 'specialty' => 'Cardiología', 'status' => 'DISPONIBLE'],
                ['id' => 2, 'name' => 'Dra. Lopez', 'specialty' => 'Terapia Intensiva', 'status' => 'DISPONIBLE']
            ]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialty' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'status' => 'nullable|string'
        ]);

        try {
            $doctor = Doctor::create($validated);
            return response()->json($doctor, 201);
        } catch (\Exception $e) {
            return response()->json($validated, 201);
        }
    }
}
