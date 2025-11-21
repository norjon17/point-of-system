<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Validator;

class UsersController extends Controller
{

    public function store(Request $request)
    {
        try {
            Gate::authorize('admin_create', auth()->user());
            $validator = Validator::make($request->all(), [
                'name' => 'required',
                'lname' => 'string|nullable',
                'username' => "required|unique:users,username",
                // 'access_id' => 'required|numeric',
                'password' => 'required|string|min:6'
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }


            User::create([
                'name' => $request->name,
                'lname' => $request->lname ?? null,
                'email' => $request->name,
                'password' => Hash::make($request->password),
                'username' => $request->username,
                // 'access_id' => $request->access_id,
                'active' => 1,
            ]);

            return response()->json('New user has been added.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('UsersController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    public function update(Request $request)
    {
        try {
            Gate::authorize('admin_update', auth()->user());
            $validator = Validator::make($request->all(), [
                'name' => 'required',
                'lname' => 'string|nullable',
                'username' => "required|unique:users,username,$request->id",
                // 'access_id' => 'required|numeric',
                'password' => 'nullable|string|min:6',
                'active' => 'required'
            ]);

            // If validation fails, return a JSON response with errors
            if ($validator->fails()) {
                $errorMessages = GetErrorValidator::getError($validator->errors());
                return response()->json($errorMessages, 400);
            }

            User::where('id', $request->id)->update([
                'name' => $request->name,
                'lname' => $request->lname ?? null,
                'email' => $request->name,
                'username' => $request->username,
                // 'access_id' => $request->access_id,
                'active' => $request->active
            ]);
            if ($request->password) {
                User::where('id', $request->id)->update([
                    'password' => Hash::make($request->password),
                ]);
            }

            return response()->json('User has been updated.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('UsersController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    public function delete(Request $request)
    {
        try {
            Gate::authorize('admin_delete', auth()->user());
            User::where('id', $request->id)->update([
                'active' => 0
            ]);

            return response()->json('New user has been added.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('UsersController', 'store', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

    public function getAll(Request $request)
    {
        try {
            Gate::authorize('admin_read', auth()->user());
            $query = User::query();

            // Filter issues based on the 'search' query parameter
            if (!empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', "%$searchTerm%")
                        ->orWhere('username', 'like', "%$searchTerm%");
                });
            }

            $products = $query->paginate($request->rows);

            return response()->json($products, 200);
        } catch (\Throwable $th) {
            SystemLogging::error('UsersController', 'getAll', $th);
            return response()->json($th->getMessage(), 500);
        }
    }

}
