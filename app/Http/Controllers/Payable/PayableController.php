<?php

namespace App\Http\Controllers\Payable;

use App\Http\Controllers\Controller;
use App\Models\Cash\CashDenomination;
use App\Models\Cash\CashTransaction;
use App\Models\Payable\PayableTransaction;
use App\Models\Product\ProductReceive;
use App\Utils\FormatDate;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PayableController extends Controller
{

    public function update(Request $request)
    {
        try {
            Gate::authorize('payables_update', auth()->user());

            $validator = Validator::make($request->all(), [
                'cash' => 'required|min:1',
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $product_receive = ProductReceive::find($request->id);

            $cash = $request->cash;
            $received = $cash + ($product_receive->amount ? $product_receive->amount : 0);
            $remaining = $received - $product_receive->product_cost;

            //return error if remaining is greater than 0
            if ($remaining > 0) {
                return response()->json('You cannot enter more cash than the remaining balance.', 403);
            }

            //partial if remaining is negavite
            if ($remaining < 0) {
                ProductReceive::where('id', $request->id)->update([
                    'status_id' => 1,//partial
                    // 'amount' => $received
                ]);
            }

            //paid if remaining is zero
            if ((int) $remaining === 0) {
                ProductReceive::where('id', $request->id)->update([
                    'status_id' => 3,//paid
                    // 'amount' => $received,
                    'payable_date' => null
                ]);
                return response()->json('Payable has been fully paid.', 200);
            }

            //save on cash transaction as payable
            $cash_transaction = CashTransaction::create([
                'user_id' => auth()->user()->id,
                'type_id' => 6, //payable
                'details' => "Updated the payable."
            ]);
            //cash denomination is not specified here so the cash is exact multiple by 1
            CashDenomination::create([
                'ct_id' => $cash_transaction->id,
                'denomination' => $received,
                'quantity' => 1,
            ]);

            PayableTransaction::create([
                'product_receive_id' => $product_receive->id,
                'cash_transaction_id' => $cash_transaction->id
            ]);

            return response()->json('Payable has been updated.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('PayableController', 'update', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    public function updateDetails(Request $request)
    {
        try {
            Gate::authorize('payables_update_details', auth()->user());

            $validator = Validator::make(
                $request->all(),
                [
                    'quantity' => 'required|numeric|min:1',
                    'image' => 'file|mimetypes:image/png,image/jpeg,image/jpg',
                ],
                [
                    'image.mimetypes' => 'The DR Image must be a valid file type: png, jpeg, jpg, gif.',
                ]

            );

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $product_receive = ProductReceive::find($request->id);
            if (!$product_receive) {
                return response()->json('Payable not found.', 404);
            }

            //replace the image
            if ($request->image && $request->hasFile('image')) {
                if (!empty($product_receive->image_path_name)) {
                    $storedFilename = $product_receive->image_path_name;
                    Storage::disk('public')->put($storedFilename, file_get_contents($request->image));
                } else {
                    //insert new
                    $storedFilename = "product_receive_dr/" . Str::uuid() . '.' . $request->image->getClientOriginalExtension();
                    Storage::disk('public')->put($storedFilename, file_get_contents($request->image));
                }
            }

            if (isset($storedFilename)) {
                ProductReceive::where('id', $request->id)->update([
                    "product_cost" => $request->product_cost,
                    "quantity" => $request->quantity,
                    "delivery_receipt" => $request->delivery_receipt,
                    'image_original_name' => $request->image->getClientOriginalName(),
                    'image_path_name' => $storedFilename,
                    "received_by_id" => $request->received_by_id ?? null,
                    "payable_date" => $request->payable_date ? FormatDate::formatDate($request->payable_date) : null,
                    "supplier_id" => $request->supplier_id,
                ]);
            } else {
                ProductReceive::where('id', $request->id)->update([
                    "product_cost" => $request->product_cost,
                    "quantity" => $request->quantity,
                    "delivery_receipt" => $request->delivery_receipt,
                    "received_by_id" => $request->received_by_id ?? null,
                    "payable_date" => $request->payable_date ? FormatDate::formatDate($request->payable_date) : null,
                    "supplier_id" => $request->supplier_id,
                ]);
            }

            return response()->json('Payable details has been updated.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('PayableController', 'update', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function getAll(Request $request)
    {
        try {
            Gate::authorize('payables_read', auth()->user());

            $query = ProductReceive::query();

            // $query->where(function ($q) {
            //     $q->whereNull('amount')
            //         ->orWhereNotNull('payable_date')
            //         ->orWhereColumn('amount', '<', 'product_cost');
            // });

            $query->with(['supplier', 'received_by', 'status', 'product']);

            $data = $query->paginate($request->rows);

            return response()->json($data, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('PayableController', 'getAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function historyAll(string $receive_id)
    {
        try {
            $payables = PayableTransaction::with(['total_paid', 'total_paid.type'])->where('product_receive_id', $receive_id)->get();
            $total_paid = [];
            foreach ($payables as $payable) {
                foreach ($payable->total_paid as $tots) {
                    $total_paid[] = $tots;
                }
            }

            return response()->json($total_paid, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('PayableController', 'historyAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
