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
        Schema::create('access_modules', function (Blueprint $table) {
            $table->id();
            $table->string('module');
            $table->longText('description')->nullable();
            $table->timestamps();
        });

        DB::table('access_modules')->insert([
            [
                'module' => 'admin',
                'description' => 'Admin Access (Create - Read - Update)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'admin_access',
                'description' => 'Admin Can Update Access (Update)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'cashier',
                'description' => 'Cashier (Read)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'cashier_in',
                'description' => 'Cashier In (Create)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'cashier_out',
                'description' => 'Cashier Out (Create)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'cashier_turnover',
                'description' => 'Cashier Turnover (Create)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'cashier_turnover_logs',
                'description' => 'Cashier Turnover Logs (Read)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'products',
                'description' => 'Products (Create - Read - Update)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'products_receive',
                'description' => 'Product Receive (Update)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'sales',
                'description' => 'Sales (Create)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'sales_insert',
                'description' => 'Sales Insert (Read)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'sales_list',
                'description' => 'Sales Lists (Read - Update)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'receivable',
                'description' => 'Receivable (Read - Update)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'payables',
                'description' => 'Payables (Read - Update)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'module' => 'payables_update_details',
                'description' => 'Payables Update Details (Update)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_modules');
    }
};