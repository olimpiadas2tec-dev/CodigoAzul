<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turnos', function (Blueprint $table) {
            $table->id('id_turno');
            $table->string('nombre', 30)->unique();
            $table->time('hora_inicio');
            $table->time('hora_fin');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turnos');
    }
};
