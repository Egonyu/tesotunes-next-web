@extends('frontend.layouts.music')

@section('title', 'Join SACCO - Membership Application')

@php
    // Set default values from controller or empty array
    $prefillData = $prefillData ?? [];
    $isVerified = $isVerified ?? false;
    $verificationStatus = $verificationStatus ?? [];
    $suggestedMembershipType = $suggestedMembershipType ?? 'regular';
@endphp

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
                <a class="flex items-center space-x-3 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" href="{{ route('sacco.register') }}">
                    <span class="material-symbols-outlined text-xl">person_add</span>
                    <span class="text-sm">Join SACCO</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- Application Progress -->
    <div class="space-y-3">
        <p class="text-xs font-semibold px-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Application Steps</p>
        
        <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">Fill Application</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Complete the form</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 opacity-50">
                    <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">Review</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">24hr approval</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 opacity-50">
                    <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">Payment</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Membership & shares</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 opacity-50">
                    <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">Activated</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Start saving!</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Requirements Checklist -->
    <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-blue-500">checklist</span>
            <span class="font-semibold text-sm text-gray-900 dark:text-white">Requirements</span>
        </div>
        <ul class="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                Age 18+ years
            </li>
            <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                Valid Government ID
            </li>
            <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                Mobile Money number
            </li>
            <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                Verified email
            </li>
        </ul>
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
        </ul>
    </nav>

    <!-- Need Help -->
    <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">help</span>
            <div>
                <p class="font-semibold text-sm text-gray-900 dark:text-white">Need Help?</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">sacco@tesotunes.com</p>
            </div>
        </div>
    </div>
</div>
@endsection

