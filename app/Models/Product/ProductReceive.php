<?php

namespace App\Models\Product;

use App\Models\Cash\CashTransaction;
use App\Models\Payable\PayableTransaction;
use App\Models\Status;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Collection;

class ProductReceive extends Model
{
    protected $fillable = [
        "product_id",
        "supplier_id",
        "received_by_id",
        "status_id",
        "product_cost",
        // "amount",
        "quantity",
        "delivery_receipt",
        "image_original_name",
        "image_path_name",
        "payable_date"
    ];
    protected $casts = [
        "product_id" => 'integer',
        "supplier_id" => 'integer',
        "received_by_id" => 'integer',
        "status_id" => 'integer',
        "product_cost" => 'float',
        "amount" => 'float',
        "quantity" => 'integer',
    ];

    protected $appends = ['amount'];

    public function supplier(): HasOne
    {
        return $this->hasOne(Supplier::class, 'id', 'supplier_id');
    }
    public function received_by(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'received_by_id');
    }

    public function status(): HasOne
    {
        return $this->hasOne(Status::class, 'id', 'status_id');
    }
    public function product(): HasOne
    {
        return $this->hasOne(Product::class, 'id', 'product_id');
    }

    public function total_paid(): HasManyThrough
    {
        return $this->hasManyThrough(
            CashTransaction::class,     // Final model
            PayableTransaction::class,        // Intermediate model
            'product_receive_id',              // FK on SaleTransaction that relates to sale
            'id',                       // FK on CashTransaction (we'll map this to sale_transactions.cash_transaction_id)
            'id',                       // Local key on sale
            'cash_transaction_id'       // Local key on SaleTransaction that relates to CashTransaction
        )->whereIn('type_id', [2, 6]); //payable
    }

    public function getAmountAttribute()
    {
        //denomination is already appends in CashTransactions
        $getTotalAmount = fn(Collection $transactions) => $transactions
            ->flatMap(fn($transaction) => $transaction->denominations)
            ->sum('denomination');
        return $getTotalAmount($this->total_paid);
    }

}
