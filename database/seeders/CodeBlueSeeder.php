<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CodeBlue;

class CodeBlueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CodeBlue::create([
            'location' => 'Urgencias - Box 2',
            'patient' => 'Perez, Juan (64a - HC 48102)',
            'team_leader' => 'Dr. Martinez (Cardiología)',
            'status' => 'RESUELTO',
            'details' => 'FV revertida exitosamente a ritmo sinusal tras 1 descarga de 200J y 1mg Adrenalina.',
            'duration_seconds' => 252,
            'resolved_at' => now()->subHours(2)
        ]);

        CodeBlue::create([
            'location' => 'Piso 4 - Habitación 412',
            'patient' => 'Gomez, María (71a - HC 39011)',
            'team_leader' => 'Dra. Lopez (Terapia Intensiva)',
            'status' => 'RESUELTO',
            'details' => 'Asistolia inicial, ROSC logrado tras 3 ciclos RCP y Vía Aérea Avanzada.',
            'duration_seconds' => 525,
            'resolved_at' => now()->subHours(5)
        ]);
    }
}
