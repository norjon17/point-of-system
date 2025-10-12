<?php

namespace App\Http\Controllers;

use App\Models\Product\ProductUOM;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UOMController extends Controller
{

    public function getAll(Request $request)
    {
        try {
            Gate::authorize('admin_read', auth()->user());
            $query = ProductUOM::query();

            if (!empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%$searchTerm%")
                        ->orWhere('abbr', 'like', "%$searchTerm%");
                });
            }

            $suppliers = $query->paginate($request->rows);

        } catch (\Throwable $th) {
            SystemLogging::error('SupplierController', 'index', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json($suppliers, 200);
    }

    public function store(Request $request)
    {
        try {
            Gate::authorize('admin_create', auth()->user());
            $validatedData = $request->validate([
                'name' => 'required|string',
                'abbr' => 'required|string',
                'active' => 'required|numeric'
            ]);

            ProductUOM::create($validatedData);

            return response()->json('New UOM has been added.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('UOMController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            Gate::authorize('admin_update', auth()->user());

            $supplier = ProductUOM::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'required|string',
                'abbr' => 'required|string',
                'active' => 'required|numeric'
            ]);

            $supplier->update($validatedData);

            return response()->json('New UOM has been updated.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('UOMController', 'update', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
