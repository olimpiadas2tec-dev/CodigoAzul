<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is under maintenance...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Auto Loader if vendor directory exists
if (file_exists(__DIR__.'/../vendor/autoload.php')) {
    try {
        require __DIR__.'/../vendor/autoload.php';
        $app = require_once __DIR__.'/../bootstrap/app.php';
        $kernel = $app->make(Kernel::class);

        $response = $kernel->handle(
            $request = Request::capture()
        )->send();

        $kernel->terminate($request, $response);
        exit;
    } catch (\Throwable $e) {
        // Fallback to standalone web UI if PHP version or database is not available locally
    }
}

// Handle API endpoints
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
if (strpos($requestUri, '/api') === 0) {
    require __DIR__ . '/api.php';
    exit;
}

// Fallback HTML interface (Vista SPA Frontend)
require __DIR__ . '/index.html';

