<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marks where a scholarship came from, so scraped rows can be told apart from
 * hand-curated ones and re-synced without touching the curated set.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scholarships', function (Blueprint $table) {
            $table->string('source')->nullable()->after('image')->index();
            $table->timestamp('last_synced_at')->nullable()->after('source');
        });
    }

    public function down(): void
    {
        Schema::table('scholarships', function (Blueprint $table) {
            $table->dropIndex(['source']);
            $table->dropColumn(['source', 'last_synced_at']);
        });
    }
};
