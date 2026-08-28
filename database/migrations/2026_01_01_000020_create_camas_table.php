<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camas', function (Blueprint $table) {
            $table->id('id_cama');
            $table->string('numero', 10);
            $table->enum('estado', ['Libre', 'Ocupada'])->default('Libre');
            $table->unsignedBigInteger('id_area');

            $table->unique(['id_area', 'numero'], 'uk_camas_numero_area');
            $table->foreign('id_area')->references('id_area')->on('areas')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camas');
    }
};
