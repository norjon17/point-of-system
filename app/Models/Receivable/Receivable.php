<?php

namespace App\Models\Receivable;

use App\Models\Cash\CashTransaction;
use App\Models\Sales\Sale;
use App\Models\Sales\SalesTransaction;
use App\Models\Status;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Collection;

class Receivable extends Model
{
    protected $fillable = [
        'sales_id',
        'status_id',
        'payment_due_date',
    ];

    protected $casts = [
        'sales_id' => 'integer',
        'status_id' => 'integer',
    ];

    protected $appends = ['balance', 'received'];

    public function sale(): HasOne
    {
        return $this->hasOne(Sale::class, 'id', 'sales_id');
    }

    public function status(): HasOne
    {
        return $this->hasOne(Status::class, 'id', 'status_id');
    }

    public function total_paid(): HasManyThrough
    {
        return $this->hasManyThrough(
            CashTransaction::class,     // Final model
            SalesTransaction::class,        // Intermediate model
            'sale_id',              // FK on SaleTransaction that relates to sale
            'id',                       // FK on CashTransaction (we'll map this to sale_transactions.cash_transaction_id)
            'id',                       // Local key on sale
            'cash_transaction_id'       // Local key on SaleTransaction that relates to CashTransaction
        )->whereIn('type_id', [3, 4, 5]); //sale, gcash and receivable (nag bayad ng utang)
    }

    //how to chech if fully paid?
    //sum the sale or gcash in cash transactions

    public function getBalanceAttribute()
    {
        //denomination is already appends in CashTransactions
        $getTotalAmount = fn(Collection $transactions) => $transactions
            ->flatMap(fn($transaction) => $transaction->denominations)
            ->sum('denomination');
        return $this->sale->sub_total - $getTotalAmount($this->total_paid);
    }
    public function getReceivedAttribute()
    {
        //denomination is already appends in CashTransactions
        $getTotalAmount = fn(Collection $transactions) => $transactions
            ->flatMap(fn($transaction) => $transaction->denominations)
            ->sum('denomination');
        return $getTotalAmount($this->total_paid);
    }

}
