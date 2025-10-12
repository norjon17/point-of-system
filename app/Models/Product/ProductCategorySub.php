<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;

class ProductCategorySub extends Model
{
    protected $fillable = [
        'cat_id',
        'name',
        'description',
        'active'
    ];

    protected $casts = [
        'cat_id' => 'integer',
        'active' => 'integer'
    ];
}
