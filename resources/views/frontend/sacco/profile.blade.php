@extends('frontend.layouts.music')

@section('title', 'SACCO Profile & Settings')

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
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('frontend.sacco.landing') }}">
                    <span class="material-symbols-outlined text-xl">info</span>
                    <span class="text-sm">About SACCO</span>
                </a>
            </li>
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('sacco.dashboard') }}">
                    <span class="material-symbols-outlined text-xl">dashboard</span>
                    <span class="text-sm">Dashboard</span>
                </a>
            </li>
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('sacco.accounts.index') }}">
                    <span class="material-symbols-outlined text-xl">account_balance_wallet</span>
                    <span class="text-sm">Accounts</span>
                </a>
            </li>
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('sacco.loans.index') }}">
                    <span class="material-symbols-outlined text-xl">payments</span>
                    <span class="text-sm">Loans</span>
                </a>
            </li>
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('sacco.transactions') }}">
                    <span class="material-symbols-outlined text-xl">receipt_long</span>
                    <span class="text-sm">Transactions</span>
                </a>
            </li>
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" href="{{ route('sacco.dividends') }}">
                    <span class="material-symbols-outlined text-xl">trending_up</span>
                    <span class="text-sm">Dividends</span>
                </a>
            </li>
            <li>
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" href="{{ route('sacco.profile') }}">
                    <span class="material-symbols-outlined text-xl">settings</span>
                    <span class="text-sm">Profile & Settings</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- Quick Stats Card -->
    <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <p class="text-xs font-semibold mb-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Stats</p>
        <div class="space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">Member Status</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium {{ $member->status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' }}">
                    {{ ucfirst($member->status) }}
                </span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">Credit Score</span>
                <span class="text-sm font-semibold {{ $member->credit_score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : ($member->credit_score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400') }}">
                    {{ $member->credit_score ?? 0 }}/100
                </span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-600 dark:text-gray-400">Total Savings</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white">UGX {{ number_format($member->total_savings ?? 0) }}</span>
            </div>
        </div>
    </div>

    <!-- Help Card -->
    <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-blue-500">help</span>
            <span class="font-semibold text-sm text-gray-900 dark:text-white">Need Help?</span>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">Contact our SACCO support team for assistance.</p>
        <a href="{{ route('frontend.sacco.landing') }}#contact" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Contact Support →
        </a>
    </div>
</div>
@endsection

@section('right-sidebar')
<div class="p-6 space-y-6">
    <!-- Profile Summary -->
    <div class="text-center">
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-3">
            @if(auth()->user()->avatar)
                <img src="{{ auth()->user()->avatar }}" alt="{{ auth()->user()->name }}" class="w-full h-full rounded-full object-cover"/>
            @else
                <span class="material-symbols-outlined text-4xl text-white">person</span>
            @endif
        </div>
        <h3 class="font-bold text-gray-900 dark:text-white">{{ auth()->user()->name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">Member #{{ $member->member_number }}</p>
        <div class="flex justify-center gap-2 mt-2">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                {{ ucfirst($member->membership_tier ?? 'basic') }}
            </span>
        </div>
    </div>

    <!-- Membership Card -->
    <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-semibold uppercase tracking-wider opacity-80">SACCO ID</span>
            <span class="material-symbols-outlined">credit_card</span>
        </div>
        <p class="text-lg font-mono font-bold mb-4">{{ $member->member_number }}</p>
        <div class="flex justify-between items-end text-xs">
            <div>
                <p class="opacity-80">Member Since</p>
                <p class="font-semibold">{{ $member->joined_date?->format('M Y') ?? 'N/A' }}</p>
            </div>
            <div class="text-right">
                <p class="opacity-80">Type</p>
                <p class="font-semibold">{{ ucfirst($member->membership_type ?? 'Regular') }}</p>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="space-y-2">
        <p class="text-xs font-semibold px-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Actions</p>
        <a href="{{ route('sacco.deposits.create') }}" class="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <span class="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">add</span>
            </span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Make Deposit</span>
        </a>
        <a href="{{ route('sacco.loans.apply') }}" class="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span class="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400">payments</span>
            </span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">Apply for Loan</span>
        </a>
        <a href="{{ route('sacco.accounts.index') }}" class="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <span class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span class="material-symbols-outlined text-sm text-purple-600 dark:text-purple-400">receipt</span>
            </span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">View Statements</span>
        </a>
    </div>
</div>
@endsection

@section('content')
<main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-[#0D1117] min-h-screen">
    <div class="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h2>
                <p class="text-gray-500 dark:text-gray-400">Manage your SACCO membership details and preferences</p>
            </div>
            <a href="{{ route('sacco.dashboard') }}" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors">
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                Back to Dashboard
            </a>
        </div>

        <!-- Membership Info Card -->
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-500">badge</span>
                    Membership Information
                </h3>
            </div>
            <div class="p-6">
                <div class="flex flex-col md:flex-row gap-6 items-start">
                    <!-- Avatar -->
                    <div class="flex-shrink-0">
                        <div class="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            @if(auth()->user()->avatar)
                                <img src="{{ auth()->user()->avatar }}" alt="{{ auth()->user()->name }}" class="w-full h-full rounded-2xl object-cover"/>
                            @else
                                <span class="material-symbols-outlined text-5xl text-white">person</span>
                            @endif
                        </div>
                    </div>
                    
                    <!-- Info -->
                    <div class="flex-1 space-y-4">
                        <div>
                            <h4 class="text-xl font-bold text-gray-900 dark:text-white">{{ auth()->user()->name }}</h4>
                            <p class="text-gray-500 dark:text-gray-400">{{ auth()->user()->email }}</p>
                        </div>
                        
                        <div class="flex flex-wrap gap-2">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                {{ ucfirst($member->membership_tier ?? 'Basic') }} Member
                            </span>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold {{ $member->status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' }}">
                                {{ ucfirst($member->status) }}
                            </span>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                ID: {{ $member->member_number }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Details Grid -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Membership Type</label>
                        <p class="mt-1 text-gray-900 dark:text-white font-medium">{{ ucfirst($member->membership_type ?? 'Regular') }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Joined</label>
                        <p class="mt-1 text-gray-900 dark:text-white font-medium">{{ $member->joined_date?->format('M d, Y') ?? 'N/A' }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credit Score</label>
                        <p class="mt-1 font-medium flex items-center gap-2">
                            <span class="{{ $member->credit_score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : ($member->credit_score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400') }}">
                                {{ $member->credit_score ?? 0 }}/100
                            </span>
                            @if($member->credit_score >= 70)
                                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                            @elseif($member->credit_score >= 50)
                                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                            @else
                                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                            @endif
                        </p>
                    </div>
                    @if(isset($member->loan_eligible_at))
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loan Eligible Since</label>
                        <p class="mt-1 text-gray-900 dark:text-white font-medium">{{ $member->loan_eligible_at->format('M d, Y') }}</p>
                    </div>
                    @endif
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Savings</label>
                        <p class="mt-1 text-gray-900 dark:text-white font-medium">UGX {{ number_format($member->total_savings ?? 0) }}</p>
                    </div>
                    <div>
                        <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Shares</label>
                        <p class="mt-1 text-gray-900 dark:text-white font-medium">UGX {{ number_format($member->total_shares ?? 0) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Artist Revenue Settings -->
        @if($member->membership_tier === 'artist')
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-purple-500">music_note</span>
                    Artist Revenue Settings
                </h3>
            </div>
            <div class="p-6">
                <form action="{{ route('sacco.profile.update') }}" method="POST" class="space-y-6">
                    @csrf

                    <!-- Auto-Deposit Toggle -->
                    <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div>
                            <label class="font-medium text-gray-900 dark:text-white">Auto-Deposit Music Earnings</label>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Automatically deposit a percentage of your music revenue to SACCO</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="auto_deposit_enabled" value="1" class="sr-only peer" 
                                   {{ $member->auto_deposit_enabled ? 'checked' : '' }}>
                            <div class="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    @if($member->auto_deposit_enabled)
                    <!-- Deposit Percentage Slider -->
                    <div class="space-y-3">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Auto-Deposit Percentage</label>
                        <div class="flex items-center gap-4">
                            <input type="range" name="auto_deposit_percentage" min="10" max="100" step="5" 
                                   value="{{ $member->auto_deposit_percentage ?? 50 }}" 
                                   class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                   oninput="this.nextElementSibling.textContent = this.value + '%'">
                            <span class="text-lg font-bold text-gray-900 dark:text-white min-w-[60px] text-right">{{ $member->auto_deposit_percentage ?? 50 }}%</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Remaining {{ 100 - ($member->auto_deposit_percentage ?? 50) }}% goes to your wallet
                        </p>
                    </div>
                    @endif

                    <!-- Save Button -->
                    <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="submit" class="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>

                <!-- Revenue Statistics -->
                <div class="mt-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <h4 class="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-purple-500">analytics</span>
                        Revenue Deposits (All Time)
                    </h4>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">From Music Sales</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($member->total_revenue_deposited ?? 0) }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">From Platform Credits</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white">UGX {{ number_format($member->total_credits_deposited ?? 0) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @endif

        <!-- Notification Settings -->
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-500">notifications</span>
                    Notification Settings
                </h3>
            </div>
            <div class="p-6 space-y-4">
                <!-- Email Notifications -->
                <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div>
                        <label class="font-medium text-gray-900 dark:text-white">Email Notifications</label>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive email updates about your SACCO activity</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>

                <!-- SMS Notifications -->
                <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div>
                        <label class="font-medium text-gray-900 dark:text-white">SMS Notifications</label>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive SMS alerts for transactions</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>

                <!-- Push Notifications -->
                <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div>
                        <label class="font-medium text-gray-900 dark:text-white">Push Notifications</label>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive push notifications on this device</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>

                <!-- Loan Reminders -->
                <div class="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div>
                        <label class="font-medium text-gray-900 dark:text-white">Loan Payment Reminders</label>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Get reminders before loan payments are due</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-white dark:bg-[#161B22] rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden">
            <div class="px-6 py-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
                <h3 class="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <span class="material-symbols-outlined">warning</span>
                    Danger Zone
                </h3>
            </div>
            <div class="p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h4 class="font-medium text-gray-900 dark:text-white">Request Account Closure</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400">This will initiate the process to close your SACCO membership. All funds will be returned after processing.</p>
                    </div>
                    <button type="button" class="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-medium rounded-lg transition-colors whitespace-nowrap"
                            onclick="if(confirm('Are you sure you want to request account closure? This action will initiate the withdrawal process.')) { alert('Please contact SACCO support to proceed with account closure.'); }">
                        Request Closure
                    </button>
                </div>
            </div>
        </div>
    </div>
</main>
@endsection
