<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Supplier;
use App\Utils\SystemLogging;
use Illuminate\Support\Facades\Gate;

class SupplierController extends Controller
{
    public function getAll(Request $request)
    {
        try {
            Gate::authorize('admin_read', auth()->user());
            $query = Supplier::query();

            if (!empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('company', 'like', "%$searchTerm%")
                        ->orWhere('contact_person', 'like', "%$searchTerm%");
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
                'company' => 'required|string',
                'contact_person' => 'required|string',
                'active' => 'required|numeric'
            ]);

            $supplier = Supplier::create($validatedData);

        } catch (\Throwable $th) {
            SystemLogging::error('SupplierController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json([
            'message' => 'Supplier created successfully.',
            'data' => $supplier,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        try {
            Gate::authorize('admin_update', auth()->user());

            $supplier = Supplier::findOrFail($id);

            $validatedData = $request->validate([
                'company' => 'required|string',
                'contact_person' => 'required|string',
                'active' => 'required|numeric'
            ]);

            $supplier->update($validatedData);

        } catch (\Throwable $th) {
            SystemLogging::error('SupplierController', 'update', $th);
            return response()->json($th->getMessage(), 500);
        }

        return response()->json([
            'message' => 'Supplier updated successfully.',
            'data' => $supplier,
        ]);
    }
}
