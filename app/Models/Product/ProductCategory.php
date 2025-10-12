<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
        'active'
    ];

    protected $casts = [
        'active'
    ];

    public function cat_subs(): HasMany
    {
        return $this->hasMany(ProductCategorySub::class, 'cat_id', 'id');
    }
}
