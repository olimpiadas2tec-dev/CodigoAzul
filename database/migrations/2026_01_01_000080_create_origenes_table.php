<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('origenes', function (Blueprint $table) {
            $table->id('id_origen');
            $table->string('descripcion', 50);
            $table->unsignedBigInteger('id_area');

            $table->unique(['id_area', 'descripcion'], 'uk_origenes_descripcion_area');
            $table->foreign('id_area')->references('id_area')->on('areas')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('origenes');
    }
};
