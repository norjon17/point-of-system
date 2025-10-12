<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        "company",
        "contact_person",
        'active'
    ];

    protected $casts = [
        'active' => 'integer'
    ];
}
