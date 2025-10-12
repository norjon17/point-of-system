<?php

namespace App\Http\Controllers;

use App\Models\Sales\Sale;
use App\Utils\FormatDate;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;

class ReceiptPrinterController extends Controller
{
    public function print(string $sales_id)
    {
        try {

            $sale = Sale::with(['payment_mode.cash_type'])->findOrFail($sales_id);
            $paid_via = 'Cash';
            $amount_paid_latest = $sale->total_paid()->latest('created_at')->first();

            if ($sale->payment_mode->cash_type->id === 4) {
                $paid_via = 'GCash';
            }

            $date_time = FormatDate::formatDateTime(now());
            $sale_date_time = FormatDate::formatDateTime($sale->created_at);

            $sharedPrinterName = env('SHARED_PRINTER_NAME');

            if (!$sharedPrinterName) {
                return response()->json('Thermal printer is not yet shared', 500);
            }

            // Use the printer's share name here
            $connector = new WindowsPrintConnector($sharedPrinterName);

            $printer = new Printer($connector);

            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text(env('APP_NAME') . "\n");
            $printer->setJustification(Printer::JUSTIFY_LEFT);
            $printer->text("Location: \n");
            $printer->text("Tel: \n");
            $printer->text("TIN: \n");
            $printer->text("\n");
            $printer->text("DATE:  $sale_date_time\n");
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("=============================\n");
            // ITEMS
            $printer->setJustification(Printer::JUSTIFY_LEFT);
            $printer->text(sprintf("%-12s %-4s %12s\n", "Item A", "x1", "PHP 100.00"));
            $printer->text(sprintf("%-12s %-4s %12s\n", "Item B", "x2", "PHP  50.00"));
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("=============================\n");

            //payments
            $printer->setJustification(Printer::JUSTIFY_RIGHT);
            $printer->text("Paid Via:  $paid_via\n");
            $printer->text("Latest Payment:  $paid_via\n");
            $printer->text("Total Amount Paid:  $sale->received\n");

            // TOTALS
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("=============================\n");
            $printer->setJustification(Printer::JUSTIFY_RIGHT);
            $printer->text("VAT 12%: PHP 200.00\n");
            $printer->text("BILL TOTAL: PHP 200.00\n");


            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("=============================\n");
            $printer->setJustification(Printer::JUSTIFY_LEFT);
            $printer->text("Date Printed: $date_time\n");
            $printer->cut();
            $printer->close();

            return "Printed successfully!";
        } catch (\Exception $e) {
            return response()->json('Print failed: ' . $e->getMessage(), 500);
        }
    }

