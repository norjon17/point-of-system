<?php

namespace App\Models\Sales;

use App\Models\Cash\CashTransaction;
use App\Models\Cash\CashTransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class SalesTransaction extends Model
{
    protected $fillable = [
        'sale_id',
        'cash_transaction_id'
    ];

    protected $casts = [
        'sale_id' => 'integer',
        'cash_transaction_id' => 'integer',
    ];

    public function cash_type(): HasOneThrough
    {
        return $this->hasOneThrough(
            CashTransactionType::class, // Final model
            CashTransaction::class,     // Intermediate model
            'id',                       // Foreign key on CashTransaction (referencing CashTransactionType)
            'id',                       // Foreign key on CashTransactionType (primary key)
            'cash_transaction_id',     // Local key on SalesTransaction
            'type_id'                  // Local key on CashTransaction that relates to CashTransactionType
        );
    }
}
