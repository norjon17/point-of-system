<?php

namespace App\Http\Controllers\Cash;

use App\Http\Controllers\Controller;
use App\Models\Cash\Turnover;
use App\Models\Cash\TurnoverDenomination;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class TurnoverController extends Controller
{
    public function store(Request $request)
    {
        try {
            $auth_user = auth()->user();
            Gate::authorize('cashier_turnover', $auth_user);

            $validator = Validator::make($request->all(), [
                'denominations' => 'required',
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $transaction = Turnover::create([
                'turnover_from_id' => $auth_user->id,
            ]);


            foreach ($request->denominations as $d) {
                $quantity = $d['quantity'];
                if ($quantity && $quantity > 0) {
                    //only store if quantity is not 0
                    TurnoverDenomination::create([
                        'turnover_id' => $transaction->id,
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
    public function getTurnover(Request $request)
    {
        try {
            if ($request->id) {
                $turnover_cash = Turnover::where('id', $request->id)
                    ->with(['turnover_from', 'denominations'])
                    ->first();
            } else {
                $turnover_cash = Turnover::whereNull('accepted_by_id')
                    ->with(['turnover_from', 'denominations'])
                    ->first();
            }

            return response()->json($turnover_cash, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('CashTransactionController', 'turnover', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function acceptTurnover(Request $request)
    {
        try {
            $auth_user = auth()->user();

            Turnover::where('id', $request->id)->update([
                'accepted_by_id' => $auth_user->id,
            ]);

            return response()->json("The cash for turnover has been accepted.", 200);
        } catch (\Throwable $th) {
            SystemLogging::error('CashTransactionController', 'turnover', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function getAll(Request $request)
    {
        try {

            Gate::authorize('cashier_turnover_logs', auth()->user());
            // Create a query builder instance for the Issue model
            $query = Turnover::query();

            if ($request->order_by) {

                $sort = $request->order_by['sort'];
                $column = $request->order_by['id'];

                if ($column === 'updated_at') {
                    $query->orderBy('updated_at', $sort);
                }
            }

            $query->with(['turnover_from', 'denominations', 'accepted_by']);
            $transactions = $query->paginate($request->rows);

            return response()->json($transactions, 200);
        } catch (\Throwable $th) {
            \Log::error($th);
            SystemLogging::error('CashTransactionController', 'getAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
