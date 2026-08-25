<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('code_blues', function (Blueprint $table) {
            $table->id();
            $table->string('location');
            $table->string('patient')->default('No Identificado');
            $table->string('team_leader')->nullable();
            $table->string('status')->default('ACTIVO'); // ACTIVO, RESUELTO, CANCELADO
            $table->text('details')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('code_blues');
    }
};
