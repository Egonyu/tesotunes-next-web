@extends('layouts.auth')

@section('title', 'Artist Login')

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
                Welcome back to TesoTunes
            </h2>
            <p class="text-gray-400">
                Sign in to your artist account
            </p>
        </div>

        <!-- Login Form -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-xl">
            <!-- Social Login Buttons -->
            @if(config('services.google.client_id') || config('services.facebook.client_id'))
            <div class="space-y-3 mb-6">
                @if(config('services.google.client_id'))
                <a href="{{ route('auth.social.redirect', 'google') }}" 
                   class="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-sm">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </a>
                @endif
                
                @if(config('services.facebook.client_id'))
                <a href="{{ route('auth.social.redirect', 'facebook') }}"
                   class="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-sm">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                </a>
                @endif
            </div>

            <div class="relative mb-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-700"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
                </div>
            </div>
            @endif

            <form method="POST" action="{{ route('artist.login') }}" x-data="loginForm()">
                @csrf

                <!-- Email Field -->
                <div class="mb-6">
                    <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value="{{ old('email') }}"
                        class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none @error('email') border-red-500 @enderror"
                        placeholder="Enter your email"
                    >
                    @error('email')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

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
                            placeholder="Enter your password"
                        >
                        <button
                            type="button"
                            @click="showPassword = !showPassword"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <span class="material-icons-round text-sm" x-text="showPassword ? 'visibility_off' : 'visibility'"></span>
                        </button>
                    </div>
                    @error('password')
                        <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between mb-6">
                    <label class="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="remember"
                            class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500"
                        >
                        <span class="text-gray-300 text-sm">Remember me</span>
                    </label>
                    <a href="{{ route('password.request') }}" class="text-green-500 hover:text-green-400 text-sm font-medium">
                        Forgot password?
                    </a>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                    <span x-show="!loading">Sign In</span>
                    <span x-show="loading" class="flex items-center justify-center gap-2">
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                    </span>
                </button>
            </form>
        </div>

        <!-- Sign Up Link -->
        <div class="text-center">
            <p class="text-gray-400">
                Don't have an account?
                <a href="{{ route('artist.register.index') }}" class="text-green-500 hover:text-green-400 font-medium">
                    Register as an Artist
                </a>
            </p>
        </div>

        <!-- Back to Login Choice -->
        <div class="text-center">
            <p class="text-gray-500 text-sm">
                Not an artist?
                <a href="{{ route('login') }}" class="text-green-500 hover:text-green-400">Choose login type</a>
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
function loginForm() {
    return {
        showPassword: false,
        loading: false,

        init() {
            if (!document.getElementById('email').value) {
                document.getElementById('email').focus();
            }
        }
    }
}
</script>
@endpush
@endsection
