<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nombre_usuario', 50)->unique();
            $table->string('contrasena_hash', 255);
            $table->enum('rol', ['Administrador', 'Generico'])->default('Generico');
            $table->unsignedBigInteger('id_personal')->nullable();
            $table->datetime('fecha_creacion')->useCurrent();
            $table->datetime('ultima_actualizacion')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_personal')->references('id_personal')->on('personal_salud')->onDelete('set null')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
