<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('access_id')->nullable()->constrained('user_accesses');
            $table->integer('active')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // First drop the foreign key constraint
            $table->dropForeign(['access_id']);
            // Then drop the column
            $table->dropColumn('access_id');
            $table->dropColumn('active');
        });
    }
};
