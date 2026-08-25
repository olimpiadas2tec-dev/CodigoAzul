<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CodeBlueController;

Route::get('/code-blue', [CodeBlueController::class, 'index']);
Route::post('/code-blue', [CodeBlueController::class, 'store']);
Route::put('/code-blue/{id}', [CodeBlueController::class, 'update']);
Route::get('/code-blue/{id}', [CodeBlueController::class, 'show']);
