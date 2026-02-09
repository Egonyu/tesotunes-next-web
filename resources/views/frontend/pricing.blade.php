@extends('frontend.layouts.music')

@section('title', 'Pricing')

@section('content')
<div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
        <h1 class="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            Choose Your Plan
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
            Find the perfect plan for your music needs.
        </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <!-- Free Plan -->
        <div class="bg-gray-900/50 rounded-2xl p-8 border border-gray-700">
            <div class="text-center mb-8">
                <h3 class="text-2xl font-bold mb-2">Free</h3>
                <div class="text-4xl font-bold mb-4">$0<span class="text-lg text-gray-400">/month</span></div>
                <p class="text-gray-400">Perfect for discovering new music</p>
            </div>
            <ul class="space-y-4 mb-8">
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Limited skips</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Ads between songs</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Standard audio quality</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Basic playlists</span>
                </li>
            </ul>
            <button class="w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Get Started
            </button>
        </div>

        <!-- Premium Plan -->
        <div class="bg-gradient-to-b from-purple-900/50 to-purple-800/50 rounded-2xl p-8 border border-purple-500 relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span class="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <div class="text-center mb-8">
                <h3 class="text-2xl font-bold mb-2">Premium</h3>
                <div class="text-4xl font-bold mb-4">$9.99<span class="text-lg text-gray-400">/month</span></div>
                <p class="text-gray-400">Unlimited music, no ads</p>
            </div>
            <ul class="space-y-4 mb-8">
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Unlimited skips</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>No ads</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>High quality audio</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Offline downloads</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Unlimited playlists</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Awards voting rights</span>
                </li>
            </ul>
            <button class="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Start Free Trial
            </button>
        </div>

        <!-- Hi-Fi Plan -->
        <div class="bg-gray-900/50 rounded-2xl p-8 border border-gray-700">
            <div class="text-center mb-8">
                <h3 class="text-2xl font-bold mb-2">Hi-Fi</h3>
                <div class="text-4xl font-bold mb-4">$19.99<span class="text-lg text-gray-400">/month</span></div>
                <p class="text-gray-400">Audiophile quality experience</p>
            </div>
            <ul class="space-y-4 mb-8">
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Everything in Premium</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Lossless audio quality</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>24-bit/192kHz support</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Exclusive content</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>Priority customer support</span>
                </li>
                <li class="flex items-center gap-3">
                    <span class="material-icons-round text-green-500 text-sm">check</span>
                    <span>VIP event access</span>
                </li>
            </ul>
            <button class="w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Start Free Trial
            </button>
        </div>
    </div>

    <div class="mt-16 text-center">
        <p class="text-gray-400 mb-4">All plans include a 30-day free trial. Cancel anytime.</p>
        <p class="text-gray-400">Questions? <a href="{{ route('frontend.contact') }}" class="text-purple-400 hover:text-purple-300">Contact us</a></p>
    </div>
</div>
@endsection