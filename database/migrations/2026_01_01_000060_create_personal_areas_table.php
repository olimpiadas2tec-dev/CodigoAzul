<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_areas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_personal');
            $table->unsignedBigInteger('id_area');

            $table->primary(['id_personal', 'id_area']);
            $table->foreign('id_personal')->references('id_personal')->on('personal_salud')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('id_area')->references('id_area')->on('areas')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_areas');
    }
};
