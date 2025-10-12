<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function logout()
    {
        try {
            auth('web')->logout();
            session()->invalidate();
            return response()->json(['message' => 'User logged out'], 200);
        } catch (\Throwable $th) {
            //throw $th;
            SystemLogging::error('LogoutController', 'logout', $th);
            return response()->json('Server error. Please contact IT Dept.', 500);
        }
    }
}
