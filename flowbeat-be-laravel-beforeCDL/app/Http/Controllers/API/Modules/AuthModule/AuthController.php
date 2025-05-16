<?php

namespace App\Http\Controllers\API\Modules\AuthModule;

use App\Http\Controllers\Controller;
use App\Models\PatientModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function SignUpPatient( Request $request )
    {
        $valid = Validator::make($request->all(), [
            'first_name' => 'required',
            'last_name' => 'required',
            'phone_number' => 'required|min:10|max:12|unique:patients,phone_number',
            'password' => 'required|min:7'
        ], [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'phone_number.required' => 'Phone number is required',
            'phone_number.unique' => 'This number already registered',
            'phone_number.min' => 'Mobile number must be at least 10 characters',
            'phone_number.max' => 'Mobile number must be maximum 12 characters',
            'password.required' => 'Password is required'
        ]);
        if ($valid->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'There seems to be an error in inputting patient data',
                $valid->errors()
            ], 422);
        }

        $checkPhoneNumber = PatientModel::where('phone_number', $request->phone_number)->first();
        if ($checkPhoneNumber) {
            return response()->json([
                'success' => false,
                'message' => 'This mobile number is already registered',
            ], 409);
        }

        try {
            $newPatient = PatientModel::create([
                'uuid' => Str::uuid(),
                'first_name' => $request->input('first_name'),
                'last_name' => $request->input('last_name'),
                'phone_number' => $request->input('phone_number'),
                'password' => Hash::make($request->password)
            ]);
            $token = $newPatient->createToken('auth_token')->plainTextToken;
            if ($newPatient) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pasient has been successfully registered',
                    'patient' => $newPatient,
                    'access_token' => $token,
                    'token_type' => 'bearer'
                ], 201);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => 'You have no right to know. Let the backend handle it',
                'if you insist' => $e
            ], 500);
        }
    }

    public function SignInPatient( Request $request )
    {
        if (!Auth::attempt($request->only('phone_number', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Patient unauthorized'
            ], 401);
        }
        $patient = PatientModel::where('phone_number', $request->phone_number)->firstOrFail();
        $token = $patient->createToken('auth_token')->plainTextToken;
        if ($token) {
            return response()->json([
                'success' => true,
                'message' => 'You are logged in',
                'access_token' => $token,
                'token_type' => 'bearer'
            ], 200);
        }
    }

    public function UpdatePatientData( Request $request, $uuid )
    {
        $patient = PatientModel::where('uuid', $uuid)->first();
        if (!$patient)  return response()->json(['message' => 'Patient not found, your uuid is wrong'], 404);
        if (Auth::check()) {
            $patient->update($request->all());
            return response()->json([
                'message' => 'Your profile data has been updated',
                'data' => $patient,
            ]);
        }
        return response()->json(['message' => 'Unauthorized, login first'], 401);
    }

    public function SignOutPatient()
    {
        if (Auth::check()) {
            Auth::user()->tokens()->delete();
            return response()->json([
                'success' => true,
                'message' => 'Successfully Logout. Dont forget to come back',
            ], 200);
        }
    }
}
