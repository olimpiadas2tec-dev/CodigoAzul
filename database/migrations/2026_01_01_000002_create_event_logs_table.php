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
        Schema::create('event_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('code_blue_id')->constrained('code_blues')->onDelete('cascade');
            $table->string('event_type'); // Ej: CPR_CYCLE, MEDICATION, SHOCK, AIRWAY, ROSC
            $table->text('description'); // Ej: Adrenalina 1mg IV administrada
            $table->integer('elapsed_seconds')->default(0); // Tiempo desde el inicio del código
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_logs');
    }
};
