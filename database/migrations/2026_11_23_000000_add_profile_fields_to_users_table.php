<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('domisili')->nullable();
            $table->string('kampus')->nullable();
            $table->string('jurusan')->nullable();
            $table->string('pendidikan_terakhir')->nullable();
            $table->string('bidang_minat')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'domisili',
                'kampus',
                'jurusan',
                'pendidikan_terakhir',
                'bidang_minat',
            ]);
        });
    }
};
