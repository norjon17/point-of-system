<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;

class SaleProduct extends Model
{
    protected $fillable = [
        'sales_id',
        'product_id',
        'quantity',
        'discount',
        'selling_price',
        'total'
    ];

    protected $casts = [
        'sales_id' => 'integer',
        'product_id' => 'integer',
        'quantity' => 'integer',
        'discount' => 'float',
        'selling_price' => 'float',
        'total' => 'float',
    ];
}
