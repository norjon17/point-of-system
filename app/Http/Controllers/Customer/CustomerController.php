<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer\Customer;
use App\Utils\SystemLogging;
use Illuminate\Support\Facades\Gate;// Ensure this is the correct namespace for SystemLogging

class CustomerController extends Controller
{
    //
    public function getAll(Request $request)
    {
        try {

            Gate::authorize('admin_read', auth()->user());
            $query = Customer::query();

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
                'company' => 'required|string',
                'contact_person' => 'required|string',
                'address' => 'required|string',
                'active' => 'required|numeric'
            ]);

            Customer::create($validatedData);

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

            $customer = Customer::findOrFail($id);

            $validatedData = $request->validate([
                'company' => 'required|string',
                'contact_person' => 'required|string',
                'address' => 'required|string',
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