@section('right-sidebar')
<div class="p-6 space-y-6">
    <!-- Investment Summary -->
    <section>
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Investment Summary</h2>
        
        <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Membership Fee</span>
                    <span class="font-semibold text-gray-900 dark:text-white">UGX {{ number_format(config('sacco.membership.fee', 5000)) }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Min. Shares ({{ config('sacco.share_capital.min_shares', 2) }}×)</span>
                    <span class="font-semibold text-gray-900 dark:text-white">UGX {{ number_format(config('sacco.share_capital.min_shares', 2) * config('sacco.share_capital.share_value', 10000)) }}</span>
                </div>
                <div class="border-t border-emerald-200 dark:border-emerald-700 pt-3">
                    <div class="flex justify-between items-center">
                        <span class="font-semibold text-gray-900 dark:text-white">Total to Start</span>
                        <span class="font-bold text-lg text-emerald-600 dark:text-emerald-400">UGX {{ number_format(config('sacco.membership.fee', 5000) + (config('sacco.share_capital.min_shares', 2) * config('sacco.share_capital.share_value', 10000))) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- What You Get -->
    <section>
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">What You Get</h2>
        
        <div class="space-y-3">
            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <span class="material-symbols-outlined text-emerald-500">savings</span>
                <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Savings Account</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Earn {{ config('sacco.savings.interest_rate', 6) }}% annual interest</p>
                </div>
            </div>
            
            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <span class="material-symbols-outlined text-blue-500">account_balance</span>
                <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Loan Access</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Borrow up to 3× your savings</p>
                </div>
            </div>
            
            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <span class="material-symbols-outlined text-purple-500">pie_chart</span>
                <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Annual Dividends</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Share in SACCO profits</p>
                </div>
            </div>
            
            <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <span class="material-symbols-outlined text-amber-500">how_to_vote</span>
                <div>
                    <p class="font-semibold text-gray-900 dark:text-white text-sm">Voting Rights</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Participate in decisions</p>
                </div>
            </div>
        </div>
    </section>

    <!-- TesoTunes Integration -->
    <section>
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Artist Benefits</h2>
        
        <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
            <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">music_note</span>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Auto-Save Revenue</h3>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Verified artists can auto-deposit streaming earnings directly to SACCO.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick FAQ -->
    <section>
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Quick FAQ</h2>
        
        <div class="space-y-3">
            <details class="group">
                <summary class="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer">
                    <span class="font-medium text-sm text-gray-900 dark:text-white">How long for approval?</span>
                    <span class="material-symbols-outlined text-gray-500 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p class="px-3 pt-2 text-sm text-gray-600 dark:text-gray-400">Most applications are approved within 24 hours. Artists may be auto-approved.</p>
            </details>
            
            <details class="group">
                <summary class="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer">
                    <span class="font-medium text-sm text-gray-900 dark:text-white">Can I withdraw anytime?</span>
                    <span class="material-symbols-outlined text-gray-500 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p class="px-3 pt-2 text-sm text-gray-600 dark:text-gray-400">Yes, subject to minimum balance requirements. Daily limits apply.</p>
            </details>
            
            <details class="group">
                <summary class="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer">
                    <span class="font-medium text-sm text-gray-900 dark:text-white">Payment methods?</span>
                    <span class="material-symbols-outlined text-gray-500 group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p class="px-3 pt-2 text-sm text-gray-600 dark:text-gray-400">MTN MoMo, Airtel Money, and bank transfers accepted.</p>
            </details>
        </div>
    </section>

    <!-- Trust Badge -->
    <section>
        <div class="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
            <span class="material-symbols-outlined text-emerald-500 text-3xl">verified_user</span>
            <p class="font-semibold text-sm text-gray-900 dark:text-white mt-2">Secure & Transparent</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Member-owned cooperative</p>
        </div>
    </section>
</div>
@endsection

@section('content')
<main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-background-dark min-h-screen">
    <div class="max-w-3xl mx-auto p-4 md:p-8">
        
        <!-- Page Header -->
        <div class="mb-8">
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <a href="{{ route('frontend.sacco.landing') }}" class="hover:text-emerald-500 transition-colors">SACCO</a>
                <span class="material-symbols-outlined text-xs">chevron_right</span>
                <span>Join</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Join LineOne Music SACCO</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-2">Complete the application form below. Your membership will be reviewed within 24 hours.</p>
        </div>

        @if($isVerified)
        <!-- Pre-filled Notice -->
        <div class="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">verified_user</span>
                <div>
                    <p class="font-semibold text-emerald-700 dark:text-emerald-300">Your details have been pre-filled!</p>
                    <p class="text-emerald-600 dark:text-emerald-400 text-sm mt-1">Since you're already verified on TesoTunes, we've pre-filled your information. Please review and complete any missing fields.</p>
                </div>
            </div>
        </div>
        @elseif(!empty($prefillData['email']))
        <!-- Existing User Notice -->
        <div class="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">person</span>
                <div>
                    <p class="font-semibold text-blue-700 dark:text-blue-300">Welcome back, {{ $prefillData['full_name'] ?? auth()->user()->name }}!</p>
                    <p class="text-blue-600 dark:text-blue-400 text-sm mt-1">We've pre-filled some details from your profile. Please complete the remaining fields.</p>
                    @if(!($verificationStatus['email_verified'] ?? false) || !($verificationStatus['phone_verified'] ?? false))
                    <p class="text-blue-600 dark:text-blue-400 text-sm mt-2">
                        <strong>Tip:</strong> 
                        @if(!($verificationStatus['email_verified'] ?? false))
                        <a href="{{ route('verification.notice') }}" class="underline">Verify your email</a>
                        @endif
                        @if(!($verificationStatus['email_verified'] ?? false) && !($verificationStatus['phone_verified'] ?? false)) and @endif
                        @if(!($verificationStatus['phone_verified'] ?? false))
                        <a href="{{ route('frontend.profile.settings') }}" class="underline">verify your phone</a>
                        @endif
                        for faster approval.
                    </p>
                    @endif
                </div>
            </div>
        </div>
        @endif

        <!-- Verification Status Badges -->
        @if(!empty($verificationStatus))
        <div class="mb-6 flex flex-wrap gap-2">
            @if($verificationStatus['email_verified'] ?? false)
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <span class="material-symbols-outlined text-sm">mail</span>
                Email Verified
            </span>
            @endif
            @if($verificationStatus['phone_verified'] ?? false)
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <span class="material-symbols-outlined text-sm">phone</span>
                Phone Verified
            </span>
            @endif
            @if($verificationStatus['id_verified'] ?? false)
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <span class="material-symbols-outlined text-sm">badge</span>
                ID Verified
            </span>
            @endif
            @if($verificationStatus['is_artist'] ?? false)
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                <span class="material-symbols-outlined text-sm">mic</span>
                Artist Account
            </span>
            @endif
        </div>
        @endif

        <!-- Alert Messages -->
        @if(session('success'))
        <div class="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
                <p class="text-emerald-700 dark:text-emerald-300">{{ session('success') }}</p>
            </div>
        </div>
        @endif

        @if(session('error'))
        <div class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
                <p class="text-red-700 dark:text-red-300">{{ session('error') }}</p>
            </div>
        </div>
        @endif

        @if($errors->any())
        <div class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-red-600 dark:text-red-400 mt-0.5">error</span>
                <div>
                    <p class="font-semibold text-red-700 dark:text-red-300">Please fix the following errors:</p>
                    <ul class="list-disc list-inside text-sm text-red-600 dark:text-red-400 mt-2">
                        @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
        @endif

        <!-- Application Form -->
        <form action="{{ route('sacco.enroll') }}" method="POST" class="space-y-6">
            @csrf

            <!-- Section: Member Type -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">badge</span>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Membership Type</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Select your membership category</p>
                    </div>
                </div>

                @if($verificationStatus['is_artist'] ?? false)
                <!-- Artist auto-selection notice -->
                <div class="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">auto_awesome</span>
                        <p class="text-emerald-700 dark:text-emerald-300 text-sm font-medium">As an artist, we've pre-selected Regular membership for you.</p>
                    </div>
                </div>
                @endif

                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <input class="peer sr-only" type="radio" name="membership_type" id="regular" value="regular" {{ old('membership_type', $suggestedMembershipType) == 'regular' ? 'checked' : '' }}>
                        <label for="regular" class="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/30 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                            <span class="material-symbols-outlined text-2xl text-gray-600 dark:text-gray-400 peer-checked:text-emerald-600 mb-2">person</span>
                            <span class="text-gray-900 dark:text-white font-medium text-sm">Regular</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">Full benefits</span>
                        </label>
                    </div>
                    <div>
                        <input class="peer sr-only" type="radio" name="membership_type" id="associate" value="associate" {{ old('membership_type', $suggestedMembershipType) == 'associate' ? 'checked' : '' }}>
                        <label for="associate" class="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/30 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                            <span class="material-symbols-outlined text-2xl text-gray-600 dark:text-gray-400 peer-checked:text-emerald-600 mb-2">group</span>
                            <span class="text-gray-900 dark:text-white font-medium text-sm">Associate</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">Limited benefits</span>
                        </label>
                    </div>
                    <div>
                        <input class="peer sr-only" type="radio" name="membership_type" id="honorary" value="honorary" {{ old('membership_type', $suggestedMembershipType) == 'honorary' ? 'checked' : '' }}>
                        <label for="honorary" class="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/30 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                            <span class="material-symbols-outlined text-2xl text-gray-600 dark:text-gray-400 peer-checked:text-emerald-600 mb-2">workspace_premium</span>
                            <span class="text-gray-900 dark:text-white font-medium text-sm">Honorary</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">Special member</span>
                        </label>
                    </div>
                </div>
                @error('membership_type')
                <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                @enderror
            </div>

            <!-- Section: Identification -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">id_card</span>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Identification</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Your government-issued ID details</p>
                    </div>
                </div>

                @if($verificationStatus['has_id_document'] ?? false)
                <!-- ID Document Already Uploaded Notice -->
                <div class="mb-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">verified</span>
                        <div class="flex-1">
                            <p class="text-emerald-700 dark:text-emerald-300 font-semibold">ID Document Already on File</p>
                            <p class="text-emerald-600 dark:text-emerald-400 text-sm mt-1">Your ID document was uploaded during registration and will be used for this application.</p>
                            @if($prefillData['id_document_url'] ?? false)
                            <a href="{{ $prefillData['id_document_url'] }}" target="_blank" class="inline-flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-300 hover:underline mt-2">
                                <span class="material-symbols-outlined text-sm">visibility</span>
                                View Document
                            </a>
                            @endif
                        </div>
                    </div>
                </div>
                @endif

                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ID Type <span class="text-red-500">*</span>
                        </label>
                        <select name="id_type" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors" required>
                            <option value="">Select ID Type</option>
                            <option value="national_id" {{ old('id_type', $prefillData['id_type'] ?? '') == 'national_id' ? 'selected' : '' }}>National ID</option>
                            <option value="passport" {{ old('id_type', $prefillData['id_type'] ?? '') == 'passport' ? 'selected' : '' }}>Passport</option>
                            <option value="driving_license" {{ old('id_type', $prefillData['id_type'] ?? '') == 'driving_license' ? 'selected' : '' }}>Driving License</option>
                        </select>
                        @error('id_type')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            ID Number <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="id_number" value="{{ old('id_number', $prefillData['id_number'] ?? '') }}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors {{ !empty($prefillData['id_number']) && ($verificationStatus['id_verified'] ?? false) ? 'bg-emerald-50 dark:bg-emerald-900/10' : '' }}" placeholder="Enter your ID number" required {{ !empty($prefillData['id_number']) && ($verificationStatus['id_verified'] ?? false) ? 'readonly' : '' }}>
                        @if(!empty($prefillData['id_number']) && ($verificationStatus['id_verified'] ?? false))
                        <p class="text-emerald-600 dark:text-emerald-400 text-xs mt-1 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">verified</span>
                            Verified ID - Read only
                        </p>
                        @endif
                        @error('id_number')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Section: Contact Information -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">contact_phone</span>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Contact Information</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">How we can reach you</p>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">+256</span>
                            <input type="tel" name="phone" value="{{ old('phone', ltrim($prefillData['phone'] ?? '', '+256')) }}" class="w-full pl-14 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors {{ !empty($prefillData['phone']) && ($verificationStatus['phone_verified'] ?? false) ? 'bg-emerald-50 dark:bg-emerald-900/10' : '' }}" placeholder="700000000" required {{ !empty($prefillData['phone']) && ($verificationStatus['phone_verified'] ?? false) ? 'readonly' : '' }}>
                        </div>
                        @if(!empty($prefillData['phone']) && ($verificationStatus['phone_verified'] ?? false))
                        <p class="text-emerald-600 dark:text-emerald-400 text-xs mt-1 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">verified</span>
                            Verified phone - Read only
                        </p>
                        @endif
                        @error('phone')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Physical Address <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="address" value="{{ old('address', $prefillData['address'] ?? '') }}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors" placeholder="District, Town" required>
                        @error('address')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Section: Next of Kin -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-amber-600 dark:text-amber-400">family_restroom</span>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Next of Kin</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Emergency contact person</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="next_of_kin_name" value="{{ old('next_of_kin_name', $prefillData['next_of_kin_name'] ?? '') }}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors" placeholder="Next of kin's full name" required>
                            @error('next_of_kin_name')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone Number <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">+256</span>
                                <input type="tel" name="next_of_kin_phone" value="{{ old('next_of_kin_phone', ltrim($prefillData['next_of_kin_phone'] ?? '', '+256')) }}" class="w-full pl-14 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors" placeholder="700000000" required>
                            </div>
                            @error('next_of_kin_phone')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Relationship <span class="text-red-500">*</span>
                        </label>
                        <select name="next_of_kin_relationship" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors" required>
                            <option value="">Select Relationship</option>
                            <option value="spouse" {{ old('next_of_kin_relationship', $prefillData['next_of_kin_relationship'] ?? '') == 'spouse' ? 'selected' : '' }}>Spouse</option>
                            <option value="parent" {{ old('next_of_kin_relationship', $prefillData['next_of_kin_relationship'] ?? '') == 'parent' ? 'selected' : '' }}>Parent</option>
                            <option value="sibling" {{ old('next_of_kin_relationship', $prefillData['next_of_kin_relationship'] ?? '') == 'sibling' ? 'selected' : '' }}>Sibling</option>
                            <option value="child" {{ old('next_of_kin_relationship', $prefillData['next_of_kin_relationship'] ?? '') == 'child' ? 'selected' : '' }}>Child</option>
                            <option value="other" {{ old('next_of_kin_relationship', $prefillData['next_of_kin_relationship'] ?? '') == 'other' ? 'selected' : '' }}>Other</option>
                        </select>
                        @error('next_of_kin_relationship')
                        <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>

            <!-- Section: Employment (Optional) -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-teal-600 dark:text-teal-400">work</span>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Employment Information</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Optional - helps with loan eligibility</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employment Status</label>
                            <select name="employment_status" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors">
                                <option value="">Select Status</option>
                                <option value="employed" {{ old('employment_status') == 'employed' ? 'selected' : '' }}>Employed</option>
                                <option value="self_employed" {{ old('employment_status') == 'self_employed' ? 'selected' : '' }}>Self-Employed</option>
                                <option value="artist" {{ old('employment_status', ($verificationStatus['is_artist'] ?? false) ? 'artist' : '') == 'artist' ? 'selected' : '' }}>Artist/Musician</option>
                                <option value="student" {{ old('employment_status') == 'student' ? 'selected' : '' }}>Student</option>
                                <option value="unemployed" {{ old('employment_status') == 'unemployed' ? 'selected' : '' }}>Unemployed</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employer/Business Name</label>
                            <input type="text" name="employer_name" value="{{ old('employer_name', $prefillData['employer_name'] ?? '') }}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors" placeholder="Company or business name">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimated Monthly Income (UGX)</label>
                        <input type="number" name="monthly_income" value="{{ old('monthly_income') }}" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors" placeholder="500000" min="0" step="10000">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Including music earnings, salary, business income, etc.</p>
                    </div>
                </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-start gap-4">
                    <input type="checkbox" id="terms" name="terms_accepted" class="mt-1 w-5 h-5 text-emerald-600 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500 focus:ring-2" required {{ old('terms_accepted') ? 'checked' : '' }}>
                    <label for="terms" class="text-gray-700 dark:text-gray-300">
                        I have read and agree to the <button type="button" onclick="document.getElementById('termsModal').showModal()" class="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">SACCO Terms and Conditions</button>, including membership obligations, savings requirements, and loan policies. <span class="text-red-500">*</span>
                    </label>
                </div>
                @error('terms_accepted')
                <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                @enderror
            </div>

            <!-- Submit Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
                <button type="submit" class="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors shadow-lg">
                    <span class="material-symbols-outlined">send</span>
                    Submit Application
                </button>
                <a href="{{ route('frontend.sacco.landing') }}" class="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-6 py-4 rounded-xl font-semibold transition-colors">
                    <span class="material-symbols-outlined">arrow_back</span>
                    Back
                </a>
            </div>

            <!-- Info Note -->
            <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                    <div class="text-sm text-blue-700 dark:text-blue-300">
                        <p class="font-semibold">What happens next?</p>
                        <p class="mt-1">After submitting, our team will review your application within 24 hours. You'll receive an email and SMS notification with your membership status. Once approved, you can proceed to make your initial payment and start saving!</p>
                    </div>
                </div>
            </div>
        </form>

    </div>
</main>

<!-- Terms Modal -->
<dialog id="termsModal" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-0 backdrop:bg-black/70 max-w-2xl w-full mx-4">
    <div class="bg-gray-50 dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between rounded-t-2xl">
        <h5 class="text-xl font-bold text-gray-900 dark:text-white">SACCO Terms and Conditions</h5>
        <button onclick="this.closest('dialog').close()" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <span class="material-symbols-outlined">close</span>
        </button>
    </div>
    <div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        <div>
            <h6 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-500">groups</span>
                1. Membership
            </h6>
            <p class="text-gray-600 dark:text-gray-400">All members must maintain active status by meeting monthly savings requirements. Membership is open to individuals aged {{ config('sacco.membership.min_age', 18) }}+ with valid identification.</p>
        </div>
        
        <div>
            <h6 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-500">savings</span>
                2. Savings
            </h6>
            <p class="text-gray-600 dark:text-gray-400">Minimum monthly deposit of UGX {{ number_format(config('sacco.savings.min_monthly_deposit', 20000)) }} is recommended. Savings earn {{ config('sacco.savings.interest_rate', 6) }}% annual interest, calculated on daily balance.</p>
        </div>
        
        <div>
            <h6 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-purple-500">account_balance</span>
                3. Loans
            </h6>
            <p class="text-gray-600 dark:text-gray-400">Loans are subject to approval based on savings balance and credit score. Maximum loan amount is {{ config('sacco.loans.max_loan_to_savings_ratio', 3) }}× your savings. Interest rate is {{ config('sacco.loans.default_interest_rate', 12) }}% per annum.</p>
        </div>
        
        <div>
            <h6 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-amber-500">pie_chart</span>
                4. Dividends
            </h6>
            <p class="text-gray-600 dark:text-gray-400">Annual dividends are distributed based on share capital ownership and membership duration. Dividends are paid after the annual general meeting.</p>
        </div>
        
        <div>
            <h6 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-red-500">gavel</span>
                5. Member Obligations
            </h6>
            <p class="text-gray-600 dark:text-gray-400">Members must keep their information up to date, adhere to all SACCO policies, and participate in annual general meetings when possible.</p>
        </div>
        
        <p class="text-sm text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4">For complete terms and any questions, please contact SACCO administration at sacco@tesotunes.com</p>
    </div>
    <div class="bg-gray-50 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end rounded-b-2xl">
        <button onclick="this.closest('dialog').close()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            I Understand
        </button>
    </div>
</dialog>
@endsection

@push('scripts')
<script>
// Member type selection visual feedback
document.querySelectorAll('input[name="member_type"]').forEach(input => {
    input.addEventListener('change', function() {
        document.querySelectorAll('input[name="member_type"] + label .material-symbols-outlined').forEach(icon => {
            icon.classList.remove('text-emerald-600');
            icon.classList.add('text-gray-600', 'dark:text-gray-400');
        });
        if (this.checked) {
            this.nextElementSibling.querySelector('.material-symbols-outlined').classList.remove('text-gray-600', 'dark:text-gray-400');
            this.nextElementSibling.querySelector('.material-symbols-outlined').classList.add('text-emerald-600');
        }
    });
});
</script>
@endpush
