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
        Schema::create('turnover_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('turnover_id')->constrained('turnovers')->onDelete('CASCADE');
            $table->decimal('denomination', 10, 2);
            $table->integer('quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turnover_denominations');
    }
};
