@extends('layouts.auth')

@section('title', 'Forgot Password')

@section('content')
<div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-2">LineOne Music</h1>
            <p class="text-gray-400">Reset your password</p>
        </div>

        <!-- Card -->
        <div class="bg-gray-800 rounded-xl p-8 shadow-xl">
            <div class="mb-6">
                <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="material-icons-round text-3xl text-white">lock_reset</span>
                </div>
                <h2 class="text-2xl font-bold text-white text-center mb-2">Forgot Password?</h2>
                <p class="text-gray-400 text-center text-sm">No worries! Enter your email and we'll send you reset instructions.</p>
            </div>

            @if (session('status'))
                <div class="mb-6 p-4 bg-green-600 bg-opacity-20 border border-green-600 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span class="material-icons-round text-green-500">check_circle</span>
                        <p class="text-green-400 text-sm">{{ session('status') }}</p>
                    </div>
                </div>
            @endif

            <form method="POST" action="{{ route('password.email') }}" class="space-y-6">
                @csrf

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 material-icons-round text-gray-400 text-xl">email</span>
                        <input 
                            id="email" 
                            type="email" 
                            name="email" 
                            value="{{ old('email') }}" 
                            required 
                            autofocus
                            class="w-full bg-gray-700 border @error('email') border-red-500 @else border-gray-600 @enderror rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-600"
                            placeholder="your@email.com">
                    </div>
                    @error('email')
                        <p class="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <span class="material-icons-round text-sm">error</span>
                            {{ $message }}
                        </p>
                    @enderror
                </div>

                <button 
                    type="submit" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <span class="material-icons-round text-sm">send</span>
                    Send Reset Link
                </button>
            </form>

            <div class="mt-6 text-center">
                <a href="{{ route('login') }}" class="text-green-400 hover:text-green-300 text-sm flex items-center justify-center gap-1">
                    <span class="material-icons-round text-sm">arrow_back</span>
                    Back to Login
                </a>
            </div>
        </div>

        <!-- Help Text -->
        <div class="mt-6 text-center">
            <p class="text-gray-500 text-sm">
                Remember your password? 
                <a href="{{ route('login') }}" class="text-green-400 hover:text-green-300">Sign in</a>
            </p>
        </div>
    </div>
</div>
@endsection
