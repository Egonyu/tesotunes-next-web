<?php

namespace App\Http\Controllers\Frontend\Auth;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\User;
use App\Services\Auth\ArtistRegistrationService;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rules\File;

/**
 * Artist Registration Controller
 * 
 * Handles multi-step artist registration process
 * Step 1: Basic Info (stage name, genre, bio)
 * Step 2: Identity Verification (NIN, ID uploads, phone)
 * Step 3: Payment Setup (mobile money, email, password)
 */
class ArtistRegistrationController extends Controller
{
    protected ArtistRegistrationService $service;
    protected SmsService $smsService;

    public function __construct(
        ArtistRegistrationService $service,
        SmsService $smsService
    ) {
        $this->service = $service;
        $this->smsService = $smsService;
        
        // Only guests can register
        $this->middleware('guest')->except(['verifyPhone', 'resendCode']);
    }

    /**
     * Show artist registration landing page
     * THIS IS STEP 1 - Direct minimal flow
     */
    public function index()
    {
        // Redirect /artist/register to step 1
        return redirect()->route('artist.register.step1');
    }

    /**
     * Start registration - redirect to step 1
     */
    public function start()
    {
        // Initialize session and redirect to step 1
        return redirect()->route('artist.register.step1');
    }

    /**
     * Step 1: Basic Information
     */
    public function showStep1()
    {
        // Initialize session on first access
        $sessionData = $this->service->getSessionData();
        if (empty($sessionData['started_at'])) {
            $this->service->initializeSession();
            $sessionData = $this->service->getSessionData();
        }
        
        $genres = Genre::orderBy('name')->get();
        
        return view('frontend.auth.artist.step1-basic', [
            'genres' => $genres,
            'data' => $sessionData['data']['step1'] ?? [],
            'progress' => $this->service->getProgress(),
        ]);
    }

    public function submitStep1(Request $request)
    {
        $validated = $request->validate([
            'stage_name' => 'required|string|max:255|unique:users,stage_name',
            'genre_id' => 'required|exists:genres,id',
            'bio' => 'nullable|string|max:500',
            'avatar' => ['nullable', File::image()->max(5 * 1024)], // 5MB
        ], [
            'stage_name.unique' => 'This stage name is already taken. Please choose another.',
            'genre_id.required' => 'Please select your primary music genre.',
            'genre_id.exists' => 'The selected genre is invalid.',
            'avatar.max' => 'Profile photo must not exceed 5MB.',
        ]);

        // Handle avatar upload separately (do NOT store file object in session)
        $dataToStore = [
            'stage_name' => $validated['stage_name'],
            'genre_id' => (int)$validated['genre_id'], // Cast to int
            'bio' => $validated['bio'] ?? null,
        ];

        // Upload avatar if provided (store metadata, not file object)
        if ($request->hasFile('avatar')) {
            $avatarMetadata = $this->service->uploadFile($request->file('avatar'), 'avatars');
            $dataToStore['avatar_path'] = $avatarMetadata['path'];
        }

        // Store step 1 data in session (NO FILES - just paths and primitives)
        $this->service->saveStepData(1, $dataToStore);

        return redirect()->route('artist.register.step2')
            ->with('success', 'Step 1 completed! Now let\'s verify your identity.');
    }

    /**
     * Step 2: Identity Verification
     */
    public function showStep2()
    {
        // Ensure step 1 is completed
        if (!$this->service->isStepCompleted(1)) {
            return redirect()->route('artist.register.step1')
                ->with('error', 'Please complete Step 1 first.');
        }

        $sessionData = $this->service->getSessionData();
        
        return view('frontend.auth.artist.step2-identity', [
            'data' => $sessionData['data']['step2'] ?? [],
            'progress' => $this->service->getProgress(),
        ]);
    }

