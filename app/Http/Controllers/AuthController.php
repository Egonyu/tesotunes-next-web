<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function loginView()
    {
        return view('login');
    }

    public function login(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'exists:users'],
            'password' => ['required'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        if (\Auth::attempt(array('email' => $validated['email'], 'password' => $validated['password']))) {
            return redirect()->route('frontend.dashboard');
        } else {
            $validator->errors()->add(
                'password', 'The password does not match with username'
            );
            return redirect()->back()->withErrors($validator)->withInput();
        }
    }

    public function registerView(){
        // Use test view if 'test' query parameter is present
        if (request()->has('test')) {
            return view('register-test');
        }
        // Use debug view if 'debug' query parameter is present
        if (request()->has('debug')) {
            return view('register-debug');
        }
        return view('register');
    }

    public function register(Request $request){
        try {
            // DEBUG: Log what we received
            \Log::info('Registration attempt', [
                'all_data' => $request->all(),
                'has_token' => $request->has('_token'),
                'token_value' => $request->input('_token') ? 'present' : 'missing',
                'method' => $request->method(),
                'ajax' => $request->ajax(),
                'wants_json' => $request->wantsJson(),
            ]);

            $validator = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'unique:users', 'max:255'],
                'password' => ['required', 'confirmed', Password::min(7)],
            ]);

            if ($validator->fails()) {
                \Log::warning('Registration validation failed', [
                    'errors' => $validator->errors()->toArray(),
                    'input' => $request->except('password', 'password_confirmation')
                ]);
                
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'errors' => $validator->errors()
                    ], 422);
                }
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput($request->except('password', 'password_confirmation'));
            }

            $validated = $validator->validated();

            $user = User::create([
                'name' => $validated["name"],
                'email' => $validated["email"],
                'password' => Hash::make($validated["password"]),
                'role' => 'user',
                'status' => 'active',
            ]);

            \Log::info('User registered successfully', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            auth()->login($user);

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'user' => $user,
                    'redirect' => route('frontend.dashboard')
                ]);
            }

            return redirect()->route('frontend.dashboard');
            
        } catch (\Exception $e) {
            \Log::error('Registration failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'input' => $request->except('password', 'password_confirmation')
            ]);
            
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration failed: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()
                ->withErrors(['error' => 'Registration failed: ' . $e->getMessage()])
                ->withInput($request->except('password', 'password_confirmation'));
        }
    }

    public function logout()
    {
        auth()->logout();
        return redirect()->route('frontend.login');
    }
}
