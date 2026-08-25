<?php

namespace App\Http\Controllers;

use App\Models\EventLog;
use Illuminate\Http\Request;

class EventLogController extends Controller
{
    public function index($codeBlueId)
    {
        try {
            $logs = EventLog::where('code_blue_id', $codeBlueId)->orderBy('elapsed_seconds', 'asc')->get();
            return response()->json($logs);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    public function store(Request $request, $codeBlueId)
    {
        $validated = $request->validate([
            'event_type' => 'required|string|max:100',
            'description' => 'required|string',
            'elapsed_seconds' => 'nullable|integer'
        ]);

        try {
            $log = EventLog::create([
                'code_blue_id' => $codeBlueId,
                'event_type' => $validated['event_type'],
                'description' => $validated['description'],
                'elapsed_seconds' => $validated['elapsed_seconds'] ?? 0
            ]);

            return response()->json($log, 201);
        } catch (\Exception $e) {
            return response()->json($validated, 201);
        }
    }
}
