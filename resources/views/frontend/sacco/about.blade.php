@extends('frontend.layouts.music')

@section('title', 'LineOne Music SACCO - Savings & Credit Cooperative for Musicians')

@section('left-sidebar')
<div class="p-6 space-y-6">
    <!-- Logo -->
    <div class="flex items-center space-x-2">
        <img src="{{ asset('images/logo.png') }}" alt="TesoTunes" class="h-8 w-8"/>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">TesoTunes</h1>
    </div>
    
    <!-- SACCO Navigation -->
    <nav>
        <p class="text-xs font-semibold mb-3 px-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">SACCO</p>
        <ul class="space-y-1">
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" href="{{ route('frontend.sacco.landing') }}">
                    <span class="material-symbols-outlined text-xl">info</span>
                    <span class="text-sm">About SACCO</span>
                </a>
            </li>
            @auth
                @if(auth()->user()->isSaccoMember())
                <li>
                    <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('sacco.dashboard') }}">
                        <span class="material-symbols-outlined text-xl">dashboard</span>
                        <span class="text-sm">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('sacco.accounts.index') }}">
                        <span class="material-symbols-outlined text-xl">account_balance_wallet</span>
                        <span class="text-sm">My Accounts</span>
                    </a>
                </li>
                <li>
                    <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('sacco.loans.index') }}">
                        <span class="material-symbols-outlined text-xl">payments</span>
                        <span class="text-sm">Loans</span>
                    </a>
                </li>
                @endif
            @endauth
        </ul>
    </nav>

    <!-- Quick Actions -->
    <div class="space-y-3">
        <p class="text-xs font-semibold px-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Actions</p>
        
        @auth
            @if(auth()->user()->isSaccoMember())
            <a href="{{ route('sacco.deposits.create') }}" class="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group">
                <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">add_circle</span>
                </div>
                <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Make Deposit</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Save & grow your money</p>
                </div>
            </a>
            <a href="{{ route('sacco.loans.products') }}" class="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
                <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">account_balance</span>
                </div>
                <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Apply for Loan</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Up to 3x your savings</p>
                </div>
            </a>
            @else
            <a href="{{ route('sacco.register') }}" class="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group">
                <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">person_add</span>
                </div>
                <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Join SACCO</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Start saving today</p>
                </div>
            </a>
            @endif
        @else
        <a href="{{ route('register') }}" class="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">person_add</span>
            </div>
            <div>
                <p class="font-semibold text-gray-900 dark:text-white text-sm">Create Account</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Join TesoTunes first</p>
            </div>
        </a>
        @endauth
    </div>

    <!-- Back to Main Site -->
    <nav>
        <p class="text-xs font-semibold mb-3 px-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Navigate</p>
        <ul class="space-y-1">
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.social.feed') }}">
                    <span class="material-symbols-outlined text-xl">home</span>
                    <span class="text-sm">Home</span>
                </a>
            </li>
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.artists') }}">
                    <span class="material-symbols-outlined text-xl">mic_external_on</span>
                    <span class="text-sm">Artists</span>
                </a>
            </li>
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('esokoni.index') }}">
                    <span class="material-symbols-outlined text-xl">storefront</span>
                    <span class="text-sm">Esokoni</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- Trust Indicators -->
    <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-emerald-500">verified_user</span>
            <span class="font-semibold text-sm text-gray-900 dark:text-white">Trust & Safety</span>
        </div>
        <ul class="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs text-emerald-500">check</span>
                Registered Cooperative
            </li>
            <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs text-emerald-500">check</span>
                Member-owned
            </li>
            <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs text-emerald-500">check</span>
                Transparent Finances
            </li>
            <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs text-emerald-500">check</span>
                Mobile Money Integrated
            </li>
        </ul>
    </div>
</div>
@endsection

