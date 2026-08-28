<?php

namespace App\Http\Controllers;

use App\Models\Llamado;
use App\Models\Area;
use App\Models\Cama;
use App\Models\Paciente;
use App\Models\EquipoCodigoAzul;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MetricasController extends Controller
{
    /**
     * Get system-wide emergency response analytics for dashboards and reporting.
     */
    public function index()
    {
        $totalLlamados = Llamado::count();
        $sinAtender = Llamado::sinAtender()->count();
        $atendidos = Llamado::atendidos()->get();

        $tiempos = $atendidos->map(function ($ll) {
            return $ll->tiempo_respuesta_segundos;
        })->filter(function ($val) {
            return !is_null($val);
        });

        $tiempoPromedioSegundos = $tiempos->count() > 0 ? round($tiempos->avg()) : 0;
        $minutos = floor($tiempoPromedioSegundos / 60);
        $segundos = $tiempoPromedioSegundos % 60;
        $tiempoFormateado = "{$minutos}m {$segundos}s";

        // Métricas por Resultado Clínico (ROSC / Fallecido / Derivado)
        $porResultado = DB::table('llamados')
            ->select('resultado', DB::raw('count(*) as total'))
            ->whereNotNull('resultado')
            ->groupBy('resultado')
            ->get();

        // Llamados por Área
        $porArea = DB::table('llamados')
            ->join('pacientes', 'llamados.id_paciente', '=', 'pacientes.id_paciente')
            ->join('areas', 'pacientes.id_area', '=', 'areas.id_area')
            ->select('areas.nombre as area', DB::raw('count(llamados.id_llamado) as total'))
            ->groupBy('areas.nombre')
            ->get();

        // Llamados por Origen
        $porOrigen = DB::table('llamados')
            ->join('origenes', 'llamados.id_origen', '=', 'origenes.id_origen')
            ->select('origenes.descripcion as origen', DB::raw('count(llamados.id_llamado) as total'))
            ->groupBy('origenes.descripcion')
            ->get();

        // Llamados por Equipo de Respuesta
        $porEquipo = DB::table('llamados')
            ->join('equipos_codigo_azul', 'llamados.id_equipo_respuesta', '=', 'equipos_codigo_azul.id_equipo')
            ->select('equipos_codigo_azul.nombre as equipo', DB::raw('count(llamados.id_llamado) as total'))
            ->groupBy('equipos_codigo_azul.nombre')
            ->get();

        // Disponibilidad de Camas en tiempo real
        $camas = Area::with('camas')->get()->map(function ($a) {
            $total = $a->camas->count();
            $libres = $a->camas->where('estado', 'Libre')->count();
            $ocupadas = $a->camas->where('estado', 'Ocupada')->count();
            return [
                'area' => $a->nombre,
                'cantidad_camas' => $a->cantidad_camas,
                'total_camas_registradas' => $total,
                'camas_libres' => $libres,
                'camas_ocupadas' => $ocupadas,
                'camas_disponibles' => $libres,
            ];
        });

        // Medicamentos e insumos más utilizados
        $materialesMasUsados = DB::table('llamado_materiales')
            ->join('materiales', 'llamado_materiales.id_material', '=', 'materiales.id_material')
            ->select('materiales.nombre', 'materiales.tipo', 'materiales.unidad_medida', DB::raw('sum(llamado_materiales.cantidad) as total_usado'))
            ->groupBy('materiales.nombre', 'materiales.tipo', 'materiales.unidad_medida')
            ->orderBy('total_usado', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'resumen' => [
                'total_llamados' => $totalLlamados,
                'llamados_sin_atender' => $sinAtender,
                'llamados_atendidos' => $atendidos->count(),
                'tiempo_promedio_respuesta_segundos' => $tiempoPromedioSegundos,
                'tiempo_promedio_respuesta_formateado' => $tiempoFormateado,
                'total_pacientes_activos' => Paciente::where('activo', true)->count(),
            ],
            'por_resultado' => $porResultado,
            'por_area' => $porArea,
            'por_origen' => $porOrigen,
            'por_equipo' => $porEquipo,
            'disponibilidad_camas' => $camas,
            'materiales_mas_usados' => $materialesMasUsados,
        ]);
    }
}
