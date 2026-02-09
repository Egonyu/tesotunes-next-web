@extends('frontend.layouts.music')

@section('title', 'Subscription Plans')

@section('content')
<div class="container mx-auto px-6 py-8">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
            <p class="text-xl text-gray-400">Select the perfect plan for your music needs</p>
        </div>

        <!-- Plans Grid -->
        <div class="grid md:grid-cols-2 gap-8">
            <!-- Premium Monthly -->
            <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
                <div class="text-center mb-6">
                    <h3 class="text-2xl font-bold text-white mb-2">Premium Monthly</h3>
                    <div class="text-4xl font-bold text-white mb-2">$9.99<span class="text-lg text-gray-400">/month</span></div>
                    <p class="text-gray-400">Billed monthly</p>
                </div>

                <ul class="space-y-3 mb-8">
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Unlimited music streaming</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">No ads</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">Offline downloads</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-green-500 text-sm">check</span>
                        <span class="text-gray-300">High quality audio</span>
                    </li>
                </ul>

                @auth
                <form action="{{ route('frontend.subscription.subscribe', 'premium-monthly') }}" method="POST">
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

            <!-- Premium Yearly -->
            <div class="bg-gradient-to-b from-green-600 to-green-700 rounded-lg p-8 border-2 border-green-500 relative">
                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span class="bg-green-500 text-black text-sm font-bold py-1 px-3 rounded-full">Save 20%</span>
                </div>

                <div class="text-center mb-6">
                    <h3 class="text-2xl font-bold text-white mb-2">Premium Yearly</h3>
                    <div class="text-4xl font-bold text-white mb-2">$99.99<span class="text-lg text-green-100">/year</span></div>
                    <p class="text-green-100">Billed annually</p>
                    <p class="text-sm text-green-200 mt-2">Save $20 compared to monthly</p>
                </div>

                <ul class="space-y-3 mb-8">
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">Unlimited music streaming</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">No ads</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">Offline downloads</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">High quality audio</span>
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="material-icons-round text-white text-sm">check</span>
                        <span class="text-white">Priority customer support</span>
                    </li>
                </ul>

                @auth
                <form action="{{ route('frontend.subscription.subscribe', 'premium-yearly') }}" method="POST">
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
        </div>

        <!-- Features Comparison -->
        <div class="mt-16">
            <h2 class="text-2xl font-bold text-white mb-8 text-center">What's Included</h2>

            <div class="bg-gray-800 rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="text-left p-4 text-white font-semibold">Features</th>
                            <th class="text-center p-4 text-white font-semibold">Free</th>
                            <th class="text-center p-4 text-white font-semibold">Premium</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-300">
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Music streaming</td>
                            <td class="p-4 text-center">
                                <span class="material-icons-round text-green-500 text-sm">check</span>
                            </td>
                            <td class="p-4 text-center">
                                <span class="material-icons-round text-green-500 text-sm">check</span>
                            </td>
                        </tr>
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Ads</td>
                            <td class="p-4 text-center text-red-400">Yes</td>
                            <td class="p-4 text-center text-green-500">No</td>
                        </tr>
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Skip tracks</td>
                            <td class="p-4 text-center">6 per hour</td>
                            <td class="p-4 text-center text-green-500">Unlimited</td>
                        </tr>
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Offline downloads</td>
                            <td class="p-4 text-center">
                                <span class="material-icons-round text-red-400 text-sm">close</span>
                            </td>
                            <td class="p-4 text-center">
                                <span class="material-icons-round text-green-500 text-sm">check</span>
                            </td>
                        </tr>
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Audio quality</td>
                            <td class="p-4 text-center">Standard</td>
                            <td class="p-4 text-center text-green-500">High</td>
                        </tr>
                        <tr class="border-t border-gray-700">
                            <td class="p-4">Playlists</td>
                            <td class="p-4 text-center">Basic</td>
                            <td class="p-4 text-center text-green-500">Unlimited</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Back Link -->
        <div class="mt-8 text-center">
            <a href="{{ route('frontend.subscription.index') }}"
               class="text-green-500 hover:text-green-400 font-medium">
                ← Back to Subscription Dashboard
            </a>
        </div>
    </div>
</div>
@endsection