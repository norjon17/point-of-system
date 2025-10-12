<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;

class EmployeeSalary extends Model
{
    protected $fillable = [
        'employee_id',
        'salary',
        'daily_salary',
        'days',
        'loan_paid',
        'date_salary',
        'cash_transaction_id'
    ];

    protected $casts = [
        'employee_id' => 'integer',
        'salary' => 'float',
        'daily_salary' => 'float',
        'days' => 'float',
        'loan_paid' => 'float',
        'cash_transaction_id' => 'integer',
    ];
}
