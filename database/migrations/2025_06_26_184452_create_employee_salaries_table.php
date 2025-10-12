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
        Schema::create('employee_salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('cash_transaction_id')->nullable()->constrained('cash_transactions')->onDelete('cascade');
            $table->decimal('salary', 10, 2);
            $table->decimal('daily_salary', 10, 2);
            $table->float('days');
            $table->decimal('loan_paid', 10, 2)->nullable();
            $table->dateTime('date_salary');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_salaries');
    }
};
