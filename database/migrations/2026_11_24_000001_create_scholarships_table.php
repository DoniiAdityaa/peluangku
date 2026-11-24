<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('provider');
            $table->json('jenjang');
            $table->json('bidang')->nullable();
            $table->string('lokasi');
            $table->string('wilayah')->nullable();
            $table->string('pendanaan');
            $table->decimal('ipk_min', 3, 2)->nullable();
            $table->string('syarat_bahasa')->nullable();
            $table->date('deadline')->index();
            $table->text('link');
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholarships');
    }
};
