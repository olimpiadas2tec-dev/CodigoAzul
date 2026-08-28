<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles_profesionales', function (Blueprint $table) {
            $table->id('id_rol_profesional');
            $table->string('nombre_rol', 50)->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles_profesionales');
    }
};
