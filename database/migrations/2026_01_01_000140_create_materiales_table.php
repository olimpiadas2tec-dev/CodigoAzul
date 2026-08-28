<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materiales', function (Blueprint $table) {
            $table->id('id_material');
            $table->string('nombre', 100)->unique();
            $table->enum('tipo', ['Medicamento', 'Insumo']);
            $table->string('unidad_medida', 20);
        });

        Schema::create('llamado_materiales', function (Blueprint $table) {
            $table->unsignedBigInteger('id_llamado');
            $table->unsignedBigInteger('id_material');
            $table->decimal('cantidad', 8, 2);

            $table->primary(['id_llamado', 'id_material']);
            $table->foreign('id_llamado')->references('id_llamado')->on('llamados')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_material')->references('id_material')->on('materiales')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('llamado_materiales');
        Schema::dropIfExists('materiales');
    }
};
