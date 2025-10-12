<?php

namespace App\Http\Controllers\Receivable;

use App\Http\Controllers\Controller;
use App\Models\Cash\CashDenomination;
use App\Models\Cash\CashTransaction;
use App\Models\Receivable\Receivable;
use App\Models\Sales\Sale;
use App\Models\Sales\SalesTransaction;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class ReceivableController extends Controller
{

    public function update(Request $request)
    {
        try {
            Gate::authorize('receivable_update', auth()->user());
            $auth_user = auth()->user();

            $validator = Validator::make($request->all(), [
                'cash' => 'required',
                'cash_mode' => 'required',
                'gcash_ref' => 'required_if:cash_mode,2'
            ], [
                'gcash_ref.required' => 'GCash Reference number is required.'
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }
            $receivable = Receivable::where('id', $request->id)->with(['sale', 'sale.customer'])->first();

            if (!$receivable) {
                return response()->json('Receivable not found', 404);
            }
            $sale = $receivable->sale;
            $customer = $sale->customer;
            $cash = $request->cash;
            $cash_mode = $request->cash_mode;
            $balance = $sale->balance;
            // $received = $old_received + $cash;

            $change = (float) $cash - $balance;

            $cash_transactions = null;
            if ($cash_mode === 'gcash') {
                if ($cash > $balance) {
                    return response()->json('You cannot pay more than the remaining balance when using GCash.', 403);
                }

                if (is_null($request->gcash_ref) || empty($request->gcash_ref)) {
                    return response()->json('GCash Reference number is required.', 403);
                }

                if ($cash === $balance) {
                    //update receivable to paid
                    Receivable::where('id', $request->id)->update([
                        'status_id' => 3 //paid status id
                    ]);
                } else {
                    //update receivable to partial
                    Receivable::where('id', $request->id)->update([
                        'status_id' => 1 //partial status id
                    ]);
                }

                //save it as gcash
                $cash_transactions = CashTransaction::create([
                    'user_id' => $auth_user->id,
                    'type_id' => 4, //gcash
                    'details' => "The $customer->company customer has paid a total amount of $cash pesos in GCASH #$request->gcash_ref",
                    'gcash_ref' => $request->gcash_ref
                ]);
                CashDenomination::create([
                    'ct_id' => $cash_transactions->id,
                    'denomination' => $cash,
                    'quantity' => 1,
                ]);

            } else {
                $details = "The $customer->company customer has paid a total amount of $cash pesos";
                //automatic cash in
                $cash_in = CashTransaction::create([
                    'user_id' => $auth_user->id,
                    'type_id' => 1, //cash in
                    'details' => $details,
                ]);
                CashDenomination::create([
                    'ct_id' => $cash_in->id,
                    'denomination' => $cash,
                    'quantity' => 1,
                ]);

                //save it too as for utang
                $cash_transactions = CashTransaction::create([
                    'user_id' => $auth_user->id,
                    'type_id' => 5, //receivable 
                    'details' => $details,
                ]);
                CashDenomination::create([
                    'ct_id' => $cash_transactions->id,
                    'denomination' => $cash,
                    'quantity' => 1,
                ]);

                //automatic cash out if change is more than zero
                if ($change > 0) {
                    $message = "The $customer->company has fully paid the debt with change $change pesos";
                    $cash_out = CashTransaction::create([
                        'user_id' => $auth_user->id,
                        'type_id' => 2, //cash out id
                        'details' => $message,
                        'created_at' => Carbon::parse($cash_in->created_at)->addSeconds(1),
                        'updated_at' => Carbon::parse($cash_in->updated_at)->addSeconds(1),
                    ]);
                    CashDenomination::create([
                        'ct_id' => $cash_out->id,
                        'denomination' => $change,
                        'quantity' => 1,
                        'created_at' => Carbon::parse($cash_in->created_at)->addSeconds(1),
                        'updated_at' => Carbon::parse($cash_in->updated_at)->addSeconds(1),
                    ]);

                    //update receivable to paid
                    Receivable::where('id', $request->id)->update([
                        'status_id' => 3 //paid status id
                    ]);
                } else {
                    //update receivable to partial
                    Receivable::where('id', $request->id)->update([
                        'status_id' => 1 //partial status id
                    ]);
                }

                //update sale received
                // Sale::where('id', $sale->id)->update([
                //     'received' => $received,
                //     'mode_id' => 1//cash
                // ]);
            }

            //receivable or gcash transaction logs
            if ($cash_transactions) {
                //create on sales transactions
                SalesTransaction::create([
                    'sale_id' => $sale->id,
                    'cash_transaction_id' => $cash_transactions->id
                ]);
            }


            return response()->json('Receivable has been updated.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('ReceivableController', 'update', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function getAll(Request $request)
    {
        try {
            Gate::authorize('receivable_read', auth()->user());

            $query = Receivable::query();

            if ($request->order_by) {

                $sort = $request->order_by['sort'];
                $column = $request->order_by['id'];

                if ($column === 'last_transaction') {
                    $query->orderBy('updated_at', $sort);
                }
            }

            $query->with(['sale', 'sale.customer', 'status']);

            $data = $query->paginate($request->rows);

            return response()->json($data, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('ReceivableController', 'getAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function historyAll(string $sale_id)
    {
        try {
            $sale = Sale::with(['total_paid', 'total_paid.type'])->findOrFail($sale_id);
            $total_paid = $sale->total_paid;
            return response()->json($total_paid, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('ReceivableController', 'historyAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
