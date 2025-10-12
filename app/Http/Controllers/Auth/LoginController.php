<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        try {
            $credentials = $request->only('username', 'password');

            if (env('APP_DEBUG', false)) {
                $key = "login:" . $request->ip();
                $executed = RateLimiter::attempt(
                    $key,
                    $perMinute = 5,
                    function () {
                        // Send message...
                    },
                    $decayRate = 180,
                );

                $attempts_remaining = RateLimiter::remaining($key, $perMinute);
                if (!$executed || $attempts_remaining <= 0) {
                    $seconds = RateLimiter::availableIn($key);

                    return response()->json("Too many sign-in attempts. Please try again in $seconds seconds.", 429);
                }

            }

            if (auth()->attempt($credentials)) {
                $auth_user = auth()->user();
                if ($auth_user->active !== 1) {
                    auth('web')->logout();
                    session()->invalidate();
                    return response()->json('User is currently inactive.', 403);
                }
                Log::info('Sign in success from: ', [
                    'data' => $request->except('password'),
                    'IP Address' => $request->ip()
                ]);
                return response()->json(auth()->user(), 200);
            } else {
                // return response()->json(['message' => 'User not found: Please check your credentials and try again.'], 401);
                // $temp = (array) $request->all();
                Log::info('Sign in failed from: ', [
                    'data' => $request->except('password'),
                    'IP Address' => $request->ip()
                ]);
                return response()->json("Invalid user or password. Attempts Remaining ($attempts_remaining)", 401);
            }
        } catch (\Throwable $th) {
            SystemLogging::error('UserController', 'login', $th);
            return response()->json($th->getMessage(), 500);
        }
    }
}