    public function printData(string $sales_id)
    {
        try {
            $sale = Sale::with(['payment_mode.cash_type', 'total_paid', 'products', 'sale_products'])->findOrFail($sales_id);
            $paid_via = ($sale->payment_mode->cash_type->id === 4) ? 'GCash' : 'Cash';

            $date_time = FormatDate::formatDateTime(now());
            $sale_date_time = FormatDate::formatDateTime($sale->created_at);

            $paymentHistory = '';
            $totalPaid = 0;
            $companyName = "" . env('APP_NAME');

            // Helper to format money WITHOUT PHP prefix
            $formatMoney = fn($amount) => number_format($amount, 2);

            $receipt = '';
            $receipt .= str_pad($companyName, 32, ' ', STR_PAD_BOTH) . "\n";
            $receipt .= "Currency: PHP\n";
            $receipt .= "Location: \n";
            $receipt .= "Tel: \n";
            $receipt .= "TIN: \n\n";
            $receipt .= "DATE:  $sale_date_time\n";
            $receipt .= str_repeat("=", 32) . "\n";

            // Map product_id to product name from $sale->products
            $productMap = $sale->products->keyBy('id'); // [1 => Product instance]

            // Add actual items
            $actualTotal = 0;
            foreach ($sale->sale_products as $orderedProduct) {
                $product = $productMap->get($orderedProduct->product_id);
                $productName = $product?->name ?? 'Unknown';
                $qty = $orderedProduct->quantity;
                $lineTotal = $orderedProduct->selling_price;
                $actualTotal += $lineTotal * $qty;

                // Trim product name to max 100 chars
                $productName = mb_substr($productName, 0, 25);

                // Format total price
                $formattedTotal = $formatMoney($lineTotal);

                // Define line width positions
                $itemWidth = 20;  // Total for product name + qty
                $priceWidth = 11;

                // Build first line (truncate and break if too long)
                $line = sprintf(
                    "%-" . ($itemWidth - 5) . "s x%-3d %" . $priceWidth . "s\n",
                    mb_substr($productName, 0, $itemWidth - 5),
                    $qty,
                    $formattedTotal
                );

                // Check if product name is longer and wrap the rest
                $remaining = mb_substr($productName, $itemWidth - 5);
                while ($remaining !== '') {
                    $wrap = mb_substr($remaining, 0, $itemWidth);
                    $remaining = mb_substr($remaining, $itemWidth);

                    $line .= sprintf("%-" . ($itemWidth + $priceWidth) . "s\n", str_pad($wrap, $itemWidth));
                }

                $receipt .= $line;
            }

            // Payment History
            if ($sale->total_paid->isNotEmpty()) {
                $paymentHistory = str_repeat("=", 32) . "\n";
                $paymentHistory .= "PAYMENT HISTORY:\n";

                foreach ($sale->total_paid as $payment) {
                    $mode = $payment->type_id === 4 ? 'GCash' : 'Cash';
                    $timestamp = FormatDate::formatDate($payment->created_at);

                    $paymentHistory .= sprintf(
                        "%-5s  %-11s  %12s\n",
                        $mode,
                        $timestamp,
                        $formatMoney($payment->amount)
                    );

                    $totalPaid += $payment->amount;
                }

                $paymentHistory .= str_repeat("=", 32) . "\n";
                $paymentHistory .= sprintf(
                    "%-20s %11s\n",
                    "TOTAL PAID:",
                    $formatMoney($totalPaid)
                );

                $receipt .= $paymentHistory;
            }

            $receipt .= str_repeat("=", 32) . "\n";

            // Use actual VAT, Discount, Subtotal and Total amount to pay
            $vat = $sale->vat;
            // Sum line-item discounts
            $lineItemDiscountTotal = $sale->sale_products->sum('discount');
            // Add to sale-level discount
            $totalDiscount = $lineItemDiscountTotal + $sale->discount;

            $subtotal = $actualTotal;
            $totalToPay = $subtotal + $vat - $totalDiscount;

            $receipt .= sprintf("%-20s %11s\n", "SUBTOTAL:", $formatMoney($subtotal));
            $receipt .= sprintf("%-20s %11s\n", "VAT 12%:", $formatMoney($vat));
            $receipt .= sprintf("%-20s %11s\n", "DISCOUNT:", $formatMoney($totalDiscount));
            $receipt .= sprintf("%-20s %11s\n", "TOTAL BILL:", $formatMoney($totalToPay));

            // Show balance and received amounts if useful
            $receipt .= sprintf("%-20s %11s\n", "RECEIVED:", $formatMoney($sale->received));

            if ($sale->received > $totalToPay) {
                $change = $sale->received - $totalToPay;
                $receipt .= sprintf("%-20s %11s\n", "CHANGE:", $formatMoney($change));
            } else {
                $receipt .= sprintf("%-20s %11s\n", "BALANCE:", $formatMoney($sale->balance));
            }

            $receipt .= str_repeat("=", 32) . "\n";
            $receipt .= "Date Printed: $date_time\n";

            return response()->json($receipt)->header('Content-Type', 'text/plain');
        } catch (\Throwable $th) {
            SystemLogging::error('ReceiptPrinterController', 'printData', $th);
            return response()->json(['error' => 'Error printing receipt'], 500);
        }
    }
}
