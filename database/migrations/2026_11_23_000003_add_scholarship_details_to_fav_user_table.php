<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fav_user', function (Blueprint $table) {
            $table->decimal('percentage', 5, 2)->nullable();
            $table->string('scholarship_name')->nullable();
            $table->date('deadline')->nullable();
            $table->string('major')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('fav_user', function (Blueprint $table) {
            $table->dropColumn([
                'percentage',
                'scholarship_name',
                'deadline',
                'major',
            ]);
        });
    }
};
