<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispositivos_push', function (Blueprint $table) {
            $table->id('id_dispositivo');
            $table->unsignedBigInteger('id_usuario');
            $table->string('token_push', 255)->unique();
            $table->enum('plataforma', ['Android', 'iOS']);
            $table->datetime('fecha_registro')->useCurrent();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade')->onUpdate('cascade');
            $table->index('id_usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispositivos_push');
    }
};
