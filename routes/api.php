<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CodeBlueController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\EventLogController;

/*
|--------------------------------------------------------------------------
| API Routes - INEP 2026 Código Azul Backend
|--------------------------------------------------------------------------
*/

// Endpoints para Código Azul
Route::get('/code-blue', [CodeBlueController::class, 'index']);
Route::post('/code-blue', [CodeBlueController::class, 'store']);
Route::get('/code-blue/{id}', [CodeBlueController::class, 'show']);
Route::put('/code-blue/{id}', [CodeBlueController::class, 'update']);

// Endpoints para Eventos en tiempo real (CPR, Medicación, Desfibrilación)
Route::get('/code-blue/{id}/events', [EventLogController::class, 'index']);
Route::post('/code-blue/{id}/events', [EventLogController::class, 'store']);

// Endpoints para Médicos / Equipo de Respuesta
Route::get('/doctors', [DoctorController::class, 'index']);
Route::post('/doctors', [DoctorController::class, 'store']);
