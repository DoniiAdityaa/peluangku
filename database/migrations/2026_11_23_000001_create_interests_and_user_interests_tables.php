<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interests', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        $now = now();
        DB::table('interests')->insert(array_map(
            static fn (string $name): array => [
                'name' => $name,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'Pendidikan',
                'Kesehatan',
                'Teknologi Informasi',
                'Sains dan Riset',
                'Lingkungan dan Energi',
                'Pertanian dan Pangan',
                'Ekonomi dan Bisnis',
                'Sosial dan Pemberdayaan Masyarakat',
                'Hukum dan Kebijakan Publik',
                'Seni dan Budaya',
                'Komunikasi dan Media',
                'Teknik dan Infrastruktur',
                'Hubungan Internasional',
                'Keagamaan',
                'Kepemimpinan dan Organisasi',
            ],
        ));

        Schema::create('interest_user', function (Blueprint $table) {
            $table->foreignId('interest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['interest_id', 'user_id']);
        });

        $legacyInterests = DB::table('users')
            ->whereNotNull('bidang_minat')
            ->where('bidang_minat', '<>', '')
            ->get(['id', 'bidang_minat']);

        foreach ($legacyInterests as $legacyInterest) {
            $name = trim($legacyInterest->bidang_minat);
            if ($name === '') {
                continue;
            }

            DB::table('interests')->insertOrIgnore([
                'name' => $name,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $interestId = DB::table('interests')->where('name', $name)->value('id');
            DB::table('interest_user')->insertOrIgnore([
                'interest_id' => $interestId,
                'user_id' => $legacyInterest->id,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('bidang_minat');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('bidang_minat')->nullable();
        });

        Schema::dropIfExists('interest_user');
        Schema::dropIfExists('interests');
    }
};
