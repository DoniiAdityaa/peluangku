<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->string('scholarship_name')->nullable();
            $table->text('link');
            $table->decimal('percentage', 5, 2)->nullable();
            $table->date('deadline')->nullable();
            $table->string('major')->nullable();
            $table->timestamps();
        });

        Schema::create('fav_user_new', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('scholarships_id')->constrained('scholarships')->cascadeOnDelete();
            $table->primary(['user_id', 'scholarships_id']);
        });

        DB::table('fav_user')->orderBy('id')->chunkById(100, function ($favorites): void {
            foreach ($favorites as $favorite) {
                $scholarshipId = DB::table('scholarships')->insertGetId([
                    'scholarship_name' => $favorite->scholarship_name,
                    'link' => $favorite->link,
                    'percentage' => $favorite->percentage,
                    'deadline' => $favorite->deadline,
                    'major' => $favorite->major,
                    'created_at' => $favorite->created_at,
                    'updated_at' => $favorite->updated_at,
                ]);

                DB::table('fav_user_new')->insert([
                    'user_id' => $favorite->user_id,
                    'scholarships_id' => $scholarshipId,
                ]);
            }
        });

        Schema::drop('fav_user');
        Schema::rename('fav_user_new', 'fav_user');
    }

    public function down(): void
    {
        Schema::create('fav_user_legacy', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('link');
            $table->timestamps();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->string('scholarship_name')->nullable();
            $table->date('deadline')->nullable();
            $table->string('major')->nullable();
        });

        DB::table('fav_user')
            ->join('scholarships', 'fav_user.scholarships_id', '=', 'scholarships.id')
            ->orderBy('fav_user.user_id')
            ->orderBy('fav_user.scholarships_id')
            ->select([
                'fav_user.user_id',
                'scholarships.link',
                'scholarships.percentage',
                'scholarships.scholarship_name',
                'scholarships.deadline',
                'scholarships.major',
                'scholarships.created_at',
                'scholarships.updated_at',
            ])
            ->chunk(100, function ($favorites): void {
                foreach ($favorites as $favorite) {
                    DB::table('fav_user_legacy')->insert([
                        'user_id' => $favorite->user_id,
                        'link' => $favorite->link,
                        'percentage' => $favorite->percentage,
                        'scholarship_name' => $favorite->scholarship_name,
                        'deadline' => $favorite->deadline,
                        'major' => $favorite->major,
                        'created_at' => $favorite->created_at,
                        'updated_at' => $favorite->updated_at,
                    ]);
                }
            });

        Schema::drop('fav_user');
        Schema::rename('fav_user_legacy', 'fav_user');
        Schema::drop('scholarships');
    }
};
