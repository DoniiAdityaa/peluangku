<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->string('no_whatsapp')->nullable();
            $table->unsignedTinyInteger('semester')->nullable();
            $table->decimal('ipk', 3, 2)->nullable();
            $table->json('prestasi')->nullable();
            $table->json('organisasi')->nullable();
            $table->string('sertifikat_bahasa')->nullable();
            $table->string('skor_bahasa')->nullable();
            $table->json('jenjang_tujuan')->nullable();
            $table->json('lokasi_tujuan')->nullable();
            $table->string('jenis_pendanaan')->nullable();
            $table->string('penghasilan_ortu')->nullable();
            $table->string('cv_path')->nullable();
            $table->string('cv_name')->nullable();
            $table->string('transkrip_path')->nullable();
            $table->string('onboarding_method')->nullable();
            $table->timestamp('onboarded_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'tanggal_lahir',
                'jenis_kelamin',
                'no_whatsapp',
                'semester',
                'ipk',
                'prestasi',
                'organisasi',
                'sertifikat_bahasa',
                'skor_bahasa',
                'jenjang_tujuan',
                'lokasi_tujuan',
                'jenis_pendanaan',
                'penghasilan_ortu',
                'cv_path',
                'cv_name',
                'transkrip_path',
                'onboarding_method',
                'onboarded_at',
            ]);
        });
    }
};
