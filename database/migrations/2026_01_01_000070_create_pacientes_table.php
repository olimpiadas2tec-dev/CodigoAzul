<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->unsignedBigInteger('id_paciente')->primary();
            $table->string('grupo_sanguineo', 5)->nullable();
            $table->string('alergias', 255)->nullable();
            $table->string('diagnostico', 255)->nullable();
            $table->date('fecha_ingreso');
            $table->date('fecha_alta')->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedBigInteger('id_cama')->nullable();
            $table->unsignedBigInteger('id_area');
            $table->unsignedBigInteger('id_personal');

            $table->foreign('id_paciente')->references('id_persona')->on('personas')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_cama')->references('id_cama')->on('camas')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('id_area')->references('id_area')->on('areas')->onUpdate('cascade');
            $table->foreign('id_personal')->references('id_personal')->on('personal_salud')->onUpdate('cascade');

            $table->index('id_cama');
            $table->index('id_area');
            $table->index('id_personal');
            $table->index('activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};
