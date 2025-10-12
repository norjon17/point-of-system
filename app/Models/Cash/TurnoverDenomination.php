<?php

namespace App\Models\Cash;

use Illuminate\Database\Eloquent\Model;

class TurnoverDenomination extends Model
{
    protected $fillable = [
        "turnover_id",
        "denomination",
        "quantity",
        'created_at',
        'updated_at'
    ];
    protected $casts = [
        "turnover_id" => 'integer',
        "denomination" => 'float',
        "quantity" => 'integer',
        'id' => 'integer'
    ];
}
