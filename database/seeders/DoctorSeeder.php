<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Doctor;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        Doctor::create([
            'name' => 'Dr. Carlos Martinez',
            'specialty' => 'Cardiología / Electrofisiología',
            'phone' => '+54 9 11 4455-6677',
            'status' => 'DISPONIBLE'
        ]);

        Doctor::create([
            'name' => 'Dra. Elena Lopez',
            'specialty' => 'Terapia Intensiva (UTI)',
            'phone' => '+54 9 11 5566-7788',
            'status' => 'DISPONIBLE'
        ]);

        Doctor::create([
            'name' => 'Dr. Fernando Gomez',
            'specialty' => 'Anestesiología / Vía Aérea',
            'phone' => '+54 9 11 6677-8899',
            'status' => 'GUARDIA'
        ]);
    }
}