@section('right-sidebar')
<div class="p-6 space-y-6">
    <!-- SACCO Highlights -->
    <section>
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Why SACCO + TesoTunes?</h2>
        
        <div class="space-y-4">
            <!-- Revenue to Savings -->
            <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">trending_up</span>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Stream → Save → Grow</h3>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Your streaming revenue can automatically go into savings, earning interest while you sleep.</p>
                    </div>
                </div>
            </div>
            
            <!-- Quick Stats -->
            <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
                    <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">6%</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Annual Interest</p>
                </div>
                <div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
                    <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">3x</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Loan Multiplier</p>
                </div>
            </div>

            <!-- Artist Revenue Integration -->
            <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">music_note</span>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Artist Revenue Link</h3>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Verified artists can auto-deposit streaming earnings directly to SACCO savings.</p>
                    </div>
                </div>
            </div>

            <!-- Store Sales Integration -->
            <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-amber-600 dark:text-amber-400">storefront</span>
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Esokoni Sales Link</h3>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Merchandise sales from your Eduka store can fund your savings automatically.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Calculator Preview -->
    <section>
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Quick Calculator</h2>
        <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-500 dark:text-gray-400">If you save monthly</label>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">UGX 50,000</p>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">After 1 year:</span>
                        <span class="font-semibold text-gray-900 dark:text-white">UGX 636,000</span>
                    </div>
                    <div class="flex justify-between text-sm mt-1">
                        <span class="text-gray-600 dark:text-gray-400">Interest earned:</span>
                        <span class="font-semibold text-emerald-600 dark:text-emerald-400">+ UGX 36,000</span>
                    </div>
                    <div class="flex justify-between text-sm mt-1">
                        <span class="text-gray-600 dark:text-gray-400">Loan capacity:</span>
                        <span class="font-semibold text-blue-600 dark:text-blue-400">UGX 1,908,000</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonial -->
    <section>
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Member Story</h2>
        <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400 italic">"The SACCO helped me save for my studio equipment. The loan was quick and affordable."</p>
            <div class="flex items-center gap-2 mt-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">Music Producer</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Member since 2024</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Support -->
    <section>
        <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">support_agent</span>
                <div>
                    <p class="font-semibold text-sm text-gray-900 dark:text-white">Need Help?</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">sacco@tesotunes.com</p>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('content')
