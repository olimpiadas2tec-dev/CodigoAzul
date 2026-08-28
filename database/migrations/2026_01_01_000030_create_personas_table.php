<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personas', function (Blueprint $table) {
            $table->id('id_persona');
            $table->string('apellido', 50);
            $table->string('nombre', 50);
            $table->string('dni', 15)->nullable()->unique();
            $table->date('fecha_nacimiento')->nullable();
            $table->string('telefono', 20)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personas');
    }
};
