<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'service' => 'Gestion-CodigoAzul',
        'environment' => config('app.env'),
        'timestamp' => now()->toIso8601String()
    ]);
});
