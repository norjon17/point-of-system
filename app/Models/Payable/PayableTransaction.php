<?php

namespace App\Models\Payable;

use App\Models\Cash\CashTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayableTransaction extends Model
{
    protected $fillable = [
        'product_receive_id',
        'cash_transaction_id'
    ];

    protected $casts = [
        'product_receive_id' => 'integer',
        'cash_transaction_id' => 'integer'
    ];

    public function total_paid(): HasMany
    {
        return $this->hasMany(CashTransaction::class, 'id', 'cash_transaction_id')
            ->whereIn('type_id', [2, 6]); //filter by cash out and payable
    }
}
