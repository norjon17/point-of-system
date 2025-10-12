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
        Schema::create('accesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('module_id')->constrained('access_modules');
            $table->integer('create');
            $table->integer('read');
            $table->integer('update');
            $table->integer('delete');
            $table->timestamps();
        });

        //auto make access for the admin
        // Get all module IDs from access_modules
        $moduleIds = DB::table('access_modules')->pluck('id');

        foreach ($moduleIds as $moduleId) {
            DB::table('accesses')->insert([
                'user_id' => 1,
                'module_id' => $moduleId,
                'create' => 1,
                'read' => 1,
                'update' => 1,
                'delete' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accesses');
    }
};
