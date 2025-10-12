<?php

namespace App\Http\Controllers;

use App\Models\Cash\CashTransaction;
use App\Models\Sales\Sale;
use App\Utils\FormatDate;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DashboardController extends Controller
{
    public function get(Request $request)
    {
        try {
            //sales muna
            $validator = Validator::make($request->all(), [
                'year' => 'required|numeric'
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $year = $request->year;
            $cash_weekly = [];

            $cash_monthly = [];


            // For Carbon 2.0+ versions, set week starts on Sunday
            $startOfWeek = Carbon::createFromDate($year)->startOfYear()->startOfWeek(Carbon::SUNDAY);
            $endOfWeek = Carbon::createFromDate($year)->endOfYear()->endOfWeek(Carbon::SATURDAY);

            $weekCount = 1;

            while ($startOfWeek->lte($endOfWeek)) {
                $weekStart = $startOfWeek->copy();
                $weekEnd = $startOfWeek->copy()->endOfWeek(Carbon::SATURDAY);

                $cash_in = CashTransaction::where('type_id', 1)->whereBetween('created_at', [$weekStart->toDateString(), $weekEnd->toDateString()])->get();
                $cash_out = CashTransaction::where('type_id', 2)->whereBetween('created_at', [$weekStart->toDateString(), $weekEnd->toDateString()])->get();
                //sale type
                $sales = CashTransaction::where('type_id', 3)->whereBetween('created_at', [$weekStart->toDateString(), $weekEnd->toDateString()])->get();
                $gcash = CashTransaction::where('type_id', 4)->whereBetween('created_at', [$weekStart->toDateString(), $weekEnd->toDateString()])->get();
                $receivable = CashTransaction::where('type_id', 5)->whereBetween('created_at', [$weekStart->toDateString(), $weekEnd->toDateString()])->get();


                $total_cashin = $cash_in->sum('amount');
                $total_cashout = $cash_out->sum('amount');
                $total_sale = $sales->sum('amount');
                $total_gcash = $gcash->sum('amount');
                $total_receivable = $receivable->sum('amount');

                $cash_weekly[] = [
                    'week' => 'W' . str_pad($weekCount, 2, '0', STR_PAD_LEFT),
                    'label' => $weekStart->format('M d Y') . ' - ' . $weekEnd->format('M d Y'),
                    'start' => $weekStart->toDateString(),
                    'end' => $weekEnd->toDateString(),
                    'total_in' => (float) $total_cashin,
                    'total_out' => (float) $total_cashout,
                    'total_sale' => (float) $total_sale,
                    'total_gcash' => (float) $total_gcash,
                    'total_receivable' => (float) $total_receivable,
                ];

                $weekCount++;
                $startOfWeek->addWeek();
            }

            for ($month = 1; $month <= 12; $month++) {
                $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
                $end = Carbon::createFromDate($year, $month, 1)->endOfMonth();

                //sale type
                $cash_in = CashTransaction::where('type_id', 1)->whereBetween('created_at', [$start, $end])->get();
                $cash_out = CashTransaction::where('type_id', 2)->whereBetween('created_at', [$start, $end])->get();
                $sales = CashTransaction::where('type_id', 3)->whereBetween('created_at', [$start, $end])->get();
                $gcash = CashTransaction::where('type_id', 4)->whereBetween('created_at', [$start, $end])->get();
                $receivable = CashTransaction::where('type_id', 5)->whereBetween('created_at', [$start, $end])->get();

                $total_cashin = $cash_in->sum('amount');
                $total_cashout = $cash_out->sum('amount');
                $total_sale = $sales->sum('amount');
                $total_gcash = $gcash->sum('amount');
                $total_receivable = $receivable->sum('amount');

                $cash_monthly[] = [
                    'start' => $start->toDateString(),
                    'end' => $end->toDateString(),
                    'label' => $start->format('F'),
                    'total_in' => $total_cashin,
                    'total_out' => $total_cashout,
                    'total_sale' => (float) $total_sale,
                    'total_gcash' => (float) $total_gcash,
                    'total_receivable' => (float) $total_receivable,
                ];
            }

            $data = [
                "cash_weekly" => $cash_weekly,
                "cash_monthly" => $cash_monthly,
            ];

            return response()->json($data, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('DashboardController', 'cashIn', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function getToday(Request $request)
    {
        try {
            // Get today's date using the FormatDate util in your timezone
            $today = FormatDate::formatDate(now());

            // Get data for today only
            $cash_in = CashTransaction::where('type_id', 1)
                ->whereDate('created_at', $today)
                ->get();

            $cash_out = CashTransaction::where('type_id', 2)
                ->whereDate('created_at', $today)
                ->get();

            $sales = CashTransaction::where('type_id', 3)
                ->whereDate('created_at', $today)
                ->get();

            $gcash = CashTransaction::where('type_id', 4)
                ->whereDate('created_at', $today)
                ->get();

            $receivable = CashTransaction::where('type_id', 5)
                ->whereDate('created_at', $today)
                ->get();

            $data = [
                'date' => $today,
                'total_in' => (float) $cash_in->sum('amount'),
                'total_out' => (float) $cash_out->sum('amount'),
                'total_sale' => (float) $sales->sum('amount'),
                'total_gcash' => (float) $gcash->sum('amount'),
                'total_receivable' => (float) $receivable->sum('amount'),
            ];

            return response()->json($data, 200);

        } catch (\Throwable $th) {
            SystemLogging::error('DashboardController', 'getToday', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

}
