@extends('frontend.layouts.sacco')

@section('title', 'SACCO - Savings and Credit Cooperative')

@section('content')
<div class="p-6 space-y-8">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 p-8 md:p-12">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative z-10">
            <div class="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                    <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">LineOne Music SACCO</h1>
                    <p class="text-xl text-white/90 mb-6">Save together, borrow affordably, and grow your financial future as part of our music community.</p>
                    @guest
                        <!-- Guest Users - Prominent Sign-in Options -->
                        <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
                            <p class="text-white font-semibold mb-4">Already a member? Access your SACCO account</p>
                            <div class="flex flex-wrap gap-3">
                                <a href="{{ route('login') }}" class="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                                    <span class="material-icons-round text-lg">login</span>
                                    Sign In
                                </a>
                                <a href="{{ route('register') }}" class="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors shadow-lg">
                                    <span class="material-icons-round text-lg">person_add</span>
                                    Create Account
                                </a>
                            </div>
                        </div>
                    @endguest
                    <div class="flex flex-wrap gap-3">
                        <a href="{{ route('sacco.about') }}" class="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 backdrop-blur-sm transition-colors">
                            <span class="material-icons-round text-lg">info</span>
                            Learn More
                        </a>
                    </div>
                </div>
                <div class="hidden lg:flex items-center justify-center">
                    <div class="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span class="material-icons-round text-white" style="font-size: 120px;">savings</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Benefits Section -->
    <section class="space-y-6">
        <h2 class="text-3xl font-bold text-white text-center">Why Join Our SACCO?</h2>
        <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500 transition-colors">
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                        <span class="material-icons-round text-4xl text-green-500">paid</span>
                    </div>
                    <h5 class="text-xl font-semibold text-white mb-3">Competitive Savings Rates</h5>
                    <p class="text-gray-400">Earn {{ config('sacco.savings.interest_rate', 6) }}% annual interest on your savings with no hidden fees.</p>
                </div>
            </div>
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors">
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                        <span class="material-icons-round text-4xl text-blue-500">account_balance</span>
                    </div>
                    <h5 class="text-xl font-semibold text-white mb-3">Affordable Loans</h5>
                    <p class="text-gray-400">Access loans at {{ config('sacco.loans.default_interest_rate', 12) }}% interest - up to 3x your savings balance.</p>
                </div>
            </div>
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-colors">
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                        <span class="material-icons-round text-4xl text-purple-500">pie_chart</span>
                    </div>
                    <h5 class="text-xl font-semibold text-white mb-3">Annual Dividends</h5>
                    <p class="text-gray-400">Share in SACCO profits through annual dividend distributions to all members.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Loan Products Section -->
    <section class="bg-gray-800/50 rounded-2xl p-8 space-y-6">
        <h2 class="text-3xl font-bold text-white text-center">Available Loan Products</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach($loanProducts as $product)
            <div class="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:border-green-500 transition-colors">
                <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                    <h5 class="text-xl font-semibold text-white">{{ $product->name }}</h5>
                </div>
                <div class="p-6">
                    <p class="text-gray-400 mb-4">{{ $product->description }}</p>
                    <ul class="space-y-2">
                        <li class="flex items-center gap-2 text-gray-300">
                            <span class="material-icons-round text-green-500 text-sm">check_circle</span>
                            Interest: {{ $product->interest_rate }}% p.a.
                        </li>
                        <li class="flex items-center gap-2 text-gray-300">
                            <span class="material-icons-round text-green-500 text-sm">check_circle</span>
                            Max Amount: UGX {{ number_format($product->max_amount) }}
                        </li>
                        <li class="flex items-center gap-2 text-gray-300">
                            <span class="material-icons-round text-green-500 text-sm">check_circle</span>
                            Up to {{ $product->max_repayment_months }} months
                        </li>
                    </ul>
                </div>
            </div>
            @endforeach
        </div>
    </section>

    <!-- How It Works -->
    <section class="space-y-6">
        <h2 class="text-3xl font-bold text-white text-center">How It Works</h2>
        <div class="grid md:grid-cols-4 gap-6">
            <div class="text-center">
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <span class="text-2xl font-bold text-white">1</span>
                    </div>
                </div>
                <h5 class="text-lg font-semibold text-white mb-2">@guest Sign In @else Member Access @endguest</h5>
                <p class="text-gray-400 text-sm">@guest Create an account or sign in to LineOne Music @else Your SACCO account is automatically created @endguest</p>
            </div>
            <div class="text-center">
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                        <span class="text-2xl font-bold text-white">2</span>
                    </div>
                </div>
                <h5 class="text-lg font-semibold text-white mb-2">Instant Access</h5>
                <p class="text-gray-400 text-sm">Get immediate access to your SACCO dashboard and accounts</p>
            </div>
            <div class="text-center">
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-2xl font-bold text-white">3</span>
                    </div>
                </div>
                <h5 class="text-lg font-semibold text-white mb-2">Start Saving</h5>
                <p class="text-gray-400 text-sm">Begin saving and building your credit score for loan eligibility</p>
            </div>
            <div class="text-center">
                <div class="flex justify-center mb-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-500 rounded-full flex items-center justify-center">
                        <span class="text-2xl font-bold text-white">4</span>
                    </div>
                </div>
                <h5 class="text-lg font-semibold text-white mb-2">Access Loans</h5>
                <p class="text-gray-400 text-sm">Apply for loans based on your savings and credit score</p>
            </div>
        </div>
    </section>

    <!-- Call to Action -->
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-12 text-center">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative z-10">
            <h2 class="text-3xl font-bold text-white mb-4">Ready to Join?</h2>
            <p class="text-xl text-white/90 mb-6">Start your journey to financial empowerment today!</p>
            @guest
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="{{ route('login') }}" class="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                        <span class="material-icons-round text-lg">login</span>
                        Sign In Now
                    </a>
                    <a href="{{ route('register') }}" class="inline-flex items-center gap-2 bg-green-700 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-800 transition-colors shadow-lg">
                        <span class="material-icons-round text-lg">person_add</span>
                        Create Account
                    </a>
                </div>
                <p class="text-white/80 text-sm mt-4">Access to SACCO is automatic for all registered users</p>
            @endguest
        </div>
    </section>
</div>
@endsection
