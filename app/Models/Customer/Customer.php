<?php

namespace App\Models\Customer;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    //
    protected $fillable = [
        'id',
        'company',
        'contact_person',
        'address',
        'active'
    ];
    protected $casts = [
        'active' => 'integer'
    ];
}
