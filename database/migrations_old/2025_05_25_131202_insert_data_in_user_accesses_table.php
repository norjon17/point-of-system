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
        $accesses = ['Sale', 'Checker'];
        foreach ($accesses as $access) {
            $exists = DB::table('user_accesses')->where('access', $access)->first();
            if (!$exists) {
                DB::table('user_accesses')->insert([
                    'access' => $access,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

    }
};
