@extends('layouts.auth')

@section('title', 'Reset Password')

@section('content')
<div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-2">LineOne Music</h1>
            <p class="text-gray-400">Create a new password</p>
        </div>

        <!-- Card -->
        <div class="bg-gray-800 rounded-xl p-8 shadow-xl">
            <div class="mb-6">
                <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="material-icons-round text-3xl text-white">key</span>
                </div>
                <h2 class="text-2xl font-bold text-white text-center mb-2">Reset Password</h2>
                <p class="text-gray-400 text-center text-sm">Enter your new password below</p>
            </div>

            <form method="POST" action="{{ route('password.update') }}" class="space-y-6">
                @csrf
                <input type="hidden" name="token" value="{{ $token }}">

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 material-icons-round text-gray-400 text-xl">email</span>
                        <input 
                            id="email" 
                            type="email" 
                            name="email" 
                            value="{{ $email ?? old('email') }}" 
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

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 material-icons-round text-gray-400 text-xl">lock</span>
                        <input 
                            id="password" 
                            type="password" 
                            name="password" 
                            required
                            class="w-full bg-gray-700 border @error('password') border-red-500 @else border-gray-600 @enderror rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-600"
                            placeholder="Enter new password">
                    </div>
                    @error('password')
                        <p class="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <span class="material-icons-round text-sm">error</span>
                            {{ $message }}
                        </p>
                    @enderror
                    <p class="mt-2 text-xs text-gray-500">Minimum 8 characters, include letters and numbers</p>
                </div>

                <div>
                    <label for="password_confirmation" class="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                    <div class="relative">
                        <span class="absolute left-3 top-3 material-icons-round text-gray-400 text-xl">lock</span>
                        <input 
                            id="password_confirmation" 
                            type="password" 
                            name="password_confirmation" 
                            required
                            class="w-full bg-gray-700 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-green-600"
                            placeholder="Confirm new password">
                    </div>
                </div>

                <button 
                    type="submit" 
                    class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <span class="material-icons-round text-sm">check_circle</span>
                    Reset Password
                </button>
            </form>

            <div class="mt-6 text-center">
                <a href="{{ route('login') }}" class="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1">
                    <span class="material-icons-round text-sm">arrow_back</span>
                    Back to Login
                </a>
            </div>
        </div>
    </div>
</div>
@endsection