    public function submitStep2(Request $request)
    {
        // First validate format without uniqueness checks for files
        $request->validate([
            'full_name' => 'required|string|max:255',
            'nin_number' => [
                'required',
                'string',
                'size:14',
                'regex:/^[A-Z0-9]{14}$/',
            ],
            'phone_number' => [
                'required',
                'string',
                'regex:/^256[0-9]{9}$/',
            ],
            'national_id_front' => ['required', File::image()->max(5 * 1024)],
            'national_id_back' => ['required', File::image()->max(5 * 1024)],
            'selfie_with_id' => ['required', File::image()->max(5 * 1024)],
        ], [
            'full_name.required' => 'Please enter your full legal name as it appears on your National ID.',
            'nin_number.required' => 'National ID Number (NIN) is required.',
            'nin_number.size' => 'NIN must be exactly 14 characters.',
            'nin_number.regex' => 'NIN must contain only uppercase letters and numbers.',
            'phone_number.regex' => 'Phone number must be in format: 256XXXXXXXXX (e.g., 256700123456)',
            'national_id_front.required' => 'Please upload the front of your National ID.',
            'national_id_back.required' => 'Please upload the back of your National ID.',
            'selfie_with_id.required' => 'Please upload a selfie holding your National ID.',
        ]);

        // Then check uniqueness separately
        $ninExists = \App\Models\User::where('nin_number', $request->nin_number)->exists();
        if ($ninExists) {
            return back()->withInput()->withErrors(['nin_number' => 'This National ID Number is already registered.']);
        }

        $phoneExists = \App\Models\User::where('phone', $request->phone_number)->exists();
        if ($phoneExists) {
            return back()->withInput()->withErrors(['phone_number' => 'This phone number is already registered.']);
        }

        // Store step 2 data in session (without files)
        $dataToStore = [
            'full_name' => $request->full_name,
            'nin_number' => $request->nin_number,
            'phone_number' => $request->phone_number,
        ];
        $this->service->saveStepData(2, $dataToStore);

        // Upload KYC documents (store full metadata)
        if ($request->hasFile('national_id_front')) {
            $metadata = $this->service->uploadFile($request->file('national_id_front'), 'kyc/national_id');
            $this->service->updateStepData(2, 'national_id_front_metadata', $metadata);
        }

        if ($request->hasFile('national_id_back')) {
            $metadata = $this->service->uploadFile($request->file('national_id_back'), 'kyc/national_id');
            $this->service->updateStepData(2, 'national_id_back_metadata', $metadata);
        }

        if ($request->hasFile('selfie_with_id')) {
            $metadata = $this->service->uploadFile($request->file('selfie_with_id'), 'kyc/selfies');
            $this->service->updateStepData(2, 'selfie_with_id_metadata', $metadata);
        }

        return redirect()->route('artist.register.step3')
            ->with('success', 'Identity verified! One last step - payment setup.');
    }

    /**
     * Step 3: Payment Setup & Account Creation
     */
    public function showStep3()
    {
        // Ensure previous steps are completed
        if (!$this->service->isStepCompleted(1) || !$this->service->isStepCompleted(2)) {
            return redirect()->route('artist.register.step1')
                ->with('error', 'Please complete all previous steps first.');
        }

        $sessionData = $this->service->getSessionData();
        
        return view('frontend.auth.artist.step3-payment', [
            'data' => $sessionData['data']['step3'] ?? [],
            'step1Data' => $sessionData['data']['step1'] ?? [],
            'step2Data' => $sessionData['data']['step2'] ?? [],
            'progress' => $this->service->getProgress(),
        ]);
    }

    public function submitStep3(Request $request)
    {
        $validated = $request->validate([
            'mobile_money_provider' => 'required|in:mtn,airtel',
            'mobile_money_number' => [
                'required',
                'string',
                'regex:/^256[0-9]{9}$/'
            ],
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'terms' => 'required|accepted',
        ], [
            'mobile_money_provider.required' => 'Please select your mobile money provider.',
            'mobile_money_number.regex' => 'Mobile money number must be in format: 256XXXXXXXXX',
            'email.unique' => 'This email is already registered.',
            'terms.accepted' => 'You must accept the Terms of Service to continue.',
        ]);

        try {
            // Create the artist user account
            $user = $this->service->createArtistAccount($validated);

            // Generate and send phone verification code
            $verificationCode = $user->generatePhoneVerificationCode();
            $this->smsService->sendVerificationCode($user->phone, $verificationCode);

            // Log the user in
            Auth::login($user);

            // Clear registration session
            $this->service->clearSession();

            // Redirect to phone verification
            return redirect()->route('artist.register.verify-phone')
                ->with('success', 'Account created! Please verify your phone number to complete registration.');

        } catch (\Exception $e) {
            logger()->error('Artist registration failed at step 3', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Registration failed. Please try again or contact support if the issue persists.');
        }
    }

    /**
     * Phone Verification Page
     */
    public function showPhoneVerification()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('artist.register')
                ->with('error', 'Please start registration again.');
        }

        if ($user->isPhoneVerified()) {
            return redirect()->route('artist.register.complete');
        }

        return view('frontend.auth.artist.verify-phone', [
            'user' => $user,
            'phoneNumber' => $user->phone,
        ]);
    }

    /**
     * Verify Phone Number
     */
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
                'redirect' => route('artist.register.complete')
            ]);
        }

        if ($user->verifyPhone($request->verification_code)) {
            // Update user status to verified
            $user->update(['status' => 'verified']);

            return response()->json([
                'success' => true,
                'message' => 'Phone number verified successfully!',
                'redirect' => route('artist.register.complete')
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid or expired verification code.',
            'errors' => ['verification_code' => ['The verification code is invalid or has expired.']]
        ], 422);
    }

    /**
     * Resend Verification Code
     */
    public function resendCode(Request $request)
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

    /**
     * Registration Complete - Show success page
     */
    public function complete()
    {
        $user = Auth::user();

        if (!$user || !$user->isPhoneVerified()) {
            return redirect()->route('artist.register.verify-phone')
                ->with('error', 'Please verify your phone number first.');
        }

        // Redirect to artist dashboard instead of complete page
        return redirect()->route('frontend.artist.dashboard')
            ->with('success', 'Welcome! Your artist account is now active. Your profile is pending verification by our team.');
    }

    /**
     * Go back to previous step
     */
    public function previousStep(Request $request)
    {
        $currentStep = $request->input('current_step', 2);
        $previousStep = max(1, $currentStep - 1);

        return redirect()->route('artist.register.step' . $previousStep);
    }
}
