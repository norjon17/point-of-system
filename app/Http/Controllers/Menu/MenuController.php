<?php

namespace App\Http\Controllers\Menu;

use App\Http\Controllers\Controller;
use App\Models\Customer\Customer;
use App\Models\DeliveryStatus;
use App\Models\Employee\Employee;
use App\Models\PaymentMode;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\Product\ProductLocation;
use App\Models\Product\ProductUOM;
use App\Models\Supplier;
use App\Models\User;
use App\Models\UserAccess;
use App\Models\Vehicle;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function productMenu()
    {
        try {
            $locations = ProductLocation::where('active', 1)->get();
            $categories = ProductCategory::with([
                'cat_subs' => function ($q) {
                    $q->where('active', 1);
                }
            ])->where('active', 1)->get();
            $uom = ProductUOM::where('active', 1)->get();

            return response()->json([
                'locations' => $locations,
                'categories' => $categories,
                'uom' => $uom,
            ]);
        } catch (\Throwable $th) {
            SystemLogging::error('MenuController', 'cashInOutMenu', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    public function productListMenu()
    {
        try {
            $products = Product::all();
            $suppliers = Supplier::where('active', 1)->get();
            $users = User::where('active', 1)->get();

            return response()->json([
                'products' => $products,
                'suppliers' => $suppliers,
                'users' => $users,
            ]);
        } catch (\Throwable $th) {
            SystemLogging::error('MenuController', 'cashInOutMenu', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function pointOfSaleMenu()
    {
        try {
            $customers = Customer::where('active', 1)->get();
            $modes = PaymentMode::all();

            return response()->json([
                'customers' => $customers,
                'modes' => $modes
            ]);
        } catch (\Throwable $th) {
            SystemLogging::error('MenuController', 'cashInOutMenu', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    public function deliveryMenu()
    {
        try {
            $users = User::where('active', 1)->get();
            $vehicles = Vehicle::all();
            $delivery_statuses = DeliveryStatus::all();

            return response()->json([
                'users' => $users,
                'vehicles' => $vehicles,
                'delivery_statuses' => $delivery_statuses
            ]);
        } catch (\Throwable $th) {
            SystemLogging::error('MenuController', 'cashInOutMenu', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    // public function usersMenu()
    // {
    //     try {
    //         $accesses = UserAccess::all();

    //         return response()->json([
    //             'accesses' => $accesses,
    //         ]);
    //     } catch (\Throwable $th) {
    //         SystemLogging::error('MenuController', 'usersMenu', $th);
    //         return response()->json($th->getMessage(), 500);
    //     }
    // }

    public function cashMenu()
    {
        try {
            $employees = Employee::where('active', 1)->get();

            return response()->json([
                'employees' => $employees,
            ]);
        } catch (\Throwable $th) {
            SystemLogging::error('MenuController', 'cashMenu', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

}
