<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Area;
use App\Models\Enfermero;
use App\Models\Paciente;
use App\Models\Origen;
use App\Models\Usuario;
use App\Models\Llamado;

class LlamadosApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed basic fixtures
        $area = Area::create(['nombre' => 'Urgencias', 'cantidad_camas' => 10]);
        $enfermero = Enfermero::create(['apellido' => 'Gómez', 'nombre' => 'Juan', 'dni' => '12345678']);
        
        $this->paciente = Paciente::create([
            'apellido' => 'Pérez',
            'nombre' => 'Juan',
            'dni' => '87654321',
            'id_area' => $area->id_area,
            'id_enfermero' => $enfermero->id_enfermero
        ]);

        $this->origen = Origen::create(['descripcion' => 'Botón Cabecera']);

        $this->usuario = Usuario::create([
            'nombre_usuario' => 'admin',
            'contrasena_hash' => bcrypt('password123'),
            'rol' => 'Administrador',
            'id_enfermero' => $enfermero->id_enfermero
        ]);
    }

    public function test_health_check(): void
    {
        $response = $this->getJson('/api/health');
        $response->assertStatus(200)->assertJson(['status' => 'online']);
    }

    public function test_login_usuario(): void
    {
        $response = $this->postJson('/api/login', [
            'nombre_usuario' => 'admin',
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'usuario']);
    }

    public function test_crear_llamado_codigo_azul(): void
    {
        $response = $this->postJson('/api/llamados', [
            'id_paciente' => $this->paciente->id_paciente,
            'id_origen' => $this->origen->id_origen,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.estado', 'Sin atender');

        $this->assertDatabaseHas('llamados', [
            'id_paciente' => $this->paciente->id_paciente,
            'estado' => 'Sin atender'
        ]);
    }

    public function test_atender_llamado(): void
    {
        $llamado = Llamado::create([
            'fecha_hora_activacion' => now()->subMinutes(2),
            'estado' => 'Sin atender',
            'id_paciente' => $this->paciente->id_paciente,
            'id_origen' => $this->origen->id_origen,
        ]);

        $response = $this->putJson("/api/llamados/{$llamado->id_llamado}/atender", [
            'id_usuario_atencion' => $this->usuario->id_usuario
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.estado', 'Atendido');

        $this->assertDatabaseHas('llamados', [
            'id_llamado' => $llamado->id_llamado,
            'estado' => 'Atendido'
        ]);
    }

    public function test_metricas_endpoint(): void
    {
        $response = $this->getJson('/api/metricas');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'resumen' => [
                         'total_llamados',
                         'llamados_sin_atender',
                         'llamados_atendidos',
                         'tiempo_promedio_respuesta_segundos',
                         'tiempo_promedio_respuesta_formateado'
                     ],
                     'por_area',
                     'por_origen',
                     'disponibilidad_camas'
                 ]);
    }
}
