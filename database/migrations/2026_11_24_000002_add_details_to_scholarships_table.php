<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scholarships', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('scholarship_name');
            $table->json('levels')->nullable()->after('major');
            $table->string('location')->nullable()->after('levels');
            $table->string('region')->nullable()->after('location');
            $table->string('funding')->nullable()->after('region');
            $table->decimal('min_gpa', 3, 2)->nullable()->after('funding');
            $table->string('language_requirement')->nullable()->after('min_gpa');
            $table->text('description')->nullable()->after('language_requirement');
        });
    }

    public function down(): void
    {
        Schema::table('scholarships', function (Blueprint $table) {
            $table->dropColumn([
                'provider',
                'levels',
                'location',
                'region',
                'funding',
                'min_gpa',
                'language_requirement',
                'description',
            ]);
        });
    }
};
