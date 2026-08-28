<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_salud', function (Blueprint $table) {
            $table->unsignedBigInteger('id_personal')->primary();
            $table->unsignedBigInteger('id_rol_profesional');

            $table->foreign('id_personal')->references('id_persona')->on('personas')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_rol_profesional')->references('id_rol_profesional')->on('roles_profesionales')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_salud');
    }
};
