<?php

namespace App\Http\Controllers;

use App\Models\Cash\CashDenomination;
use App\Models\Cash\CashTransaction;
use App\Models\Employee\Employee;
use App\Models\Employee\EmployeeLoan;
use App\Models\Employee\EmployeeSalary;
use App\Utils\FormatDate;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    public function getAll(Request $request)
    {
        try {
            Gate::authorize('admin_read', auth()->user());
            $query = Employee::query();

            if (!empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%$searchTerm%");
                });
            }

            $employees = $query->paginate($request->rows);

        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'index', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json($employees, 200);
    }
    public function get(string $id)
    {
        try {
            Gate::authorize('admin_read', auth()->user());
            $employee = Employee::findOrFail($id);


        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'index', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json($employee, 200);
    }

    public function store(Request $request)
    {

        try {
            Gate::authorize('admin_create', auth()->user());
            $validatedData = $request->validate([
                'name' => 'required|string',
                'active' => 'required|numeric',
                'salary' => 'required|numeric',
            ]);

            $employee = Employee::create($validatedData);

        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json([
            'message' => 'Employee created successfully.',
            'data' => $employee,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        try {
            Gate::authorize('admin_update', auth()->user());

            $employee = Employee::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'required|string',
                'active' => 'required|numeric',
                'salary' => 'required|numeric',
            ], [
                'loan_amount.regex' => 'The loan amount should only contains 2 decimal places.'
            ]);

            $employee->update($validatedData);

        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'update', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json([
            'message' => 'Employee updated successfully.',
            'data' => $employee,
        ]);
    }

    public function insertLoan(Request $request)
    {
        try {
            Gate::authorize('admin_create', auth()->user());

            $validator = Validator::make($request->all(), [
                'employee_id' => 'required|numeric',
                'amount' => [
                    'required',
                    'numeric',
                    'regex:/^\d+(\.\d{1,2})?$/',
                    'min:1'
                ],
                'details' => 'required'
            ], [
                'amount.regex' => 'The loan amount should only contains 2 decimal places.'
            ]);


            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $employee = Employee::find($request->employee_id);
            //cash transaction
            $cash_trans = CashTransaction::create([
                'type_id' => 7, //employee loan
                "user_id" => auth()->user()->id,
                'details' => $request->details,
                'name' => $employee->name
            ]);

            CashDenomination::create([
                "ct_id" => $cash_trans->id,
                "denomination" => $request->amount,
                "quantity" => 1,
            ]);

            EmployeeLoan::create([
                'employee_id' => $request->employee_id,
                'cash_transaction_id' => $cash_trans->id,
            ]);

        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'insertLoan', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json('New loan has been created.', 200);
    }

    //not being use yet
    public function updateLoan(Request $request, $id)
    {
        try {
            Gate::authorize('admin_update', auth()->user());

            $validator = Validator::make($request->all(), [
                'amount' => [
                    'required',
                    'numeric',
                    'regex:/^\d+(\.\d{1,2})?$/',
                    'min:1'
                ],
            ], [
                'amount.regex' => 'The loan amount should only contains 2 decimal places.'
            ]);


            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }


            $employee_loan = EmployeeLoan::find($id);

            $cash_trans = CashTransaction::find($employee_loan->cash_transaction_id);

            CashDenomination::where("ct_id", $cash_trans->id)
                ->update([
                    "denomination" => $request->amount,
                ]);

        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'insertLoan', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json('New loan has been created.', 200);
    }

    public function getLoans(string $id)
    {
        try {
            $employee_loan = EmployeeLoan::where('employee_id', $id)
                ->orderBy('updated_at', 'desc')->get();

            return response()->json($employee_loan, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'getLoans', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function getSalaries(string $id)
    {
        try {
            $salaries = EmployeeSalary::where('employee_id', $id)->orderBy('updated_at', 'desc')->get();

            return response()->json($salaries, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'getLoans', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function insertSalary(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'employee_id' => 'required|numeric',
                'days' => 'required|numeric',
                'salary' => 'required|numeric',
                'date_salary' => 'required',
                // 'loan_to_pay' => 'required|numeric'
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $employee = Employee::find($request->employee_id);
            $loans_amount = (float) $employee->loans_amount;
            $regular_salary = (float) $request->days * $employee->salary;
            $loan_to_pay = (float) $request->loan_to_pay ?? 0;

            if ($loan_to_pay > $loans_amount) {
                return response()->json("Loan to pay cannot be greater than the employee's current loan balance.", 403);
            }

            //loans to pay
            if ($loans_amount > 0) {
                $regular_salary -= (float) $loan_to_pay;
            }

            if ($regular_salary < 0) {
                return response()->json("An employee's computed salary cannot be less than 0 (zero).", 403);
            }

            $employee_salary = EmployeeSalary::create([
                'employee_id' => $request->employee_id,
                'salary' => $regular_salary,
                'daily_salary' => $employee->salary,
                'days' => $request->days,
                'loan_paid' => $loan_to_pay ?? null,
                'date_salary' => FormatDate::formatDateTime($request->date_salary)
            ]);

            //if not null
            if ($loan_to_pay && $loan_to_pay > 0) {
                //also insert on cash transaction and employee loans table
                $cash_trans = CashTransaction::create([
                    'type_id' => 8, //employee loan (paid)
                    "user_id" => auth()->user()->id,
                ]);

                CashDenomination::create([
                    "ct_id" => $cash_trans->id,
                    "denomination" => $loan_to_pay,
                    "quantity" => 1,
                ]);

                EmployeeSalary::where('id', $employee_salary->id)->update([
                    'cash_transaction_id' => $cash_trans->id,
                ]);
            }

            return response()->json('Salary has been save', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('EmployeeController', 'insertSalary', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

}
