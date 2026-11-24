<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fav_user', function (Blueprint $table) {
            $table->foreignId('scholarship_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->unique(['user_id', 'scholarship_id']);
        });
    }

    public function down(): void
    {
        Schema::table('fav_user', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'scholarship_id']);
            $table->dropConstrainedForeignId('scholarship_id');
        });
    }
};
