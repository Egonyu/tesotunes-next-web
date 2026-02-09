@extends('layouts.auth')

@section('title', 'Sign In to Tesotunes')

@section('content')
<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="material-icons-round text-black text-2xl">music_note</span>
                </div>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">
                Welcome to Tesotunes
            </h2>
            <p class="text-gray-400">
                Choose how you'd like to sign in
            </p>
        </div>

        <!-- Login Options -->
        <div class="space-y-4">
            <!-- Regular User Login (Primary) -->
            <div class="relative">
                <!-- Popular Badge - Outside the clickable area -->
                <div class="absolute -top-3 left-6 z-10">
                    <span class="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Most Popular
                    </span>
                </div>
                <a href="{{ route('user.login') }}" class="block">
                    <div class="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 border-2 border-blue-500 hover:border-blue-400 transition-colors cursor-pointer">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span class="material-icons-round text-white">person</span>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-white font-semibold text-lg">Music Lover</h3>
                                <p class="text-gray-400 text-sm">Listen, discover, and enjoy music</p>
                            </div>
                            <div>
                                <span class="material-icons-round text-gray-400">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>

            <!-- Artist Login (Secondary) -->
            <a href="{{ route('artist.login') }}" class="block">
                <div class="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <span class="material-icons-round text-black">mic</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-white font-semibold text-lg">Artist/Creator</h3>
                            <p class="text-gray-400 text-sm">Upload and manage your music</p>
                        </div>
                        <div>
                            <span class="material-icons-round text-gray-400">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </a>
        </div>

        <!-- Sign Up Link -->
        <div class="text-center">
            <p class="text-gray-400">
                Don't have an account?
                <a href="{{ route('register') }}" class="text-green-500 hover:text-green-400 font-medium">
                    Sign up for Tesotunes
                </a>
            </p>
        </div>

        <!-- Help Section -->
        <div class="text-center">
            <p class="text-gray-500 text-sm">
                Need help?
                <a href="#" class="text-green-500 hover:text-green-400">Contact Support</a>
            </p>
        </div>
    </div>
</div>

<script>
// Remember user's last choice for faster future logins
document.addEventListener('DOMContentLoaded', function() {
    const lastLoginType = localStorage.getItem('last_login_type');
    
    // If user has a preference and page loaded via direct navigation (not back button)
    if (lastLoginType && !window.performance.navigation.type) {
        // Could auto-redirect after 2 seconds or show "Continue as [type]" option
        console.log('Last login type:', lastLoginType);
    }
    
    // Track clicks
    document.querySelectorAll('a[href*="login"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const isArtist = this.href.includes('artist');
            localStorage.setItem('last_login_type', isArtist ? 'artist' : 'user');
        });
    });
});
</script>
@endsection