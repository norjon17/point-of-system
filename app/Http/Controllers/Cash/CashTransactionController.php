<?php

namespace App\Http\Controllers\Cash;

use App\Http\Controllers\Controller;
use App\Models\Cash\CashTransaction;
use App\Models\Cash\CashDenomination;
use App\Models\Employee\Employee;
use App\Models\Employee\EmployeeLoan;
use App\Models\Turnover;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class CashTransactionController extends Controller
{
    //use this if there is denomination
    public function cashIn(Request $request)
    {
        try {
            $auth_user = auth()->user();

            Gate::authorize('cashier_in', $auth_user);

            $validator = Validator::make($request->all(), [
                'type_id' => 'required',
                'denominations' => 'required',
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $transaction = CashTransaction::create([
                'user_id' => $auth_user->id,
                'type_id' => 1, //cash in 
                'details' => $request->details ?? null,
            ]);


            foreach ($request->denominations as $d) {
                $quantity = $d['quantity'];
                if ($quantity && $quantity > 0) {
                    //only store if quantity is not 0
                    CashDenomination::create([
                        'ct_id' => $transaction->id,
                        'denomination' => $d['denomination'],
                        'quantity' => $quantity,
                    ]);
                }
            }

            return response()->json('Successful cashed in', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('CashTransactionController', 'cashIn', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    //use this if there is denomination
    public function cashOut(Request $request)
    {
        try {
            $auth_user = auth()->user();

            Gate::authorize('cashier_out', $auth_user);

            $validator = Validator::make($request->all(), [
                'type_id' => 'required',
                'denominations' => 'required',
                'details' => 'required'
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $denominations = $request->denominations;

            //validate the cahsed in, if not enough, cash out will return error 
            $total_cashed_in = CashTransaction::with('denominations')
                ->where('type_id', 1)//cashed in only
                ->get()->sum('amount');
            $total_to_cash_out = 0;
            foreach ($denominations as $d) {
                $total_to_cash_out += $d['denomination'] * $d['quantity'];
            }
            if ($total_to_cash_out > $total_cashed_in) {
                return response()->json("Insufficient cash to cash out.", 403);
            }

            //insert transaction as cash out
            $transaction = CashTransaction::create([
                'user_id' => $auth_user->id,
                'type_id' => 2, //cash out id
                'details' => $request->details ?? null,
                'name' => $request->name ?? null,
                'employee_id' => $request->employee_id ?? null,
            ]);


            $total_loan = 0;
            foreach ($denominations as $d) {
                $quantity = $d['quantity'];
                if ($quantity && $quantity > 0) {
                    //only store if quantity is not 0
                    CashDenomination::create([
                        'ct_id' => $transaction->id,
                        'denomination' => $d['denomination'],
                        'quantity' => $quantity,
                    ]);
                    $total_loan += $d['denomination'] * $quantity;
                }
            }

            if ($request->employee_id) {
                //save this as employee load
                EmployeeLoan::create([
                    'amount' => $total_loan,
                    'employee_id' => $request->employee_id,
                    'details' => $request->details ?? null,
                ]);
            }

            return response()->json('Successful cashed out', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('CashTransactionController', 'cashIn', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function cashInV2(Request $request)
    {
        try {
            $auth_user = auth()->user();

            Gate::authorize('cashier_in', $auth_user);

            $validator = Validator::make($request->all(), [
                'type_id' => 'required',
                'amount' => 'required',
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $transaction = CashTransaction::create([
                'user_id' => $auth_user->id,
                'type_id' => 1, //cash in 
                'details' => $request->details ?? null,
            ]);

            CashDenomination::create([
                'ct_id' => $transaction->id,
                'denomination' => $request->amount,
                'quantity' => 1,
            ]);

            return response()->json('Successful cashed in', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('CashTransactionController', 'cashIn', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function cashOutV2(Request $request)
    {
        try {
            $auth_user = auth()->user();

            Gate::authorize('cashier_out', $auth_user);

            $validator = Validator::make($request->all(), [
                'type_id' => 'required',
                'amount' => 'required',
                'details' => 'required'
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            //validate the cahsed in, if not enough, cash out will return error 
            $total_cashed_in = CashTransaction::with('denominations')
                ->where('type_id', 1)//cashed in only
                ->get()->sum('amount');
            $total_to_cash_out = $request->amount;
            if ($total_to_cash_out > $total_cashed_in) {
                return response()->json("Insufficient cash to cash out.", 403);
            }

            //insert transaction as cash out
            $transaction = CashTransaction::create([
                'user_id' => $auth_user->id,
                'type_id' => 2, //cash out id
                'details' => $request->details ?? null,
                'name' => $request->name ?? null,
            ]);

            CashDenomination::create([
                'ct_id' => $transaction->id,
                'denomination' => $total_to_cash_out,
                'quantity' => 1,
            ]);

            //IF LOAN FOR EMPLOYEE
            $employee = Employee::find($request->employee_id);
            if ($employee) {

                $transaction = CashTransaction::create([
                    'user_id' => $auth_user->id,
                    'type_id' => 7, //employee loan
                    'details' => $request->details ?? null,
                    'name' => $employee->name,
                ]);

                CashDenomination::create([
                    'ct_id' => $transaction->id,
                    'denomination' => $total_to_cash_out,
                    'quantity' => 1,
                ]);

                //save this as employee load
                EmployeeLoan::create([
                    'employee_id' => $request->employee_id,
                    'cash_transaction_id' => $transaction->id,
                ]);
            }

            return response()->json('Successful cashed out', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('CashTransactionController', 'cashIn', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    public function getAll(Request $request)
    {
        try {
            Gate::authorize('cashier_read', auth()->user());
            // Create a query builder instance for the Issue model
            $query = CashTransaction::query();

            if ($request->order_by) {

                $sort = $request->order_by['sort'];
                $column = $request->order_by['id'];

                if ($column === 'last_transaction') {
                    $query->orderBy('created_at', $sort);
                }
            }

            $query->with(['user', 'type'])->whereIn('type_id', [1, 2]); //cash in and out only
            $transactions = $query->paginate($request->rows);

            return response()->json($transactions, 200);
        } catch (\Throwable $th) {
            \Log::error($th);
            SystemLogging::error('CashTransactionController', 'getAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function getTotalAmount()
    {
        try {
            $cashTransactions = CashTransaction::all();

            $total_cashed_in = $cashTransactions->where('type_id', 1)->sum('amount');
            $total_cashed_out = $cashTransactions->where('type_id', 2)->sum('amount');

            $total_amount = $total_cashed_in - $total_cashed_out;

            return response()->json($total_amount, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('CashTransactionController', 'getTotalAmount', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
