<?php

namespace App\Http\Controllers\Frontend\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Setting;
use App\Services\SmsService;
use App\Services\CreditService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    protected SmsService $smsService;
    protected CreditService $creditService;

    public function __construct(SmsService $smsService, CreditService $creditService)
    {
        $this->smsService = $smsService;
        $this->creditService = $creditService;
    }

    public function loginChoiceView()
    {
        if (Auth::check()) {
            return redirect()->route('frontend.dashboard');
        }
        return view('frontend.auth.login-choice');
    }

    public function userLoginView()
    {
        if (Auth::check()) {
            return redirect()->route('frontend.dashboard');
        }
        return view('frontend.auth.user-login');
    }

    public function artistLoginView()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->is_artist) {
                return redirect()->route('frontend.artist.dashboard');
            }
            return redirect()->route('frontend.dashboard');
        }
        return view('frontend.auth.login');
    }

    public function loginView()
    {
        if (Auth::check()) {
            return redirect()->route('frontend.dashboard');
        }
        return view('frontend.auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // Update login tracking
            $user->updateLastLogin('web');

            $request->session()->regenerate();

            // Redirect based on user role and status
            return $this->redirectAfterLogin($user);
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function registerView(Request $request)
    {
        $referralCode = $request->query('ref');
        $referrer = null;
        
        if ($referralCode) {
            $referrer = User::where('referral_code', $referralCode)->first();
        }
        
        return view('frontend.auth.register', [
            'referralCode' => $referralCode,
            'referrer' => $referrer,
        ]);
    }

    public function artistRegisterView()
    {
        return view('frontend.auth.artist-register');
    }

    public function register(Request $request)
    {
        // Get authentication settings
        $emailEnabled = Setting::get('auth_email_login_enabled', true);
        $phoneEnabled = Setting::get('auth_phone_login_enabled', true);
        
        // Build validation rules dynamically
        $rules = [
            'name' => 'required|string|max:255',
            'password' => ['required', 'confirmed', Password::defaults()],
            'terms' => 'required|accepted',
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ];
        
        // Email is required only if email login is enabled OR if phone login is disabled
        if ($emailEnabled || !$phoneEnabled) {
            $rules['email'] = 'required|string|email|max:255|unique:users';
        } else {
            $rules['email'] = 'nullable|string|email|max:255|unique:users';
        }
        
        // Phone is required only if phone login is enabled OR if email login is disabled
        // Note: form field is 'phone_number' but DB column is 'phone'
        if ($phoneEnabled || !$emailEnabled) {
            $rules['phone_number'] = 'required|string|max:20|unique:users,phone';
        } else {
            $rules['phone_number'] = 'nullable|string|max:20|unique:users,phone';
        }
        
        $validated = $request->validate($rules);

        try {
            DB::beginTransaction();

            // Generate username from name
            $baseUsername = \Illuminate\Support\Str::slug($validated['name'], '_');
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . '_' . $counter;
                $counter++;
            }

            // Prepare user data (note: 'name' maps to 'display_name' via User model mutator)
            $userData = [
                'name' => $validated['name'],
                'username' => $username,
                'password' => Hash::make($validated['password']),
                'status' => 'active',
                'last_login_ip' => $request->ip(), // Use correct column name
            ];
            
            // Handle referral
            $referrer = null;
            if (!empty($validated['referral_code'])) {
                $referrer = User::where('referral_code', $validated['referral_code'])->first();
                if ($referrer) {
                    $userData['referrer_id'] = $referrer->id;
                    $userData['referred_at'] = now();
                }
            }
            
            // Add email if provided
            if (!empty($validated['email'])) {
                $userData['email'] = $validated['email'];
                
                // Check if email verification is required
                $requireEmailVerification = Setting::get('auth_require_email_verification', true);
                if (!$requireEmailVerification) {
                    $userData['email_verified_at'] = now();
                }
            }
            
            // Add phone if provided
            if (!empty($validated['phone_number'])) {
                $userData['phone'] = $validated['phone_number']; // Use correct field name
                
                // Phone will be verified later if phone verification is enabled
            }

            $user = User::create($userData);
            
            // Fire the Registered event for audit logging
            event(new Registered($user));
            
            // Generate referral code for new user
            $user->generateReferralCode();
            
            // Award referral credits if user was referred
            if ($referrer) {
                $referrer->increment('referral_count');
                $this->creditService->awardReferralCredits($referrer, $user);
            }

            DB::commit();

            // Log the user in
            Auth::login($user);

            // Check if request expects JSON response (AJAX)
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Registration successful! Welcome to Tesotunes.',
                    'redirect' => route('frontend.dashboard'),
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'status' => $user->status,
                    ]
                ]);
            }

            // Regular form submission - redirect with success message
            return redirect()->route('frontend.dashboard')
                ->with('success', 'Registration successful! Welcome to Tesotunes.');

        } catch (\Exception $e) {
            DB::rollBack();

            // Check if request expects JSON response (AJAX)
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration failed. Please try again.',
                    'errors' => ['general' => ['An error occurred during registration.']]
                ], 422);
            }

            // Regular form submission - redirect back with error
            return back()->withInput()
                ->withErrors(['general' => 'Registration failed. Please try again.']);
        }
    }

    public function artistRegister(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'stage_name' => 'required|string|max:255|unique:artists,stage_name',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'required|string|max:20|unique:users,phone',
            'nin_number' => 'required|string|size:14|unique:users,nin_number',
            'password' => ['required', 'confirmed', Password::defaults()],
            'terms' => 'required|accepted',
        ]);

        try {
            DB::beginTransaction();

            // Generate username from stage name
            $baseUsername = \Illuminate\Support\Str::slug($validated['stage_name'], '_');
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . '_' . $counter;
                $counter++;
            }

            $user = User::create([
                'name' => $validated['stage_name'], // Use stage name as display name
                'display_name' => $validated['stage_name'],
                'username' => $username,
                'full_name' => $validated['full_name'],
                'stage_name' => $validated['stage_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone_number'],
                'nin_number' => $validated['nin_number'],
                'password' => Hash::make($validated['password']),
                'is_artist' => true,
                'status' => 'active',
                'application_status' => 'pending',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Generate and send phone verification code
            $verificationCode = $user->generatePhoneVerificationCode();
            $this->smsService->sendVerificationCode($user->phone, $verificationCode);

            DB::commit();

            // Log the user in
            Auth::login($user);

            // Check if request expects JSON response (AJAX)
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Registration successful! Please verify your phone number.',
                    'redirect' => route('frontend.auth.phone-verification'),
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->stage_name ?? $user->name,
                        'email' => $user->email,
                        'status' => $user->status,
                        'phone_verified' => $user->isPhoneVerified(),
                    ]
                ]);
            }

            // Regular form submission - redirect with success message
            return redirect()->route('frontend.auth.phone-verification')
                ->with('success', 'Registration successful! Please verify your phone number.');

        } catch (\Exception $e) {
            DB::rollBack();

            // Check if request expects JSON response (AJAX)
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration failed. Please try again.',
                    'errors' => ['general' => ['An error occurred during registration.']]
                ], 422);
            }

            // Regular form submission - redirect back with error
            return back()->withInput()
                ->withErrors(['general' => 'Registration failed. Please try again.']);
        }
    }

    public function phoneVerificationView()
    {
        $user = Auth::user();

        if (!$user || $user->isPhoneVerified()) {
            return redirect()->route('frontend.dashboard');
        }

        return view('frontend.auth.phone-verification', compact('user'));
    }

    public function verifyPhone(Request $request)
    {
        $request->validate([
            'verification_code' => 'required|string|size:6',
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated.'
            ], 401);
        }

        if ($user->isPhoneVerified()) {
            return response()->json([
                'success' => true,
                'message' => 'Phone number already verified.',
                'redirect' => route('frontend.dashboard')
            ]);
        }

        if ($user->verifyPhone($request->verification_code)) {
            return response()->json([
                'success' => true,
                'message' => 'Phone number verified successfully!',
                'redirect' => route('frontend.dashboard')
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired verification code.',
            'errors' => ['verification_code' => ['The verification code is invalid or has expired.']]
        ], 422);
    }

    public function resendVerificationCode(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated.'
            ], 401);
        }

        if ($user->isPhoneVerified()) {
            return response()->json([
                'success' => false,
                'message' => 'Phone number is already verified.'
            ], 400);
        }

        try {
            $verificationCode = $user->generatePhoneVerificationCode();
            $this->smsService->sendVerificationCode($user->phone, $verificationCode);

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent successfully.',
                'expires_at' => $user->phone_verification_expires_at->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code. Please try again.',
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    protected function redirectAfterLogin(User $user): \Illuminate\Http\RedirectResponse
    {
        // Check if user is admin/super_admin/moderator/finance - redirect to admin panel
        if ($user->canAccessAdminPanel()) {
            return redirect()->route('admin.dashboard');
        }

        // Check if user needs phone verification (only if mobile verification is enabled and required)
        $mobileVerificationEnabled = \App\Models\Setting::get('mobile_verification_enabled', false);
        $mobileVerificationRequired = \App\Models\Setting::get('mobile_verification_required_for_artists', false);
        
        if ($mobileVerificationEnabled && $mobileVerificationRequired && !$user->isPhoneVerified()) {
            return redirect()->route('frontend.auth.phone-verification');
        }

        // Redirect artists to artist dashboard (they have an artist profile)
        if ($user->artist) {
            // Check various artist statuses
            if ($user->isPendingVerification()) {
                return redirect()->route('frontend.artist.dashboard')->with('info', 'Your artist account is pending verification. You can still access your dashboard.');
            }
            if ($user->isRejected()) {
                return redirect()->route('frontend.artist.dashboard')->with('error', 'Your artist application was rejected: ' . $user->rejection_reason);
            }
            if ($user->isSuspended()) {
                return redirect()->route('frontend.artist.dashboard')->with('error', 'Your account has been suspended: ' . $user->rejection_reason);
            }
            return redirect()->route('frontend.artist.dashboard');
        }

        // Regular users go to the user dashboard
        return redirect()->route('frontend.dashboard');
    }

    // ===========================================
    // EMAIL VERIFICATION METHODS
    // ===========================================

    /**
     * Show the email verification notice page
     */
    public function verifyEmailNotice(Request $request)
    {
        return $request->user()->hasVerifiedEmail()
            ? redirect()->intended(route('frontend.dashboard'))
            : view('frontend.auth.verify-email');
    }

    /**
     * Handle email verification link click
     */
    public function verifyEmail(\Illuminate\Foundation\Auth\EmailVerificationRequest $request)
    {
        $request->fulfill();

        return redirect()->intended(route('frontend.dashboard'))->with('success', 'Email verified successfully!');
    }

    /**
     * Resend verification email
     */
    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('frontend.dashboard'));
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('success', 'Verification link sent! Check your email.');
    }
}