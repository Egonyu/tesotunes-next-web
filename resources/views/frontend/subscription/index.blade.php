@extends('frontend.layouts.music')

@section('title', 'Subscription Plans')

@section('content')
<div class="container mx-auto px-6 py-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
            <p class="text-xl text-gray-400">Unlock premium features and enjoy unlimited music</p>
        </div>

        <!-- Current Subscription Status -->
        @auth
        @if(auth()->user()->subscription)
        <div class="bg-green-900/20 border border-green-500/50 rounded-lg p-6 mb-8">
            <div class="flex items-center gap-4">
                <span class="material-icons-round text-green-500 text-2xl">check_circle</span>
                <div>
                    <h3 class="text-lg font-semibold text-white">Active Subscription</h3>
                    <p class="text-gray-300">
                        You're currently subscribed to {{ auth()->user()->subscription->plan_name }}.
                        @if(auth()->user()->subscription->ends_at)
                            Expires on {{ auth()->user()->subscription->ends_at->format('M j, Y') }}.
                        @endif
                    </p>
                </div>
            </div>
        </div>
        @endif
        @endauth

        <!-- Subscription Plans -->
        <div class="grid md:grid-cols-3 gap-8 mb-12">
            <!-- Free Plan -->
            <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-white mb-2">Free</h3>
                    <div class="text-4xl font-bold text-white mb-4">$0<span class="text-lg text-gray-400">/month</span></div>
                    <p class="text-gray-400 mb-6">Get started with basic features</p>
                </div>

                <ul class="space-y-4 mb-8">
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Limited song skips</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Ads between songs</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Basic audio quality</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Create playlists</span>
                    </li>
                </ul>

                @guest
                <a href="{{ route('register') }}"
                   class="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                    Get Started
                </a>
                @else
                <button disabled class="block w-full text-center bg-gray-600 text-gray-400 font-medium py-3 px-6 rounded-lg cursor-not-allowed">
                    Current Plan
                </button>
                @endguest
            </div>

            <!-- Premium Plan -->
            <div class="bg-gradient-to-b from-green-600 to-green-700 rounded-lg p-8 border-2 border-green-500 relative">
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span class="bg-green-500 text-black text-sm font-bold py-1 px-3 rounded-full">Most Popular</span>
                </div>

                <div class="text-center">
                    <h3 class="text-2xl font-bold text-white mb-2">Premium</h3>
                    <div class="text-4xl font-bold text-white mb-4">$9.99<span class="text-lg text-green-100">/month</span></div>
                    <p class="text-green-100 mb-6">Unlimited music, no ads</p>
                </div>

                <ul class="space-y-4 mb-8">
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">Unlimited skips</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">No ads</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">High quality audio</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">Offline downloads</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">Unlimited playlists</span>
                    </li>
                </ul>

                @auth
                <form action="{{ route('frontend.subscription.subscribe', 'premium') }}" method="POST">
                    @csrf
                    <button type="submit"
                            class="block w-full text-center bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-lg transition-colors">
                        Subscribe Now
                    </button>
                </form>
                @else
                <a href="{{ route('login') }}"
                   class="block w-full text-center bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-lg transition-colors">
                    Sign In to Subscribe
                </a>
                @endauth
            </div>

            <!-- Family Plan -->
            <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-white mb-2">Family</h3>
                    <div class="text-4xl font-bold text-white mb-4">$14.99<span class="text-lg text-gray-400">/month</span></div>
                    <p class="text-gray-400 mb-6">For up to 6 family members</p>
                </div>

                <ul class="space-y-4 mb-8">
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Everything in Premium</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">6 premium accounts</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Family mix playlist</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Parental controls</span>
                    </li>
                </ul>

                @auth
                <form action="{{ route('frontend.subscription.subscribe', 'family') }}" method="POST">
                    @csrf
                    <button type="submit"
                            class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                        Subscribe Now
                    </button>
                </form>
                @else
                <a href="{{ route('login') }}"
                   class="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                    Sign In to Subscribe
                </a>
                @endauth
            </div>
        </div>

        <!-- FAQ Section -->
        <div class="bg-gray-800 rounded-lg p-8">
            <h2 class="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>

            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
                    <p class="text-gray-400">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
                    <p class="text-gray-400">We accept all major credit cards and mobile money payments.</p>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-white mb-2">Can I switch plans?</h3>
                    <p class="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at your next billing cycle.</p>
                </div>
            </div>
        </div>

        <!-- Current Subscription Management -->
        @auth
        @if(auth()->user()->subscription)
        <div class="mt-12 bg-gray-800 rounded-lg p-8">
            <h2 class="text-2xl font-bold text-white mb-6">Manage Your Subscription</h2>

            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Subscription Details</h3>
                    <div class="space-y-2 text-gray-300">
                        <p><strong>Plan:</strong> {{ auth()->user()->subscription->plan_name }}</p>
                        <p><strong>Status:</strong>
                            <span class="text-green-500">{{ ucfirst(auth()->user()->subscription->status) }}</span>
                        </p>
                        @if(auth()->user()->subscription->ends_at)
                        <p><strong>Next Billing:</strong> {{ auth()->user()->subscription->ends_at->format('M j, Y') }}</p>
                        @endif
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Actions</h3>
                    <div class="space-y-3">
                        <a href="{{ route('frontend.subscription.history') }}"
                           class="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                            View Billing History
                        </a>

                        @if(auth()->user()->subscription->status === 'active')
                        <form action="{{ route('frontend.subscription.cancel') }}" method="POST"
                              onsubmit="return confirm('Are you sure you want to cancel your subscription?')">
                            @csrf
                            <button type="submit"
                                    class="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                Cancel Subscription
                            </button>
                        </form>
                        @endif
                    </div>
                </div>
            </div>
        </div>
        @endif
        @endauth
    </div>
</div>
@endsection