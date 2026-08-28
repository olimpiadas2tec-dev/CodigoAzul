<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('llamados', function (Blueprint $table) {
            $table->id('id_llamado');
            $table->datetime('fecha_hora_activacion');
            $table->datetime('fecha_hora_atencion')->nullable();
            $table->enum('estado', ['Sin atender', 'Atendido'])->default('Sin atender');
            $table->enum('resultado', ['ROSC', 'Fallecido', 'Derivado'])->nullable();
            $table->unsignedBigInteger('id_paciente');
            $table->unsignedBigInteger('id_origen');
            $table->unsignedBigInteger('id_personal_activacion')->nullable();
            $table->unsignedBigInteger('id_usuario_atencion')->nullable();
            $table->unsignedBigInteger('id_equipo_respuesta')->nullable();
            $table->datetime('fecha_creacion')->useCurrent();

            $table->foreign('id_paciente')->references('id_paciente')->on('pacientes')->onUpdate('cascade');
            $table->foreign('id_origen')->references('id_origen')->on('origenes')->onUpdate('cascade');
            $table->foreign('id_personal_activacion')->references('id_personal')->on('personal_salud')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('id_usuario_atencion')->references('id_usuario')->on('usuarios')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('id_equipo_respuesta')->references('id_equipo')->on('equipos_codigo_azul')->onDelete('set null')->onUpdate('cascade');

            $table->index('id_paciente');
            $table->index('id_origen');
            $table->index('id_personal_activacion');
            $table->index('id_usuario_atencion');
            $table->index('id_equipo_respuesta');
            $table->index('estado');
            $table->index('fecha_hora_activacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('llamados');
    }
};
