<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Kredential tidak sesuai'
            ], 401);
        }
        $user = User::where('email', $request->email)->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;
        if ($token) {
            return response()->json([
                'success' => true,
                'message' => 'Kamu berhasil login',
                'data' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 200);
        }
    }

    public function ShowAllUsers()
    {
        $users = User::paginate(20);
        return response()->json([
            'success' => true,
            'data' => $users
        ], 200);
    }

    public function GetPatientDetailsById($id)
    {
        $user = User::find($id);
        if ($user) {
            return response()->json([
                'success' => true,
                'data' => $user
            ], 200);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
    }
}
