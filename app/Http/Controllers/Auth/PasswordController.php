<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\SendNewPass;
use App\Models\User;
use App\Utils\GetErrorValidator;
use App\Utils\SystemLogging;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class PasswordController extends Controller
{
    public function updatePassword(Request $request)
    {
        // $auth_user = getUserFromCookie($request);
        $auth_user = auth()->user();
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required',
                'new_password' => 'required|min:6',
                'confirm_password' => 'required',
            ]);

            if ($validator->fails()) {
                $message = GetErrorValidator::getError($validator->errors());
                return response()->json($message, 400);
            }

            if (!Hash::check($request->current_password, $auth_user->password)) {
                return response()->json("Your current password is wrong.", 400);
            }
            if ($request->new_password !== $request->confirm_password) {
                return response()->json("Wrong confirmation password.", 400);
            }
            if ($request->current_password === $request->new_password) {
                return response()->json("Your new password can't be the same as your current password.", 400);
            }

            User::where('id', $auth_user->id)->update(
                [
                    'password' => Hash::make($request->new_password)
                ]
            );

            // $mailData = [
            //     'name' => $auth_user->fname,
            // ];

            // Mail::to($auth_user->email)->queue(new SendNewPass($mailData));

            return response()->json("Your password has been reset. Please logout and login with your new password.", 200);
        } catch (\Throwable $th) {
            //throw $th;
            $message = 'Error Encountered. Please contact IT Admin. Ref: updatePassword.';
            SystemLogging::error('UserController', 'updatePassword', $th);
            return response()->json($message, 500);
        }
    }
}
