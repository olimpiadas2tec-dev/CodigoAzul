<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auditoria', function (Blueprint $table) {
            $table->id('id_auditoria');
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('accion', 100);
            $table->string('entidad_afectada', 50);
            $table->unsignedBigInteger('id_entidad_afectada');
            $table->datetime('fecha_hora')->useCurrent();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('set null')->onUpdate('cascade');
            $table->index('id_usuario');
            $table->index(['entidad_afectada', 'id_entidad_afectada']);
            $table->index('fecha_hora');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria');
    }
};
