<?php

namespace App\Http\Controllers\Sale;

use App\Http\Controllers\Controller;
use App\Models\Cash\CashDenomination;
use App\Models\Cash\CashTransaction;
use App\Models\Customer\Customer;
use App\Models\Product\Product;
use App\Models\Product\ProductReceive;
use App\Models\Receivable\Receivable;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleProduct;
use App\Models\Sales\SalesTransaction;
use App\Utils\FormatDate;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        try {
            $auth_user = auth()->user();

            Gate::authorize('sales', $auth_user);

            // Validate the request data
            $validator = Validator::make(
                $request->all(),
                [
                    'customer_id' => 'required',
                    'cash_mode' => 'required',
                    'gcash_ref_num' => 'required_if:cash_mode,gcash',
                    'order_type' => 'required'
                ],
            );

            $orders = $request->orders;
            if (empty($orders)) {
                return response()->json('Orders is required', 403);
            }

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            //validate gcash "cash" must not be zero
            if ($request->cash_mode === 'gcash') {
                $validator = Validator::make(
                    $request->all(),
                    [
                        'cash' => 'required|min:1',
                    ],
                );
                // If validation fails, return a JSON response with errors
                if ($validator->fails()) {
                    $errorMessages = GetErrorValidator::getError($validator->errors());
                    return response()->json($errorMessages, 400);
                }
            }

            //calculate price, discount, sub total, vat and balance
            $price = 0;
            $products_name = [];
            foreach ($orders as $order) {
                $item = Product::find($order['product_id']);
                if ($item) {
                    $discount = $order['discount'] && is_numeric($order['discount']) ? (float) $order['discount'] : 0;
                    $quantity = $order['quantity'] && is_numeric($order['quantity']) ? (int) $order['quantity'] : 0;

                    $price += ($item->selling_price * $quantity) - $discount;

                    $products_name[] = $item->name;
                }
            }

            $service_fee = $request->service_fee && is_numeric($request->service_fee) ? (float) $request->service_fee : 0;
            $delivery_fee = $request->delivery_fee && is_numeric($request->delivery_fee) ? (float) $request->delivery_fee : 0;
            $discount = $request->discount && is_numeric($request->discount) ? (float) $request->discount : 0;
            $cash = $request->cash && is_numeric($request->cash) ? (float) $request->cash : 0;

            //price is the product, 
            //sub total is the TOTAL to be paid
            $sub_total = $price + $service_fee + $delivery_fee - $discount;

            $vat = round($sub_total * 0.12, 2);
            $balance = $sub_total + $vat;
            $change = (float) $cash - $balance;

            $cash_mode = $request->cash_mode;
            $customer = Customer::find($request->customer_id);
            $payment_due_date = $request->payment_due_date ? FormatDate::formatDate($request->payment_due_date) : null;

            if ($change < 0) {
                //if the change is negative, validate that payment due date is required
                $validator = Validator::make(
                    $request->all(),
                    [
                        'payment_due_date' => 'required',
                    ],
                    [
                        'payment_due_date.required' => 'Payment due date is required if partially paid or unpaid.'
                    ]
                );
                // If validation fails, return a JSON response with errors
                if ($validator->fails()) {
                    $errorMessages = GetErrorValidator::getError($validator->errors());
                    return response()->json($errorMessages, 400);
                }
            }

            if ($change > 0 && $cash_mode === 'gcash') {
                //if there is change in gcash mode, return error and only exact amount to be accepted
                return response()->json('Only exact amount can be accepted in GCash.', 403);
            }

            $cash_transactions = null;

            if ($cash_mode === 'cash') {
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

                //save for SALE
                $cash_transactions = CashTransaction::create([
                    'user_id' => $auth_user->id,
                    'type_id' => 3, //sale
                    'details' => $details,
                ]);
                CashDenomination::create([
                    'ct_id' => $cash_transactions->id,
                    'denomination' => $cash,
                    'quantity' => 1,
                ]);


                if ((int) $cash === 0) {
                    //not paid
                    $message = "Order(s) " . implode(", ", $products_name) . " has been received with receivable amount " . abs($change) .
                        " to pay in $payment_due_date";
                    $status_id = 4; //not paid status
                } else if ($change > 0) {
                    //paid with change
                    $message = "Order(s) " . implode(", ", $products_name) . " has been received with change $change pesos";

                    //automatic cash out with details for change
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

                    $status_id = 2;//change status

                } else if ((int) $change < 0) {
                    //partial payment
                    $message = "Order(s) " . implode(", ", $products_name) . " has been received with receivable amount " . abs($change) .
                        " to pay in $payment_due_date";

                    $status_id = 1;//partial status
                } else {
                    //if change is zero, means the cash given is exact to balance
                    $message = "Order(s) " . implode(", ", $products_name) . " has been received with exact amount of cash $cash";
                    $status_id = 3;//paid status
                }
            } else {
                //if gcash
                if ((int) $change === 0) {
                    //paid
                    $message = "Order(s) " . implode(", ", $products_name) . " has been received with exact amount of gcash $cash";
                    $status_id = 3;//paid status
                } else {
                    $message = "Order(s) " . implode(", ", $products_name) . " has been received with receivable amount " . abs($change) .
                        " to pay in $payment_due_date";
                    $status_id = 1;//partial payment
                }

                //save it too in cash transaction
                $cash_transactions = CashTransaction::create([
                    'user_id' => $auth_user->id,
                    'type_id' => 4, //gcash
                    'details' => $message,
                ]);
                CashDenomination::create([
                    'ct_id' => $cash_transactions->id,
                    'denomination' => $cash,
                    'quantity' => 1,
                ]);
            }

            //save to transaction lists of orders
            $sale = Sale::create([
                'order_type_id' => $request->order_type === 'pickup' ? 1 : 2, //2 is delivery
                'customer_id' => $request->customer_id,
                'service_fee' => $service_fee,
                'delivery_fee' => $delivery_fee,
                'discount' => $discount,
                'price' => $price,
                'sub_total' => $sub_total,
                'vat' => $vat,
                // 'balance' => $balance,
                // 'received' => $cash,
                'address' => $request->address,
            ]);

            //sale or gcash transaction logs
            if ($cash_transactions) {
                //create on sales transactions
                SalesTransaction::create([
                    'sale_id' => $sale->id,
                    'cash_transaction_id' => $cash_transactions->id
                ]);
            }

            foreach ($orders as $order) {
                $item = Product::find($order['product_id']);
                $total = 0;
                if ($item) {
                    $discount = $order['discount'] && is_numeric($order['discount']) ? (float) $order['discount'] : 0;
                    $quantity = $order['quantity'] && is_numeric($order['quantity']) ? (int) $order['quantity'] : 0;

                    $total = ($item->selling_price * $quantity) - $discount;

                    SaleProduct::create([
                        'sales_id' => $sale->id,
                        'product_id' => $item->id,
                        'quantity' => $quantity,
                        'discount' => $discount,
                        'selling_price' => $item->selling_price,
                        'total' => $total
                    ]);

                    //must update the quantity
                    $quantity = $item->quantity - $order['quantity'];
                    if ($quantity > 0) {
                        $item->quantity = $quantity;
                    } else {
                        $item->quantity = 0;
                        //payables
                        //if the quantity of the product is zero, it will automatically add to payables
                        //remove the negative
                        $quantity = abs($quantity);
                        //add the quantity to the payables
                        ProductReceive::create([
                            "product_id" => $item->id,
                            'status_id' => 4,//not paid
                            "quantity" => $quantity,
                        ]);
                    }
                    $item->save();
                }
            }

            //receivable
            if ($change < 0 || (int) $cash === 0) {
                Receivable::create([
                    'sales_id' => $sale->id,
                    'status_id' => $status_id,
                    'payment_due_date' => $payment_due_date,
                ]);
            }



            return response()->json(['message' => $message, 'id' => $sale->id], 200);

        } catch (\Throwable $th) {
            SystemLogging::error('SalesController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function updateDeliveryStatus(Request $request)
    {
        try {

            Gate::authorize('sales_lists_update', auth()->user());

            $validator = Validator::make($request->all(), [
                'address' => 'required',
                'delivered_by_id' => 'required',
                'vehicle_id' => 'required'
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $sale = Sale::where('id', $request->id)->first();

            if (!$sale) {
                return response()->json('Sale not found', 404);
            }

            Sale::where('id', $request->id)->update([
                'address' => $request->address,
                'delivered_by_id' => $request->delivered_by_id,
                'vehicle_id' => $request->vehicle_id,
                'received_by' => $request->received_by ?? null,
                'departed' => FormatDate::formatDateTime($request->departed) ?? null,
                'returned' => FormatDate::formatDateTime($request->returned) ?? null,
                'delivery_status_id' => $request->delivery_status_id ?? null,
            ]);


            return response()->json('Delivery status has been updated.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('SalesController', 'updateDeliveryStatus', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function getAll(Request $request)
    {
        try {
            Gate::authorize('sales_lists_read', auth()->user());

            $query = Sale::query();

            if ($request->order_by) {

                $sort = $request->order_by['sort'];
                $column = $request->order_by['id'];

                if ($column === 'last_transaction') {
                    $query->orderBy('updated_at', $sort);
                }
            }

            $query->with(['customer', 'order_type', 'delivery_status']);

            $data = $query->paginate($request->rows);

            return response()->json($data, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('SalesController', 'getAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
