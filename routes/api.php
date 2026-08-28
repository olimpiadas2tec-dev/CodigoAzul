<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LlamadoController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\PersonalSaludController;
use App\Http\Controllers\CamaController;
use App\Http\Controllers\EquipoCodigoAzulController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\TurnoController;
use App\Http\Controllers\PermisoController;
use App\Http\Controllers\RolProfesionalController;
use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\OrigenController;
use App\Http\Controllers\MetricasController;

/*
|--------------------------------------------------------------------------
| API Routes - Sistema de Gestión de Código Azul (ETP 2026)
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'system' => 'Sistema de Gestión de Código Azul (Olimpiada Nacional ETP 2026)',
        'timestamp' => now()->toIso8601String()
    ]);
});

// Autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Módulo Principal: Llamados (Alertas de Código Azul)
Route::get('/llamados/sin-atender', [LlamadoController::class, 'sinAtender']);
Route::put('/llamados/{id}/atender', [LlamadoController::class, 'atender']);
Route::apiResource('llamados', LlamadoController::class);

// Módulo: Pacientes
Route::apiResource('pacientes', PacienteController::class);

// Módulo: Áreas Hospitalarias
Route::apiResource('areas', AreaController::class);

// Módulo: Camas
Route::apiResource('camas', CamaController::class);

// Módulo: Personal de Salud
Route::apiResource('personal-salud', PersonalSaludController::class);

// Módulo: Orígenes de Alerta
Route::apiResource('origenes', OrigenController::class);

// Módulo: Equipos de Código Azul
Route::apiResource('equipos', EquipoCodigoAzulController::class);

// Módulo: Materiales e Insumos Médicos
Route::apiResource('materiales', MaterialController::class);

// Módulo: Turnos
Route::apiResource('turnos', TurnoController::class);

// Módulo: Roles Profesionales
Route::apiResource('roles-profesionales', RolProfesionalController::class);

// Módulo: Permisos del Sistema
Route::apiResource('permisos', PermisoController::class);

// Módulo: Usuarios y Cuentas
Route::apiResource('usuarios', UsuarioController::class);

// Módulo: Historial de Auditoría (Read-Only)
Route::get('/auditoria', [AuditoriaController::class, 'index']);
Route::get('/auditoria/{id}', [AuditoriaController::class, 'show']);

// Módulo: Métricas y Estadísticas
Route::get('/metricas', [MetricasController::class, 'index']);
