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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('mode_id')->constrained('payment_modes');
            $table->foreignId('order_type_id')->constrained('sales_order_types');
            $table->foreignId('customer_id')->constrained('customers');
            $table->decimal('service_fee', 10, 2)->nullable();
            $table->decimal('delivery_fee', 10, 2)->nullable();
            $table->decimal('discount', 10, 2);
            $table->decimal('price', 10, 2);
            $table->decimal('sub_total', 10, 2);
            $table->decimal('vat', 10, 2);
            // $table->decimal('balance', 10, 2); //no need, it will be handle by Sales Model
            // $table->decimal('received', 10, 2); //no need, it will be on the cash_transactions = Sales
            $table->longText('address')->nullable();
            $table->foreignId('delivered_by_id')->nullable()->constrained('users');
            $table->string('received_by')->nullable();
            $table->dateTime('departed')->nullable();
            $table->dateTime('returned')->nullable();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles');
            $table->foreignId('delivery_status_id')->nullable()->constrained('delivery_statuses');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