<main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark min-h-screen">
    <div class="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        <!-- Hero Section -->
        <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-8 md:p-12">
            <div class="absolute inset-0 opacity-10">
                <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)"/>
                </svg>
            </div>
            <div class="relative">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm mb-4">
                    <span class="material-symbols-outlined text-sm">account_balance</span>
                    Savings & Credit Cooperative
                </div>
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">LineOne Music SACCO</h1>
                <p class="text-lg md:text-xl text-white/90 max-w-2xl mb-6">A member-owned financial cooperative built specifically for the music community. Save smarter, borrow easier, grow together.</p>
                <div class="flex flex-wrap gap-3">
                    @auth
                        @if(auth()->user()->isSaccoMember())
                        <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                            <span class="material-symbols-outlined">dashboard</span>
                            Go to Dashboard
                        </a>
                        @else
                        <a href="{{ route('sacco.register') }}" class="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                            <span class="material-symbols-outlined">person_add</span>
                            Join Now
                        </a>
                        @endif
                    @else
                    <a href="{{ route('register') }}" class="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                        <span class="material-symbols-outlined">person_add</span>
                        Get Started
                    </a>
                    <a href="{{ route('login') }}" class="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 backdrop-blur-sm transition-colors">
                        <span class="material-symbols-outlined">login</span>
                        Sign In
                    </a>
                    @endauth
                </div>
            </div>
        </section>

        <!-- What is SACCO - Educational -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div class="flex items-start gap-4 mb-6">
                <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">school</span>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">What is a SACCO?</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">Understanding cooperative finance</p>
                </div>
            </div>
            
            <div class="space-y-4 text-gray-600 dark:text-gray-300">
                <p>A <strong class="text-gray-900 dark:text-white">SACCO (Savings and Credit Cooperative Organization)</strong> is a member-owned financial institution where members pool their savings together. Unlike banks that serve shareholders, SACCOs exist to serve their members.</p>
                
                <div class="grid md:grid-cols-2 gap-4 mt-6">
                    <div class="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span class="material-symbols-outlined text-emerald-500">groups</span>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">Member-Owned</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">You're not a customer, you're an owner with voting rights</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span class="material-symbols-outlined text-blue-500">pie_chart</span>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">Profit Sharing</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Members share in annual dividends based on participation</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span class="material-symbols-outlined text-purple-500">handshake</span>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">Community First</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Built by and for musicians who understand your needs</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <span class="material-symbols-outlined text-amber-500">savings</span>
                        <div>
                            <p class="font-semibold text-gray-900 dark:text-white">Affordable Loans</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Borrow at rates lower than commercial banks</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- How It Works - Step by Step -->
        <section>
            <div class="text-center mb-8">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Three simple steps to financial empowerment</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6">
                <div class="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div class="absolute -top-4 left-6 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg">1</div>
                    <div class="pt-4">
                        <div class="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">person_add</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Join the SACCO</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Create your TesoTunes account and apply for SACCO membership. Purchase minimum shares to become a member-owner.</p>
                        <ul class="mt-4 space-y-2 text-sm">
                            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                                Membership fee: UGX {{ number_format(config('sacco.membership.fee', 5000)) }}
                            </li>
                            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                                Min shares: {{ config('sacco.share_capital.min_shares', 2) }} × UGX {{ number_format(config('sacco.share_capital.share_value', 10000)) }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div class="absolute -top-4 left-6 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-lg">2</div>
                    <div class="pt-4">
                        <div class="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">savings</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Save & Earn Interest</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Make regular deposits to your savings account. Your money earns competitive interest, growing passively over time.</p>
                        <ul class="mt-4 space-y-2 text-sm">
                            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-xs text-blue-500">check_circle</span>
                                {{ config('sacco.savings.interest_rate', 6) }}% annual interest rate
                            </li>
                            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-xs text-blue-500">check_circle</span>
                                Mobile Money deposits
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div class="absolute -top-4 left-6 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold shadow-lg">3</div>
                    <div class="pt-4">
                        <div class="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">account_balance</span>
                        </div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Access Affordable Loans</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Need funds for equipment, production, or emergencies? Borrow based on your savings at rates far below banks.</p>
                        <ul class="mt-4 space-y-2 text-sm">
                            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-xs text-purple-500">check_circle</span>
                                Borrow up to 3× your savings
                            </li>
                            <li class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <span class="material-symbols-outlined text-xs text-purple-500">check_circle</span>
                                {{ config('sacco.loans.default_interest_rate', 12) }}% annual interest
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- TesoTunes Integration - The Unique Value -->
        <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-6 md:p-8">
            <div class="flex items-start gap-4 mb-6">
                <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">link</span>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">TesoTunes + SACCO Integration</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">Your music earnings can work harder for you</p>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-emerald-500">play_circle</span>
                        <h3 class="font-semibold text-gray-900 dark:text-white">Streaming Revenue</h3>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Every play on TesoTunes earns you money. Artists can set up automatic transfers of streaming revenue directly into SACCO savings.</p>
                    <div class="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                        <span class="material-symbols-outlined text-sm">trending_up</span>
                        Avg. UGX 7/stream → Auto-save → Earn 6% interest
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-blue-500">storefront</span>
                        <h3 class="font-semibold text-gray-900 dark:text-white">Esokoni Store Sales</h3>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Selling merchandise through your Eduka store? Profits can automatically flow into your SACCO account.</p>
                    <div class="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <span class="material-symbols-outlined text-sm">sync</span>
                        Sales → SACCO Savings → Dividends
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-amber-500">volunteer_activism</span>
                        <h3 class="font-semibold text-gray-900 dark:text-white">Ojokotau Donations</h3>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Fan donations from Ojokotau can be channeled into savings, building your financial safety net from supporter generosity.</p>
                    <div class="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                        <span class="material-symbols-outlined text-sm">favorite</span>
                        Fan support → Savings → Security
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-purple-500">emoji_events</span>
                        <h3 class="font-semibold text-gray-900 dark:text-white">Awards & Prizes</h3>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Cash prizes from TesoTunes Awards can be deposited to SACCO, growing your funds for future projects.</p>
                    <div class="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                        <span class="material-symbols-outlined text-sm">celebration</span>
                        Award winnings → Investment
                    </div>
                </div>
            </div>
        </section>

        <!-- Benefits Section -->
        <section>
            <div class="text-center mb-8">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Member Benefits</h2>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Everything you gain by joining LineOne Music SACCO</p>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">percent</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">Low Interest Loans</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Borrow at {{ config('sacco.loans.default_interest_rate', 12) }}% p.a. - significantly lower than commercial banks charging 20-25%.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">trending_up</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">Competitive Savings Interest</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Earn {{ config('sacco.savings.interest_rate', 6) }}% annually on savings - better than most bank accounts offering 2-3%.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">pie_chart</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">Annual Dividends</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Share in SACCO profits annually based on your shares and participation.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-amber-600 dark:text-amber-400">phone_android</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">Mobile Money Integration</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Deposit and withdraw using MTN MoMo or Airtel Money - no bank visits needed.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-pink-600 dark:text-pink-400">calendar_month</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">Flexible Repayment</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose repayment schedules that match your income flow - monthly, bi-weekly, or custom.</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">school</span>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white">Financial Education</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Access resources, workshops, and guides on financial planning for musicians.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Membership Requirements -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div class="flex items-start gap-4 mb-6">
                <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">checklist</span>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Membership Requirements</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">What you need to join</p>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                    <span class="text-gray-700 dark:text-gray-300">Be at least {{ config('sacco.membership.min_age', 18) }} years old</span>
                </div>
                <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                    <span class="text-gray-700 dark:text-gray-300">Have a valid National ID</span>
                </div>
                <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                    <span class="text-gray-700 dark:text-gray-300">Valid phone number for Mobile Money</span>
                </div>
                <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                    <span class="text-gray-700 dark:text-gray-300">TesoTunes account (free to create)</span>
                </div>
                <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                    <span class="text-gray-700 dark:text-gray-300">Membership fee: UGX {{ number_format(config('sacco.membership.fee', 5000)) }}</span>
                </div>
                <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span class="material-symbols-outlined text-emerald-500">check_circle</span>
                    <span class="text-gray-700 dark:text-gray-300">Min {{ config('sacco.share_capital.min_shares', 2) }} shares (UGX {{ number_format(config('sacco.share_capital.min_shares', 2) * config('sacco.share_capital.share_value', 10000)) }})</span>
                </div>
            </div>

            <div class="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">info</span>
                    <div>
                        <p class="font-semibold text-emerald-800 dark:text-emerald-300">Total to get started:</p>
                        <p class="text-emerald-700 dark:text-emerald-400">UGX {{ number_format(config('sacco.membership.fee', 5000) + (config('sacco.share_capital.min_shares', 2) * config('sacco.share_capital.share_value', 10000))) }} (Membership fee + Minimum shares)</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Loan Products Preview -->
        <section class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div class="flex items-start gap-4 mb-6">
                <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">credit_card</span>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Loan Products</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">Financing options for every need</p>
                </div>
            </div>

            <div class="grid md:grid-cols-3 gap-4">
                <div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                        <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">bolt</span>
                    </div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">Emergency Loan</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">Quick access for urgent needs. Disbursed within 24 hours.</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Up to 1× savings</p>
                </div>

                <div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">headphones</span>
                    </div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">Equipment Loan</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">For studio gear, instruments, and production equipment.</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Up to 3× savings</p>
                </div>

                <div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                        <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">album</span>
                    </div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">Production Loan</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">Finance your album, music video, or tour production costs.</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Up to 3× savings</p>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section>
            <div class="text-center mb-8">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Everything you need to know</p>
            </div>

            <div class="space-y-3" x-data="{ openFaq: null }">
                <!-- FAQ 1 -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button @click="openFaq = openFaq === 1 ? null : 1" class="w-full flex items-center justify-between p-5 text-left">
                        <span class="font-semibold text-gray-900 dark:text-white">How much do I need to join?</span>
                        <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === 1 }">expand_more</span>
                    </button>
                    <div x-show="openFaq === 1" x-collapse class="px-5 pb-5">
                        <p class="text-gray-600 dark:text-gray-400">The total initial investment is UGX {{ number_format(config('sacco.membership.fee', 5000) + (config('sacco.share_capital.min_shares', 2) * config('sacco.share_capital.share_value', 10000))) }}. This includes the membership fee (UGX {{ number_format(config('sacco.membership.fee', 5000)) }}) and minimum {{ config('sacco.share_capital.min_shares', 2) }} shares at UGX {{ number_format(config('sacco.share_capital.share_value', 10000)) }} each. You can purchase additional shares anytime to increase your borrowing capacity.</p>
                    </div>
                </div>

                <!-- FAQ 2 -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button @click="openFaq = openFaq === 2 ? null : 2" class="w-full flex items-center justify-between p-5 text-left">
                        <span class="font-semibold text-gray-900 dark:text-white">How long does membership approval take?</span>
                        <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === 2 }">expand_more</span>
                    </button>
                    <div x-show="openFaq === 2" x-collapse class="px-5 pb-5">
                        <p class="text-gray-600 dark:text-gray-400">Most applications are reviewed within 24 hours. Verified TesoTunes artists may be auto-approved instantly. You'll receive both email and SMS notifications once approved.</p>
                    </div>
                </div>

                <!-- FAQ 3 -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button @click="openFaq = openFaq === 3 ? null : 3" class="w-full flex items-center justify-between p-5 text-left">
                        <span class="font-semibold text-gray-900 dark:text-white">How much can I borrow?</span>
                        <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === 3 }">expand_more</span>
                    </button>
                    <div x-show="openFaq === 3" x-collapse class="px-5 pb-5">
                        <p class="text-gray-600 dark:text-gray-400">You can borrow up to {{ config('sacco.loans.max_loan_to_savings_ratio', 3) }} times your total savings balance. The actual limit depends on your credit score and repayment history. New members typically start with 1× savings and can increase with good standing.</p>
                    </div>
                </div>

                <!-- FAQ 4 -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button @click="openFaq = openFaq === 4 ? null : 4" class="w-full flex items-center justify-between p-5 text-left">
                        <span class="font-semibold text-gray-900 dark:text-white">Can I withdraw my savings anytime?</span>
                        <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === 4 }">expand_more</span>
                    </button>
                    <div x-show="openFaq === 4" x-collapse class="px-5 pb-5">
                        <p class="text-gray-600 dark:text-gray-400">Yes, you can request withdrawals from your savings account anytime, subject to maintaining the minimum balance (UGX {{ number_format(config('sacco.savings.min_balance', 10000)) }}) and daily withdrawal limits. If you have an active loan, your savings serve as collateral until repaid.</p>
                    </div>
                </div>

                <!-- FAQ 5 -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button @click="openFaq = openFaq === 5 ? null : 5" class="w-full flex items-center justify-between p-5 text-left">
                        <span class="font-semibold text-gray-900 dark:text-white">What payment methods are supported?</span>
                        <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === 5 }">expand_more</span>
                    </button>
                    <div x-show="openFaq === 5" x-collapse class="px-5 pb-5">
                        <p class="text-gray-600 dark:text-gray-400">We support MTN Mobile Money, Airtel Money, and bank transfers. All deposits and withdrawals can be processed directly from your phone - no need to visit any office.</p>
                    </div>
                </div>

                <!-- FAQ 6 -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button @click="openFaq = openFaq === 6 ? null : 6" class="w-full flex items-center justify-between p-5 text-left">
                        <span class="font-semibold text-gray-900 dark:text-white">Do I need to be a musician to join?</span>
                        <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === 6 }">expand_more</span>
                    </button>
                    <div x-show="openFaq === 6" x-collapse class="px-5 pb-5">
                        <p class="text-gray-600 dark:text-gray-400">No! While LineOne Music SACCO is designed with the music community in mind, all TesoTunes users are welcome to join - including fans, listeners, and music industry professionals. Everyone benefits from our community-focused approach.</p>
                    </div>
                </div>

                <!-- FAQ 7 -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button @click="openFaq = openFaq === 7 ? null : 7" class="w-full flex items-center justify-between p-5 text-left">
                        <span class="font-semibold text-gray-900 dark:text-white">How is my money protected?</span>
                        <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === 7 }">expand_more</span>
                    </button>
                    <div x-show="openFaq === 7" x-collapse class="px-5 pb-5">
                        <p class="text-gray-600 dark:text-gray-400">Your funds are held in secure, audited accounts. As a cooperative, we maintain reserve requirements and publish annual financial reports to all members. The SACCO is managed by elected member representatives, ensuring transparency and accountability.</p>
                    </div>
                </div>

                <!-- FAQ 8 -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button @click="openFaq = openFaq === 8 ? null : 8" class="w-full flex items-center justify-between p-5 text-left">
                        <span class="font-semibold text-gray-900 dark:text-white">Can I auto-save from my TesoTunes earnings?</span>
                        <span class="material-symbols-outlined text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === 8 }">expand_more</span>
                    </button>
                    <div x-show="openFaq === 8" x-collapse class="px-5 pb-5">
                        <p class="text-gray-600 dark:text-gray-400">Yes! Verified artists can set up automatic transfers from their streaming revenue, Esokoni store sales, and Ojokotau donations directly into their SACCO savings account. This is one of the unique benefits of our TesoTunes integration.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Final CTA -->
        <section class="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Start Your Financial Journey?</h2>
            <p class="text-lg text-white/90 mb-6 max-w-2xl mx-auto">Join thousands of musicians and music lovers building wealth together. Your future self will thank you.</p>
            <div class="flex flex-wrap justify-center gap-4">
                @auth
                    @if(auth()->user()->isSaccoMember())
                    <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                        <span class="material-symbols-outlined">dashboard</span>
                        Go to Dashboard
                    </a>
                    @else
                    <a href="{{ route('sacco.register') }}" class="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                        <span class="material-symbols-outlined">person_add</span>
                        Join SACCO Now
                    </a>
                    @endif
                @else
                <a href="{{ route('register') }}" class="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                    <span class="material-symbols-outlined">person_add</span>
                    Create Free Account
                </a>
                <a href="{{ route('login') }}" class="inline-flex items-center gap-2 bg-white/20 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/30 backdrop-blur-sm transition-colors">
                    <span class="material-symbols-outlined">login</span>
                    Sign In
                </a>
                @endauth
            </div>
            <p class="text-white/70 text-sm mt-6">
                <span class="material-symbols-outlined text-sm align-middle">lock</span>
                Secure • Member-owned • Transparent
            </p>
        </section>

    </div>
</main>
@endsection

@push('scripts')
<script>
// Any additional scripts for the SACCO landing page
</script>
@endpush
