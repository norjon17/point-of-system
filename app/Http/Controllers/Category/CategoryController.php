<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Models\Product\ProductCategory;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CategoryController extends Controller
{
    public function getAll(Request $request)
    {
        try {
            Gate::authorize('admin_read', auth()->user());
            $query = ProductCategory::query();

            if (!empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%$searchTerm%")
                        ->orWhere('description', 'like', "%$searchTerm%");
                });
            }

            $products = $query->paginate($request->rows);

        } catch (\Throwable $th) {
            SystemLogging::error('CustomerController', 'index', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json($products, 200);

    }

    public function store(Request $request)
    {

        try {
            Gate::authorize('admin_create', auth()->user());

            $validatedData = $request->validate([
                'name' => 'required|string',
                'description' => 'nullable|string',
                'active' => 'required|numeric'
            ]);

            ProductCategory::create($validatedData);

        } catch (\Throwable $th) {
            SystemLogging::error('CustomerController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }


        return response()->json('Customer created successfully.', 201);
    }

    public function update(Request $request, $id)
    {

        try {
            Gate::authorize('admin_update', auth()->user());

            $customer = ProductCategory::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'required|string',
                'description' => 'nullable|string',
                'active' => 'required|numeric'
            ]);

            $customer->update($validatedData);

        } catch (\Throwable $th) {
            SystemLogging::error('CustomerController', 'update', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json('Customer updated successfully.');
    }
}
