@extends('layouts.auth')

@section('title', 'Join Tesotunes')

@section('content')
<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <span class="material-icons-round text-white text-2xl">music_note</span>
                </div>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">
                Join Tesotunes
            </h2>
            <p class="text-gray-400">
                Discover and enjoy amazing music
            </p>
        </div>

        <!-- Registration Form -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-xl">
            <!-- Social Registration Buttons (Conditional based on settings) -->
            @if(app(\App\Models\Setting::class)::get('auth_google_login_enabled', false) || app(\App\Models\Setting::class)::get('auth_facebook_login_enabled', false) || app(\App\Models\Setting::class)::get('auth_twitter_login_enabled', false))
            <div class="space-y-3 mb-6">
                @socialLoginEnabled('google')
                <a href="{{ route('auth.social.redirect', 'google') }}" 
                   class="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-sm">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                </a>
                @endsocialLoginEnabled

                @socialLoginEnabled('facebook')
                <a href="{{ route('auth.social.redirect', 'facebook') }}"
                   class="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-sm">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Sign up with Facebook
                </a>
                @endsocialLoginEnabled

                @socialLoginEnabled('twitter')
                <a href="{{ route('auth.social.redirect', 'twitter') }}"
                   class="w-full bg-[#1DA1F2] hover:bg-[#1A8CD8] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-sm">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Sign up with Twitter
                </a>
                @endsocialLoginEnabled
            </div>

            <div class="relative mb-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-700"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-gray-800 text-gray-400">Or sign up with email</span>
                </div>
            </div>
            @endif

            <form method="POST" action="{{ route('register') }}" x-data="registrationForm()" @submit="submitForm">
                @csrf

                <!-- Name Field -->
                <div class="mb-6">
                    <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value="{{ old('name') }}"
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none @error('name') border-red-500 @enderror"
                        placeholder="Enter your full name"
                    >
                    @error('name')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Email Field (conditional based on settings) -->
                @emailLoginEnabled
                <div class="mb-6">
                    <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                        @if(!app(\App\Models\Setting::class)::get('auth_phone_login_enabled', true))
                        <span class="text-green-500">*</span>
                        @endif
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        {{ !app(\App\Models\Setting::class)::get('auth_phone_login_enabled', true) ? 'required' : '' }}
                        value="{{ old('email') }}"
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none @error('email') border-red-500 @enderror"
                        placeholder="Enter your email address"
                    >
                    @error('email')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    @if(app(\App\Models\Setting::class)::get('auth_phone_login_enabled', true))
                    <p class="text-gray-500 text-xs mt-1">
                        Optional - You can add this later in your profile
                    </p>
                    @endif
                </div>
                @endemailLoginEnabled

                <!-- Phone Number Field (conditional based on settings) -->
                @phoneLoginEnabled
                <div class="mb-6">
                    <label for="phone_number" class="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                        @if(!app(\App\Models\Setting::class)::get('auth_email_login_enabled', true))
                        <span class="text-green-500">*</span>
                        @endif
                    </label>
                    <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        {{ !app(\App\Models\Setting::class)::get('auth_email_login_enabled', true) ? 'required' : '' }}
                        value="{{ old('phone_number') }}"
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none @error('phone_number') border-red-500 @enderror"
                        placeholder="Enter your phone number (e.g., 256700000000)"
                    >
                    @error('phone_number')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                    @if(app(\App\Models\Setting::class)::get('auth_email_login_enabled', true))
                    <p class="text-gray-500 text-xs mt-1">
                        Optional - You can add this later in your profile
                    </p>
                    @else
                    <p class="text-gray-500 text-xs mt-1">
                        Required for account verification and security
                    </p>
                    @endif
                </div>
                @endphoneLoginEnabled

                <!-- Password Field -->
                <div class="mb-6">
                    <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                        Password
                    </label>
                    <div class="relative">
                        <input
                            id="password"
                            name="password"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none @error('password') border-red-500 @enderror"
                            placeholder="Create a password"
                            x-model="password"
                            @input="checkPasswordStrength"
                        >
                        <button
                            type="button"
                            @click="showPassword = !showPassword"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <span class="material-icons-round text-sm" x-text="showPassword ? 'visibility_off' : 'visibility'"></span>
                        </button>
                    </div>
                    <!-- Password Strength Indicator -->
                    <div class="mt-2" x-show="password.length > 0">
                        <div class="flex gap-1 mb-1">
                            <div class="h-1 flex-1 rounded" :class="passwordStrength >= 1 ? strengthColors[passwordStrength] : 'bg-gray-600'"></div>
                            <div class="h-1 flex-1 rounded" :class="passwordStrength >= 2 ? strengthColors[passwordStrength] : 'bg-gray-600'"></div>
                            <div class="h-1 flex-1 rounded" :class="passwordStrength >= 3 ? strengthColors[passwordStrength] : 'bg-gray-600'"></div>
                            <div class="h-1 flex-1 rounded" :class="passwordStrength >= 4 ? strengthColors[passwordStrength] : 'bg-gray-600'"></div>
                        </div>
                        <p class="text-xs" :class="passwordStrength >= 3 ? 'text-green-400' : 'text-amber-400'" x-text="strengthText"></p>
                    </div>
                    @error('password')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Confirm Password Field -->
                <div class="mb-6">
                    <label for="password_confirmation" class="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                    </label>
                    <div class="relative">
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            required
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                            placeholder="Confirm your password"
                        >
                        <button
                            type="button"
                            @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <span class="material-icons-round text-sm" x-text="showConfirmPassword ? 'visibility_off' : 'visibility'"></span>
                        </button>
                    </div>
                </div>

                <!-- Referral Code (Hidden if from referral link) -->
                @if(isset($referralCode) && $referralCode)
                <input type="hidden" name="referral_code" value="{{ $referralCode }}">
                @if(isset($referrer) && $referrer)
                <div class="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div class="flex items-center gap-3">
                        @if($referrer->avatar)
                        <img src="{{ asset('storage/' . $referrer->avatar) }}" alt="{{ $referrer->name }}" class="w-10 h-10 rounded-full object-cover">
                        @else
                        <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span class="text-green-500 font-bold">{{ substr($referrer->name, 0, 1) }}</span>
                        </div>
                        @endif
                        <div>
                            <p class="text-white text-sm font-medium">Referred by {{ $referrer->name }}</p>
                            <p class="text-green-400 text-xs">You'll both earn bonus credits!</p>
                        </div>
                    </div>
                </div>
                @endif
                @else
                <div class="mb-6" x-data="{ showReferral: false }">
                    <button type="button" @click="showReferral = !showReferral" class="text-green-500 text-sm hover:text-green-400 flex items-center gap-1">
                        <span class="material-icons-round text-sm">card_giftcard</span>
                        <span x-text="showReferral ? 'Hide referral code' : 'Have a referral code?'"></span>
                    </button>
                    <div x-show="showReferral" x-collapse class="mt-3">
                        <input
                            name="referral_code"
                            type="text"
                            value="{{ old('referral_code') }}"
                            class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none @error('referral_code') border-red-500 @enderror"
                            placeholder="Enter referral code (e.g., ABC1-123)"
                        >
                        @error('referral_code')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                        <p class="text-gray-500 text-xs mt-1">Both you and your friend will earn bonus credits!</p>
                    </div>
                </div>
                @endif

                <!-- Terms Agreement -->
                <div class="mb-6">
                    <label class="flex items-start gap-3">
                        <input
                            type="checkbox"
                            name="terms"
                            required
                            class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500 mt-0.5"
                        >
                        <span class="text-gray-400 text-sm">
                            I agree to the 
                            <a href="{{ url('/terms') }}" class="text-green-500 hover:text-green-400">Terms of Service</a>
                            and
                            <a href="{{ url('/privacy') }}" class="text-green-500 hover:text-green-400">Privacy Policy</a>
                        </span>
                    </label>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                    <span x-show="!loading">Create Account</span>
                    <span x-show="loading" class="flex items-center justify-center gap-2">
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating account...
                    </span>
                </button>
            </form>
        </div>

        <!-- Sign In Link -->
        <div class="text-center">
            <p class="text-gray-400">
                Already have an account?
                <a href="{{ route('login') }}" class="text-green-500 hover:text-green-400 font-medium">
                    Sign in
                </a>
            </p>
        </div>

        <!-- Artist Registration Link -->
        <div class="text-center">
            <p class="text-gray-500 text-sm">
                Want to share your music?
                <a href="{{ route('artist.register.index') }}" class="text-green-500 hover:text-green-400">Register as an Artist</a>
            </p>
        </div>

        <!-- Help Section -->
        <div class="text-center">
            <p class="text-gray-500 text-sm">
                Need help?
                <a href="{{ url('/contact') }}" class="text-green-500 hover:text-green-400">Contact Support</a>
            </p>
        </div>
    </div>
</div>

@push('scripts')
<script>
function registrationForm() {
    return {
        showPassword: false,
        showConfirmPassword: false,
        loading: false,
        password: '',
        passwordStrength: 0,
        strengthText: '',
        strengthColors: {
            1: 'bg-red-500',
            2: 'bg-amber-500',
            3: 'bg-green-500',
            4: 'bg-green-600'
        },

        checkPasswordStrength() {
            let strength = 0;
            
            if (this.password.length >= 8) strength++;
            if (/[A-Z]/.test(this.password)) strength++;
            if (/[0-9]/.test(this.password)) strength++;
            if (/[^A-Za-z0-9]/.test(this.password)) strength++;
            
            this.passwordStrength = strength;
            
            const texts = ['', 'Weak', 'Fair', 'Good', 'Strong'];
            this.strengthText = texts[strength] || '';
        },

        submitForm(e) {
            this.loading = true;
        }
    }
}
</script>
@endpush
@endsection
