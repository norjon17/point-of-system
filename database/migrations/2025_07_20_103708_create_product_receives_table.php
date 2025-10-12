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
        Schema::create('product_receives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->references('id')->on('products');
            $table->foreignId('supplier_id')->nullable()->references('id')->on('suppliers');
            $table->foreignId('received_by_id')->nullable()->references('id')->on('users');
            $table->foreignId('status_id')->nullable()->constrained('statuses');
            $table->decimal('product_cost', 10, 2)->nullable();
            // $table->decimal('amount', 10, 2)->nullable();
            $table->integer('quantity');
            $table->string('delivery_receipt')->nullable();
            $table->longText('image_original_name')->nullable();
            $table->longText('image_path_name')->nullable();
            $table->date('payable_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_receives');
    }
};
