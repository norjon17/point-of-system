<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;

class ProductUOM extends Model
{
    protected $table = 'product_uom';

    protected $fillable = [
        'name',
        'abbr',
        'active'
    ];

    protected $casts = [
        'active' => 'integer'
    ];
}
