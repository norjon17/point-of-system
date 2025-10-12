<?php

namespace App\Models\Cash;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashDenomination extends Model
{
    protected $fillable = [
        "ct_id",
        "denomination",
        "quantity",
        'created_at',
        'updated_at'
    ];
    protected $casts = [
        "ct_id" => 'integer',
        "denomination" => 'float',
        "quantity" => 'integer',
        'id' => 'integer'
    ];

    public function cash_transaction(): BelongsTo
    {
        return $this->belongsTo(CashTransaction::class);
    }
}
