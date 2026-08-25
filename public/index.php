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
    require __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';
    $kernel = $app->make(Kernel::class);

    $response = $kernel->handle(
        $request = Request::capture()
    )->send();

    $kernel->terminate($request, $response);
    exit;
}

// Fallback HTML interface if Laravel vendor has not executed composer install yet
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión Código Azul | INEP 2026</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="navbar">
        <div class="brand">
            <div class="brand-icon">
                <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div>
                <div class="brand-title">CÓDIGO AZUL</div>
                <div style="font-size: 0.75rem; color: #9CA3AF;">Sistema de Gestión de Emergencias Médicas</div>
            </div>
            <span class="brand-badge">INEP 2026</span>
        </div>
        <div class="nav-stats">
            <div class="stat-item">
                <span class="stat-label">Estado Servidor</span>
                <span class="stat-value" style="color: #10B981;">ONLINE (Render)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Tiempo Prom. Respuesta</span>
                <span class="stat-value">1m 45s</span>
            </div>
        </div>
    </nav>

    <div class="container">
        <main>
            <!-- Hero Dispatch Action -->
            <div class="hero-card">
                <div class="trigger-header">
                    <div>
                        <h1 class="trigger-title">Panel de Control de Reanimación</h1>
                        <p style="color: #9CA3AF; margin-top: 0.25rem;">Despacho rápido y cronometraje en tiempo real de paros cardiorrespiratorios hospitalarios.</p>
                    </div>
                    <button id="triggerCodeBtn" class="btn-emergency">
                        🚨 ACTIVAR CÓDIGO AZUL
                    </button>
                </div>
            </div>

            <!-- Banner Alarma Activa -->
            <div id="activeCodeBanner" class="emergency-banner" style="display: none;">
                <div>
                    <div style="font-size: 0.8rem; font-weight: 700; color: #FCA5A5; text-transform: uppercase;">⚡ CÓDIGO AZUL EN CURSO</div>
                    <div id="activeRoomLabel" style="font-size: 1.4rem; font-weight: 800; color: #FFF; margin-top: 0.2rem;">Habitación 304 - Shock Room</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <div id="timerDisplay" class="timer-display">00:00</div>
                    <button id="resolveCodeBtn" class="btn-secondary" style="background: #10B981; color: #FFF;">🟢 FINALIZAR / ROSC</button>
                </div>
            </div>

            <!-- Cards Grid -->
            <div class="cards-grid">
                <div class="card">
                    <div class="card-title">👨‍⚕️ Equipo de Respuesta Médica</div>
                    <div style="font-size: 1.2rem; font-weight: 700;">5 Integrantes Activos</div>
                    <div style="font-size: 0.8rem; color: #9CA3AF; margin-top: 0.5rem;">Líder: Dr. Guardia R1 | Compresor: Enf. Guardia</div>
                </div>
                <div class="card">
                    <div class="card-title">💊 Carro de Paro / Insumos</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: #10B981;">Verificado OK</div>
                    <div style="font-size: 0.8rem; color: #9CA3AF; margin-top: 0.5rem;">Desfibrilador cargado | Adrenalina lista</div>
                </div>
            </div>

            <!-- Historical Table -->
            <div class="card" style="margin-top: 1.5rem;">
                <div class="card-title">📋 Registro Histórico de Eventos Recientes</div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Ubicación / Sector</th>
                                <th>Paciente</th>
                                <th>Líder de Respuesta</th>
                                <th>Estado</th>
                                <th>Duración CPR</th>
                                <th>Hora</th>
                            </tr>
                        </thead>
                        <tbody id="historyTableBody">
                            <tr>
                                <td><strong>Urgencias - Box 2</strong></td>
                                <td>Perez, Juan (64a)</td>
                                <td>Dr. Martinez</td>
                                <td><span class="badge badge-resolved">RESUELTO</span></td>
                                <td>04:12</td>
                                <td>14:32</td>
                            </tr>
                            <tr>
                                <td><strong>Piso 4 - Hab 412</strong></td>
                                <td>Gomez, María (71a)</td>
                                <td>Dra. Lopez</td>
                                <td><span class="badge badge-resolved">RESUELTO</span></td>
                                <td>08:45</td>
                                <td>11:15</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>

        <aside>
            <div class="card" style="margin-bottom: 1.5rem;">
                <div class="card-title">📌 Protocolo Rápido ACLS</div>
                <ol style="padding-left: 1.2rem; font-size: 0.85rem; color: #D1D5DB; display: flex; flex-direction: column; gap: 0.6rem;">
                    <li>Iniciar RCP de alta calidad (100-120 cpm).</li>
                    <li>Conectar desfibrilador / Monitorizar ritmo.</li>
                    <li>Si es FV/TVSP: Desfibrilar 200J.</li>
                    <li>Administrar Adrenalina 1mg IV c/3-5 min.</li>
                    <li>Asegurar vía aérea avanzada (ET).</li>
                </ol>
            </div>

            <div class="card">
                <div class="card-title">🖥️ Info de Despliegue</div>
                <div style="font-size: 0.8rem; color: #9CA3AF; display: flex; flex-direction: column; gap: 0.4rem;">
                    <div><strong>Repositorio:</strong> CodigoAzulTec2/Gestion-CodigoAzul</div>
                    <div><strong>Servidor:</strong> Render (PaaS)</div>
                    <div><strong>Entorno:</strong> PHP Laravel + MySQL</div>
                    <div><strong>Evento:</strong> Olimpiadas INEP 2026</div>
                </div>
            </div>
        </aside>
    </div>

    <!-- Trigger Modal -->
    <div id="codeModal" class="modal-backdrop">
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">🚨 Activar Nuevo Código Azul</h3>
                <button id="closeModalBtn" style="background:none; border:none; color:#9CA3AF; cursor:pointer; font-size:1.5rem;">&times;</button>
            </div>
            <form id="codeBlueForm">
                <div class="form-group">
                    <label class="form-label" for="locationInput">Ubicación / Sector / Habitación *</label>
                    <input type="text" id="locationInput" class="form-control" placeholder="Ej: Piso 3 - Habitación 302" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="patientInput">Nombre del Paciente / Historia Clínica</label>
                    <input type="text" id="patientInput" class="form-control" placeholder="Ej: Perez Jose (HC 49120)">
                </div>
                <div class="form-group">
                    <label class="form-label" for="leaderInput">Médico Líder a Cargo</label>
                    <input type="text" id="leaderInput" class="form-control" placeholder="Ej: Dr. Ramirez (Terapia Intensiva)">
                </div>
                <div class="form-group">
                    <label class="form-label" for="detailsInput">Observaciones / Motivo</label>
                    <textarea id="detailsInput" class="form-control" rows="3" placeholder="Detalles de la emergencia..."></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
                    <button type="button" onclick="document.getElementById('codeModal').classList.remove('show')" class="btn-secondary">Cancelar</button>
                    <button type="submit" class="btn-submit">LanzAR ALERTA AHORA</button>
                </div>
            </form>
        </div>
    </div>

    <footer>
        &copy; 2026 Olimpiadas de Programación INEP — Sistema Código Azul | Desplegado en Render
    </footer>

    <script src="/js/app.js"></script>
</body>
</html>
