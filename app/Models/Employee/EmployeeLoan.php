<?php

namespace App\Models\Employee;

use App\Models\Cash\CashDenomination;
use App\Models\Cash\CashTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class EmployeeLoan extends Model
{
    protected $fillable = [
        'employee_id',
        'cash_transaction_id',
    ];

    protected $casts = [
        'employee_id' => 'integer',
        'cash_transaction_id' => 'integer',
    ];

    protected $appends = ['amount', 'details'];

    public function loans(): HasManyThrough
    {
        return $this->hasManyThrough(
            CashDenomination::class,
            CashTransaction::class,
            'id',                // CashTransaction's PK
            'ct_id',             // CashDenomination's FK
            'cash_transaction_id', // FK on EmployeeLoan
            'id'                 // Local key on CashTransaction
        )->where('type_id', 7);
    }

    public function cash_transaction(): HasOne
    {
        return $this->hasOne(CashTransaction::class, 'id', 'cash_transaction_id');
    }


    //this is from Cash denomination table
    public function getAmountAttribute()
    {
        return $this->loans->sum('denomination');
    }

    //this is from cash transaction table
    public function getDetailsAttribute()
    {
        return $this->cash_transaction->details;
    }
}
