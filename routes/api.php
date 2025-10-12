<?php

use App\Http\Controllers\Access\AccessModuleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Cash\CashTransactionController;
use App\Http\Controllers\Cash\TurnoverController;
use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\Category\CategorySubController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\Menu\MenuController;
use App\Http\Controllers\Payable\PayableController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\Product\ProductReceiveController;
use App\Http\Controllers\ReceiptPrinterController;
use App\Http\Controllers\Receivable\ReceivableController;
use App\Http\Controllers\Sale\SaleController;
use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\Supplier\SupplierController;
use App\Http\Controllers\UOMController;
use App\Http\Controllers\UsersController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    $user = $request->user();

    if ($user->active !== 1) {
        auth('web')->logout();
        session()->invalidate();
        return response()->json('User is currently inactive.', 403);
    }

    $user->load([
        'access_admin',
        'access_admin_access_update',
        'access_cashier',
        'access_cashier_in',
        'access_cashier_out',
        'access_cashier_turnover',
        'access_cashier_turnover_logs',
        'access_products',
        'access_products_receive',
        'access_sales',
        'access_sales_insert',
        'access_sales_lists',
        'access_receivables',
        'access_payables',
        'access_payables_update_details',
    ]);
    return $user;
})->middleware('auth:sanctum');

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('logout', [LogoutController::class, 'logout']);
    Route::post('/password-update', [PasswordController::class, 'updatePassword']);

    Route::prefix('/cash')->group(function () {
        Route::controller(CashTransactionController::class)->group(function () {
            Route::post('/cash-in', 'cashIn');
            Route::post('/cash-out', 'cashOut');
            Route::post('/cash-in-v2', 'cashInV2');
            Route::post('/cash-out-v2', 'cashOutV2');
            Route::post('/transactions', 'getAll');
            Route::get('/total-cash', 'getTotalAmount');
        });
    });

    Route::prefix('/product')->group(function () {
        Route::controller(ProductController::class)->group(function () {
            Route::post('/lists', 'getAll');
            Route::post('/lists-nofilter', 'getAllNoFilter');
            Route::post('/add', 'addProduct');
            Route::post('/update/{id}', 'updateProduct');
            Route::post('/barcode', 'searchBarcode');
        });
        Route::controller(ProductReceiveController::class)->group(function () {
            Route::post('/receive', 'receiveProduct');
        });
    });

    Route::prefix('/sale')->group(function () {
        Route::controller(SaleController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/delivery/{id}', 'updateDeliveryStatus');
        });
    });
    Route::prefix('/receivable')->group(function () {
        Route::controller(ReceivableController::class)->group(function () {
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
            Route::get('/history-all/{sale_id}', 'historyAll');
        });
    });

    Route::prefix('/payable')->group(function () {
        Route::controller(PayableController::class)->group(function () {
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
            Route::post('/details', 'updateDetails');
            Route::get('/history-all/{receive_id}', 'historyAll');
        });
    });

    Route::prefix('/turnover')->group(function () {
        Route::controller(TurnoverController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::get('/', 'getTurnover');
            Route::get('/{id}', 'getTurnover');
            Route::put('/{id}', 'acceptTurnover');
        });
    });

    Route::prefix('/menu')->group(function () {
        Route::controller(MenuController::class)->group(function () {
            Route::get('/product', 'productMenu');
            Route::get('/product-list', 'productListMenu');
            Route::get('/pos', 'pointOfSaleMenu');
            Route::get('/delivery', 'deliveryMenu');
            // Route::get('/users', 'usersMenu');
            Route::get('/cash', 'cashMenu');
        });
    });

    Route::prefix('/customers')->group(function () {
        Route::controller(CustomerController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
        });
    });

    Route::prefix('/suppliers')->group(function () {
        Route::controller(SupplierController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
        });
    });

    Route::prefix('/users')->group(function () {
        Route::controller(UsersController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
        });
    });

    Route::prefix('/categories')->group(function () {
        Route::controller(CategoryController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
        });
    });
    Route::prefix('/category-subs')->group(function () {
        Route::controller(CategorySubController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
        });
    });
    Route::prefix('/uom')->group(function () {
        Route::controller(UOMController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
        });
    });
    Route::prefix('/location')->group(function () {
        Route::controller(LocationController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
        });
    });

    Route::prefix('/accesses')->group(function () {
        Route::controller(AccessModuleController::class)->group(function () {
            Route::get('/user/{user_id}', 'getByUserAccess');
            Route::post('/', 'storeOrUpdate');
            // Route::get('/all', 'getAll');
        });
    });

    Route::prefix('/employees')->group(function () {
        Route::controller(EmployeeController::class)->group(function () {
            Route::post('/', 'store');
            Route::post('/all', 'getAll');
            Route::put('/{id}', 'update');
            Route::get('/{id}', 'get');
            Route::prefix('/loan')->group(function () {
                Route::post('/', 'insertLoan');
                Route::put('/{id}', 'updateLoan');
                Route::get('/all/{id}', 'getLoans');
            });
            Route::prefix('/salary')->group(function () {
                Route::post('/', 'insertSalary');
                Route::put('/{id}', 'updateLoan');
                Route::get('/all/{id}', 'getSalaries');
            });
        });
    });

    Route::controller(DashboardController::class)->group(function () {
        Route::get('/dashboard', 'get');
        Route::get('/dashboard-today', 'getToday');
    });

    Route::get('/print/{sale_id}', [ReceiptPrinterController::class, 'printData']);

});


