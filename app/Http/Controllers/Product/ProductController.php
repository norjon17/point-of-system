<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product\Product;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use PhpParser\Node\Expr\PreDec;

class ProductController extends Controller
{

    public function addProduct(Request $request)
    {
        try {

            Gate::authorize('products_create', auth()->user());

            // Validate the request data
            $validator = Validator::make(
                $request->all(),
                [
                    'name' => 'required|unique:products,name',
                    // "cat_id" => 'required',
                    // "uom_id" => 'required',
                    // "product_cost" => 'required|numeric|min:0',
                    // "selling_price" => 'required|numeric|min:0',
                    // "quantity" => 'required|numeric|min:0',
                    'image' => 'file|mimetypes:image/png,image/jpeg,image/jpg',
                    'barcode' => 'nullable|unique:products,barcode',
                    'item_code' => 'nullable|unique:products,item_code,' . $request->item_code
                ],
                [
                    'image.mimetypes' => 'The Image must be a valid file type: png, jpeg, jpg, gif.',
                    'barcode.unique' => 'The barcode already exists.'
                ]
            );

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            if ($request->hasFile('image')) {
                // Generate a unique filename for the attachment
                $storedFilename = "product_images/" . Str::uuid() . '.' . $request->image->getClientOriginalExtension();

                Storage::disk('public')->put($storedFilename, file_get_contents($request->image));
            }

            Product::create([
                'name' => $request->name,
                'image_original_name' => $request->hasFile('image') ? $request->image->getClientOriginalName() : null,  // The original filename of the attachment
                'image_path_name' => $storedFilename ?? null,  // The unique filename of the attachment
                "cat_id" => $request->cat_id,
                "cat_sub_id" => $request->cat_sub_id ?? null,
                "loc_id" => $request->loc_id,
                "uom_id" => $request->uom_id,
                "description" => $request->description,
                "barcode" => $request->barcode ?? null,
                "product_cost" => $request->product_cost,
                "selling_price" => $request->selling_price,
                "quantity" => $request->quantity,
                "batch_number" => $request->batch_number,
                "status" => $request->status ?? 0,
                'item_code' => $request->item_code ?? null,
                'brand' => $request->brand ?? null,
            ]);

            return response()->json('New product has been saved.', 200);

        } catch (\Throwable $th) {
            SystemLogging::error('ProductController', 'addProduct', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function updateProduct(Request $request)
    {
        try {

            Gate::authorize('products_update', auth()->user());
            // Validate the request data
            $validator = Validator::make(
                $request->all(),
                [
                    'id' => 'required|numeric',
                    'name' => 'required|unique:products,name,' . $request->id,
                    // "cat_id" => 'required',
                    // "uom_id" => 'required',
                    // "product_cost" => 'required|numeric|min:0',
                    // "selling_price" => 'required|numeric|min:0',
                    // "quantity" => 'required|numeric|min:0',
                    'image' => 'file|mimetypes:image/png,image/jpeg,image/jpg',
                    'barcode' => 'nullable|unique:products,barcode,' . $request->id,
                    'item_code' => 'nullable|unique:products,item_code,' . $request->item_code
                ],
                [
                    'image.mimetypes' => 'The Image must be a valid file type: png, jpeg, jpg, gif.',
                    'barcode.unique' => 'The barcode already exists.'
                ]
            );

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            $product = Product::findOrFail($request->id);

            if ($request->hasFile('image')) {
                // Generate a unique filename for the attachment
                $storedFilename = $product->image_path_name ?? "product_images/" . Str::uuid() . '.' . $request->image->getClientOriginalExtension();

                Storage::disk('public')->put($storedFilename, file_get_contents($request->image));
            }

            if ($request->hasFile('image')) {
                Product::where('id', $request->id)->update([
                    'image_original_name' => $request->image->getClientOriginalName(),
                    'image_path_name' => $storedFilename
                ]);
            }
            Product::where('id', $request->id)->update([
                'name' => $request->name,
                "cat_id" => $request->cat_id,
                "cat_sub_id" => $request->cat_sub_id ?? null,
                "loc_id" => $request->loc_id,
                "uom_id" => $request->uom_id,
                "description" => $request->description,
                "barcode" => $request->barcode ?? null,
                "product_cost" => $request->product_cost,
                "selling_price" => $request->selling_price,
                "quantity" => $request->quantity,
                "batch_number" => $request->batch_number,
                "status" => $request->status ?? 0,
                'item_code' => $request->item_code ?? null,
                'brand' => $request->brand ?? null,
            ]);

            return response()->json('Product has been updated.', 200);

        } catch (\Throwable $th) {
            SystemLogging::error('ProductController', 'updateProduct', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    public function getAll(Request $request)
    {
        try {

            Gate::authorize('products_read', auth()->user());
            $query = Product::query();

            // Filter issues based on the 'search' query parameter
            if (!empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%$searchTerm%")
                        ->orWhere('description', 'like', "%$searchTerm%")
                        ->orWhere('barcode', 'like', "%$searchTerm%")
                        ->orWhere('selling_price', 'like', "%$searchTerm%");
                });
            }

            $products = $query->paginate($request->rows);

            return response()->json($products, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('ProductController', 'getAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function searchBarcode(Request $request)
    {
        try {

            $searchTerm = $request->search;
            $products = Product::where(function ($q) use ($searchTerm) {
                $q->where('barcode', $searchTerm);
            })->get();

            return response()->json($products, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('ProductController', 'getAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
