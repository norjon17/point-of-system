<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        "cat_id",
        "cat_sub_id",
        "loc_id",
        "uom_id",
        "name",
        "description",
        "image_original_name",
        "image_path_name",
        "barcode",
        "product_cost",
        "selling_price",
        "quantity",
        "batch_number",
        "status",
        'item_code',
        'brand'
    ];
    protected $casts = [
        "cat_id" => 'integer',
        "cat_sub_id" => 'integer',
        "loc_id" => 'integer',
        "uom_id" => 'integer',
        "product_cost" => 'float',
        "selling_price" => 'float',
        "quantity" => 'integer',
        "batch_number" => 'integer',
        "status" => 'integer',
    ];
}
