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
        Schema::create('cash_transaction_types', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->timestamps();
        });

        DB::table('cash_transaction_types')->insert([
            [
                'type' => 'Cash In',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Cash Out',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Sale',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'GCash',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Receivables', //utang ng customer
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Payable', //utang ng company
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Employee Loan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'type' => 'Employee Loan (Paid)',
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
        Schema::dropIfExists('cash_transaction_types');
    }
};
