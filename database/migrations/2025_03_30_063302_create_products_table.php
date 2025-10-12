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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cat_id')->nullable()->references('id')->on('product_categories');
            $table->foreignId('loc_id')->nullable()->references('id')->on('product_locations');
            $table->foreignId('uom_id')->nullable()->references('id')->on('product_uom');
            $table->string('name');
            $table->longText('description')->nullable();
            $table->longText('image_original_name')->nullable();
            $table->longText('image_path_name')->nullable();
            $table->string('barcode')->unique()->nullable();
            $table->decimal('product_cost', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->integer('quantity')->nullable();
            $table->integer('batch_number')->nullable();
            $table->integer('status');
            $table->string('item_code')->unique()->nullable();
            $table->foreignId('cat_sub_id')->nullable()->constrained('product_category_subs');
            $table->string('brand')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
