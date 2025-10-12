<?php

namespace App\Http\Controllers;

use App\Models\Product\ProductLocation;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class LocationController extends Controller
{
    public function getAll(Request $request)
    {
        try {
            Gate::authorize('admin_read', auth()->user());

            $query = ProductLocation::query();

            if (!empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%$searchTerm%")
                        ->orWhere('description', 'like', "%$searchTerm%");
                });
            }

            $suppliers = $query->paginate($request->rows);

        } catch (\Throwable $th) {
            SystemLogging::error('LocationController', 'index', $th);
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
                'description' => 'nullable|string',
                'active' => 'required|numeric'
            ]);

            ProductLocation::create($validatedData);

            return response()->json('New location has been added.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('LocationController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            Gate::authorize('admin_update', auth()->user());

            $supplier = ProductLocation::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'required|string',
                'description' => 'nullable|string',
                'active' => 'required|numeric'
            ]);

            $supplier->update($validatedData);

            return response()->json('New location has been updated.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('LocationController', 'update', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
