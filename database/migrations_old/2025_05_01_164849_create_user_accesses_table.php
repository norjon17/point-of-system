<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_accesses', function (Blueprint $table) {
            $table->id();
            $table->string('access');
            $table->timestamps();
        });

        DB::table('user_accesses')->insert([
            ['access' => 'Administrator',],
            ['access' => 'Cashier',]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_accesses');
    }
};
