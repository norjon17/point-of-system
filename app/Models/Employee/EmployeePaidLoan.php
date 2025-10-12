<?php

namespace App\Models\Employee;

use Illuminate\Database\Eloquent\Model;

class EmployeePaidLoan extends Model
{
    protected $fillable = [
        'employee_id',
        'amount'
    ];

    protected $casts = [
        'employee_id' => 'integer',
        'amount' => 'integer'
    ];
}
