<?php

namespace App\Models\Employee;

use App\Models\Cash\CashDenomination;
use App\Models\Cash\CashTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Collection;

class Employee extends Model
{
    protected $fillable = [
        'name',
        'active',
        'salary',
    ];
    protected $casts = [
        'active' => 'integer',
        'salary' => 'float',
    ];

    protected $appends = ['loans_amount'];

    public function loans(): HasManyThrough
    {
        return $this->hasManyThrough(
            CashTransaction::class,     // Final model
            EmployeeLoan::class,        // Intermediate model
            'employee_id',              // FK on EmployeeLoan that relates to Employee
            'id',                       // FK on CashTransaction (we'll map this to employee_loans.cash_transaction_id)
            'id',                       // Local key on Employee
            'cash_transaction_id'       // Local key on EmployeeLoan that relates to CashTransaction
        )->where('type_id', 7); //employee loans only
    }

    public function paid_loans(): HasManyThrough
    {
        return $this->hasManyThrough(
            CashTransaction::class,     // Final model
            EmployeeSalary::class,        // Intermediate model
            'employee_id',              // FK on EmployeeLoan that relates to Employee
            'id',                       // FK on CashTransaction (we'll map this to employee_loans.cash_transaction_id)
            'id',                       // Local key on Employee
            'cash_transaction_id'       // Local key on EmployeeLoan that relates to CashTransaction
        )->where('type_id', 8); //employee loans (paid)
    }
    // public function salaries(): HasMany
    // {
    //     return $this->hasMany(EmployeeSalary::class, 'employee_id');
    // }

    public function getLoansAmountAttribute(): float
    {
        $getTotalAmount = fn(Collection $transactions) => $transactions
            ->flatMap(fn($transaction) => $transaction->denominations)
            ->sum('denomination');

        return $getTotalAmount($this->loans) - $getTotalAmount($this->paid_loans);
    }
}
