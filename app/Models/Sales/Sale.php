<?php

namespace App\Models\Sales;

use App\Models\Cash\CashTransaction;
use App\Models\Customer\Customer;
use App\Models\DeliveryStatus;
use App\Models\PaymentMode;
use App\Models\Product\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Collection;

class Sale extends Model
{
    protected $table = 'sales';
    protected $fillable = [
        'order_type_id',
        'customer_id',
        'service_fee',
        'delivery_fee',
        'discount',
        'price',
        'sub_total',
        'vat',
        'balance',
        'received',
        'address',
        'delivered_by_id',
        'received_by',
        'departed',
        'returned',
        'vehicle_id',
        'delivery_status_id',
        'cash_transaction_id',
    ];

    protected $casts = [
        'order_type_id' => 'integer',
        'customer_id' => 'integer',
        'service_fee' => 'float',
        'delivery_fee' => 'float',
        'discount' => 'float',
        'price' => 'float',
        'sub_total' => 'float',
        'vat' => 'float',
        'balance' => 'float',
        'received' => 'float',
        'delivered_by_id' => 'integer',
        'vehicle_id' => 'integer',
        'delivery_status_id' => 'integer',
        'cash_transaction_id' => 'integer',
    ];

    protected $appends = ['balance', 'received'];

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class, 'id', 'customer_id');
    }
    // public function payment_mode(): HasOne
    // {
    //     return $this->hasOne(PaymentMode::class, 'id', 'mode_id');
    // }
    public function payment_mode(): HasOne
    {
        return $this->hasOne(SalesTransaction::class, 'sale_id', 'id')->latest();
    }
    public function order_type(): HasOne
    {
        return $this->hasOne(SalesOrderType::class, 'id', 'order_type_id');
    }
    public function delivery_status(): HasOne
    {
        return $this->hasOne(DeliveryStatus::class, 'id', 'delivery_status_id');
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

    public function sale_products(): HasMany
    {
        return $this->hasMany(SaleProduct::class, 'sales_id', 'id');
    }

    public function products(): HasManyThrough
    {
        return $this->hasManyThrough(
            Product::class,     // Final model
            SaleProduct::class,        // Intermediate model
            'sales_id',              // FK on SaleTransaction that relates to sale
            'id',                       // FK on CashTransaction (we'll map this to sale_transactions.cash_transaction_id)
            'id',                       // Local key on sale
            'product_id'       // Local key on SaleTransaction that relates to CashTransaction
        ); //sale, gcash and receivable (nag bayad ng utang)
    }

    public function getBalanceAttribute()
    {
        //denomination is already appends in CashTransactions
        $getTotalAmount = fn(Collection $transactions) => $transactions
            ->flatMap(fn($transaction) => $transaction->denominations)
            ->sum('denomination');
        return $this->sub_total - $getTotalAmount($this->total_paid);
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
