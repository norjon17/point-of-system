<?php

namespace App\Http\Controllers\Access;

use App\Http\Controllers\Controller;
use App\Models\Access\Access;
use App\Models\Access\AccessModule;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AccessModuleController extends Controller
{
    public function getByUserAccess(string $user_id)
    {
        try {
            $user = auth()->user();
            Gate::authorize('admin_access_update', $user);

            $modules = AccessModule::with([
                'user_access' => function ($q) use ($user_id) {
                    $q->where('user_id', $user_id);
                }
            ])->get();

            return response()->json($modules, 200);

        } catch (\Throwable $th) {
            SystemLogging::error('getByUserAccess', 'getByUserAccess', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
    // public function getAll()
    // {
    //     try {
    //         $user = auth()->user();
    //         Gate::authorize('admin_access_update', $user);

    //         $modules = AccessModule::all();

    //         return response()->json($modules, 200);

    //     } catch (\Throwable $th) {
    //         SystemLogging::error('CustomerController', 'index', $th);
    //         return response()->json($th->getMessage(), 500);
    //     }
    // }

    public function storeOrUpdate(Request $request)
    {
        try {
            Gate::authorize('admin_access_update', auth()->user());

            $accesses = $request->accesses;
            foreach ($accesses as $access) {
                $t_access = Access::find($access['id']);
                if ($t_access) {
                    //update
                    Access::find($access['id'])->update(
                        [
                            "create" => $access['create'],
                            "read" => $access['read'],
                            "update" => $access['update'],
                            "delete" => $access['delete'],
                        ]
                    );
                } else {
                    //create
                    Access::create([
                        "user_id" => $access['user_id'],
                        "module_id" => $access['module_id'],
                        "create" => $access['create'],
                        "read" => $access['read'],
                        "update" => $access['update'],
                        "delete" => $access['delete'],
                    ]);
                }
            }

            return response()->json('User access has been updated.', 200);
        } catch (\Throwable $th) {
            SystemLogging::error('AccessModuleController', 'storeOrUpdate', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
