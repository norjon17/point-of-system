<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Cash\CashDenomination;
use App\Models\Cash\CashTransaction;
use App\Models\Payable\PayableTransaction;
use App\Models\Product\Product;
use App\Models\Product\ProductReceive;
use App\Utils\FormatDate;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductReceiveController extends Controller
{
    public function receiveProduct(Request $request)
    {
        try {
            Gate::authorize('products_receive', auth()->user());
            $auth_user = auth()->user();
            // Validate the request data
            $validator = Validator::make(
                $request->all(),
                [
                    'delivery_receipt' => 'required',
                    "product_id" => 'required',
                    "product_cost" => 'required|numeric|min:0',
                    "quantity" => 'required|numeric|min:1',
                    'image' => 'required|file|mimetypes:image/png,image/jpeg,image/jpg',
                ],
                [
                    'image.mimetypes' => 'The DR Image must be a valid file type: png, jpeg, jpg, gif.',
                    'image.required' => 'The DR Image is required.',
                ]
            );

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $product = Product::where('id', $request->product_id)->first();

            //this is for pay cash transaction in receive product
            $amount = $request->amount;
            if ($amount && $amount > 0) {

                $total_cashed_in = CashTransaction::with('denominations')
                    ->where('type_id', 1)//get total cash in
                    ->get()->sum('amount');

                if ($amount > $total_cashed_in) {
                    //return error
                    return response()->json("Insufficient cash to cash out.", 403);
                }

                //insert transaction as cash out
                $cash_transaction = CashTransaction::create([
                    'user_id' => $auth_user->id,
                    'type_id' => 2, //cash out id
                    'details' => "Product Received: $product->name",
                ]);
                //cash denomination is not specified here so the cash is exact multiple by 1
                CashDenomination::create([
                    'ct_id' => $cash_transaction->id,
                    'denomination' => $amount,
                    'quantity' => 1,
                ]);
            }

            //this is for payable table

            //update the existing product
            Product::where('id', $request->product_id)
                ->update([
                    'product_cost' => $request->product_cost, //replace existing product cost
                    'quantity' => $product->quantity + $request->quantity //add quantity
                ]);

            // Generate a unique filename for the attachment
            $storedFilename = "product_receive_dr/" . Str::uuid() . '.' . $request->image->getClientOriginalExtension();
            Storage::disk('public')->put($storedFilename, file_get_contents($request->image));

            //save on product reveide table
            $product_receive = ProductReceive::create([
                "product_id" => $product->id,
                "supplier_id" => $request->supplier_id,
                "received_by_id" => $request->received_by_id ?? null,
                "product_cost" => $request->product_cost,
                // "amount" => $amount ?? null,
                "quantity" => $request->quantity,
                "delivery_receipt" => $request->delivery_receipt,
                'image_original_name' => $request->image->getClientOriginalName(),
                'image_path_name' => $storedFilename,
                "payable_date" => $request->payable_date ? FormatDate::formatDate($request->payable_date) : null,
                'status_id' => $amount ? 3 : 4, //3 = paid, 4 = not paid
            ]);

            if ($cash_transaction) {
                PayableTransaction::create([
                    'product_receive_id' => $product_receive->id,
                    'cash_transaction_id' => $cash_transaction->id
                ]);
            }

            return response()->json('Product has been received and updated.', 200);

        } catch (\Throwable $th) {
            SystemLogging::error('ProductReceiveController', 'receiveProduct', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
