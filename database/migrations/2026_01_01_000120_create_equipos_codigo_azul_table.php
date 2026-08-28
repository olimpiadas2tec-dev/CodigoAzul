<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipos_codigo_azul', function (Blueprint $table) {
            $table->id('id_equipo');
            $table->string('nombre', 50)->unique();
        });

        Schema::create('equipo_codigo_azul_personal', function (Blueprint $table) {
            $table->unsignedBigInteger('id_equipo');
            $table->unsignedBigInteger('id_personal');
            $table->string('rol_en_equipo', 30)->nullable();

            $table->primary(['id_equipo', 'id_personal']);
            $table->foreign('id_equipo')->references('id_equipo')->on('equipos_codigo_azul')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_personal')->references('id_personal')->on('personal_salud')->onDelete('cascade')->onUpdate('cascade');
        });

        Schema::create('equipo_turno_asignacion', function (Blueprint $table) {
            $table->id('id_asignacion');
            $table->unsignedBigInteger('id_equipo');
            $table->unsignedBigInteger('id_turno');
            $table->date('fecha_desde');
            $table->date('fecha_hasta')->nullable();

            $table->foreign('id_equipo')->references('id_equipo')->on('equipos_codigo_azul')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_turno')->references('id_turno')->on('turnos')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipo_turno_asignacion');
        Schema::dropIfExists('equipo_codigo_azul_personal');
        Schema::dropIfExists('equipos_codigo_azul');
    }
};
