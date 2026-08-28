<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Area;
use App\Models\Enfermero;
use App\Models\Paciente;
use App\Models\Origen;
use App\Models\Usuario;
use App\Models\Llamado;
use App\Models\CodeBlue;
use App\Models\Doctor;
use App\Models\EventLog;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Áreas
        $uti = Area::create(['nombre' => 'Unidad de Terapia Intensiva (UTI)', 'cantidad_camas' => 12]);
        $urgencias = Area::create(['nombre' => 'Urgencias / Guardia General', 'cantidad_camas' => 20]);
        $cardio = Area::create(['nombre' => 'Piso 3 - Cardiología', 'cantidad_camas' => 15]);
        $quirofano = Area::create(['nombre' => 'Centro Quirúrgico - Quirófano 2', 'cantidad_camas' => 5]);

        // 2. Enfermeros
        $enf1 = Enfermero::create(['apellido' => 'López', 'nombre' => 'María Elena', 'dni' => '32145678', 'telefono' => '11-4589-1234']);
        $enf2 = Enfermero::create(['apellido' => 'Gómez', 'nombre' => 'Juan Roberto', 'dni' => '29876543', 'telefono' => '11-5678-9012']);
        $enf3 = Enfermero::create(['apellido' => 'Fernández', 'nombre' => 'Ana Clara', 'dni' => '35123987', 'telefono' => '11-3456-7890']);
        $enf4 = Enfermero::create(['apellido' => 'Pérez', 'nombre' => 'Carlos Alberto', 'dni' => '27456123', 'telefono' => '11-2345-6789']);

        // Pivot enfermeros_areas
        $enf1->areas()->attach([$uti->id_area, $cardio->id_area]);
        $enf2->areas()->attach([$urgencias->id_area]);
        $enf3->areas()->attach([$quirofano->id_area, $uti->id_area]);
        $enf4->areas()->attach([$urgencias->id_area, $cardio->id_area]);

        // 3. Orígenes de Alerta
        $origBoton = Origen::create(['descripcion' => 'Botón Cabecera de Cama']);
        $origMonitor = Origen::create(['descripcion' => 'Monitor ECG Central']);
        $origApp = Origen::create(['descripcion' => 'Móvil / App Guardia']);
        $origLlamador = Origen::create(['descripcion' => 'Llamador de Enfermería']);

        // 4. Pacientes
        $pac1 = Paciente::create([
            'apellido' => 'Pérez',
            'nombre' => 'Juan Carlos',
            'dni' => '14253647',
            'fecha_nacimiento' => '1962-05-14',
            'grupo_sanguineo' => 'A+',
            'alergias' => 'Penicilina',
            'diagnostico' => 'Infarto Agudo de Miocardio (IAM)',
            'numero_cama' => 'Cama 304',
            'fecha_ingreso' => now()->subDays(3)->toDateString(),
            'activo' => true,
            'id_area' => $cardio->id_area,
            'id_enfermero' => $enf1->id_enfermero
        ]);

        $pac2 = Paciente::create([
            'apellido' => 'Rodríguez',
            'nombre' => 'Carlos Andrés',
            'dni' => '18976453',
            'fecha_nacimiento' => '1958-11-20',
            'grupo_sanguineo' => 'O+',
            'alergias' => 'Ninguna',
            'diagnostico' => 'Insuficiencia Respiratoria Grave',
            'numero_cama' => 'Box 2',
            'fecha_ingreso' => now()->subDays(1)->toDateString(),
            'activo' => true,
            'id_area' => $urgencias->id_area,
            'id_enfermero' => $enf2->id_enfermero
        ]);

        $pac3 = Paciente::create([
            'apellido' => 'Gómez',
            'nombre' => 'Beatriz',
            'dni' => '22456789',
            'fecha_nacimiento' => '1970-03-08',
            'grupo_sanguineo' => 'B-',
            'alergias' => 'Iodo',
            'diagnostico' => 'Postoperatorio Cardíaco',
            'numero_cama' => 'UTI-04',
            'fecha_ingreso' => now()->subDays(2)->toDateString(),
            'activo' => true,
            'id_area' => $uti->id_area,
            'id_enfermero' => $enf3->id_enfermero
        ]);

        // 5. Usuarios
        $admin = Usuario::create([
            'nombre_usuario' => 'admin',
            'contrasena_hash' => Hash::make('admin123'),
            'rol' => 'Administrador',
            'id_enfermero' => null
        ]);

        $usrEnf1 = Usuario::create([
            'nombre_usuario' => 'mlopez',
            'contrasena_hash' => Hash::make('123456'),
            'rol' => 'Generico',
            'id_enfermero' => $enf1->id_enfermero
        ]);

        $usrEnf2 = Usuario::create([
            'nombre_usuario' => 'jgomez',
            'contrasena_hash' => Hash::make('123456'),
            'rol' => 'Generico',
            'id_enfermero' => $enf2->id_enfermero
        ]);

        // 6. Llamados de Alerta (Código Azul)
        // Llamado 1: Atendido (Resuelto en 4 minutos y 12 segundos)
        Llamado::create([
            'fecha_hora_activacion' => now()->subMinutes(30),
            'fecha_hora_atencion' => now()->subMinutes(26),
            'estado' => 'Atendido',
            'id_paciente' => $pac1->id_paciente,
            'id_origen' => $origBoton->id_origen,
            'id_usuario_atencion' => $usrEnf1->id_usuario
        ]);

        // Llamado 2: Atendido (Resuelto en 2 minutos y 30 segundos)
        Llamado::create([
            'fecha_hora_activacion' => now()->subHours(2),
            'fecha_hora_atencion' => now()->subHours(2)->addSeconds(150),
            'estado' => 'Atendido',
            'id_paciente' => $pac3->id_paciente,
            'id_origen' => $origMonitor->id_origen,
            'id_usuario_atencion' => $admin->id_usuario
        ]);

        // Llamado 3: Sin atender (ACTIVO AHORA MISMO)
        Llamado::create([
            'fecha_hora_activacion' => now()->subSeconds(45),
            'fecha_hora_atencion' => null,
            'estado' => 'Sin atender',
            'id_paciente' => $pac2->id_paciente,
            'id_origen' => $origApp->id_origen,
            'id_usuario_atencion' => null
        ]);

        // 7. Seed para compatibilidad con endpoints anteriores (code_blues, doctors, event_logs)
        $code = CodeBlue::create([
            'location' => 'Urgencias - Box 2',
            'patient' => 'Rodríguez, Carlos Andrés (67a)',
            'team_leader' => 'Dr. Martínez - Líder RCP',
            'status' => 'ACTIVO',
            'details' => 'Paro cardio-respiratorio presenciado',
            'duration_seconds' => 45
        ]);

        Doctor::create(['name' => 'Dr. Martínez', 'specialty' => 'Cardiología / Intensivista', 'available' => true, 'phone' => '11-9988-7766']);
        Doctor::create(['name' => 'Dra. López Guardia', 'specialty' => 'Emergentología', 'available' => true, 'phone' => '11-8877-6655']);

        EventLog::create([
            'code_blue_id' => $code->id,
            'event_type' => 'CPR',
            'description' => 'Inicio de maniobras RCP de alta calidad',
            'elapsed_seconds' => 10
        ]);
        EventLog::create([
            'code_blue_id' => $code->id,
            'event_type' => 'SHOCK',
            'description' => 'Descarga desfibrilador 200J bifásica',
            'elapsed_seconds' => 35
        ]);
    }
}
