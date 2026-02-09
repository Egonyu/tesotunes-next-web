@extends('layouts.app')

@section('title', 'My Profile')

@section('left-sidebar')
    @include('frontend.partials.user-left-sidebar')
@endsection

@push('styles')
<style>
    /* Light mode glass styles */
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.06);
    }
    /* Dark mode glass styles */
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dark .glass-card {
        background: rgba(30, 35, 45, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
</style>
@endpush

@section('content')
<!-- Main Profile Content -->
<div class="max-w-[1600px] mx-auto space-y-8">
    <!-- Success Message -->
    @if(session('success'))
    <div class="glass-card rounded-xl p-4 border-l-4 border-green-500">
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-green-500">check_circle</span>
            <p class="text-green-700 dark:text-green-400 font-medium">{{ session('success') }}</p>
        </div>
    </div>
    @endif

    <!-- Header Section with Profile Banner -->
    <div class="glass-panel rounded-2xl p-8 relative overflow-hidden group">
        <div class="absolute -right-20 -top-20 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl group-hover:bg-brand-green/20 transition-all duration-700"></div>
        <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-start gap-8">
                <!-- Avatar Section -->
                <div class="flex-shrink-0">
                    <div class="relative">
                        <div class="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-700 shadow-xl">
                            @if($user->avatar)
                                <img src="{{ asset('storage/' . $user->avatar) }}" alt="{{ $user->name }}" class="w-full h-full object-cover">
                            @else
                                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-green/20 to-brand-purple/20">
                                    <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl">person</span>
                                </div>
                            @endif
                        </div>
                        <div class="absolute -bottom-2 -right-2 p-2 bg-brand-green rounded-lg shadow-lg">
                            <span class="material-symbols-outlined text-white text-sm">verified</span>
                        </div>
                    </div>
                </div>

                <!-- Profile Info -->
                <div class="flex-1">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{{ $user->name }}</h1>
                            <p class="text-gray-500 dark:text-text-secondary flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">mail</span>
                                {{ $user->email }}
                            </p>
                        </div>
                        <div class="flex gap-3">
                            <a href="{{ route('frontend.profile.edit') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30">
                                <span class="material-symbols-outlined text-lg">edit</span>
                                Edit Profile
                            </a>
                            <a href="{{ route('frontend.profile.settings') }}" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-all border border-gray-200 dark:border-gray-600">
                                <span class="material-symbols-outlined text-lg">settings</span>
                                Settings
                            </a>
                        </div>
                    </div>

                    @if($user->bio)
                        <p class="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl">{{ $user->bio }}</p>
                    @else
                        <p class="text-gray-400 dark:text-gray-500 italic mb-4">No bio added yet. <a href="{{ route('frontend.profile.edit') }}" class="text-brand-green hover:underline">Add one now</a></p>
                    @endif

                    <!-- Member Info Badges -->
                    <div class="flex flex-wrap gap-2">
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-medium">
                            <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                            Joined {{ $user->created_at->format('F Y') }}
                        </span>
                        @if($user->country)
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-medium">
                            <span class="material-symbols-outlined text-[14px]">location_on</span>
                            {{ $user->country }}
                        </span>
                        @endif
                        @if($user->phone)
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-medium">
                            <span class="material-symbols-outlined text-[14px]">phone</span>
                            {{ $user->phone }}
                        </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Playlists -->
        <div class="glass-card rounded-xl p-5 hover:border-brand-green/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-brand-green">queue_music</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-brand-green/20 rounded-lg text-brand-green">
                    <span class="material-symbols-outlined">playlist_play</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Playlists</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ $user->playlists()->count() }}</h3>
            <a href="{{ route('frontend.playlists.index') }}" class="text-[10px] text-brand-green hover:underline mt-2 inline-block">
                View All →
            </a>
        </div>

        <!-- Followers -->
        <div class="glass-card rounded-xl p-5 hover:border-brand-blue/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-brand-blue">group</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-brand-blue/20 rounded-lg text-brand-blue">
                    <span class="material-symbols-outlined">people</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Followers</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ $user->followers()->count() }}</h3>
            <p class="text-[10px] text-gray-400 dark:text-text-secondary mt-2">
                People following you
            </p>
        </div>

        <!-- Following -->
        <div class="glass-card rounded-xl p-5 hover:border-brand-purple/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-brand-purple">person_add</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-brand-purple/20 rounded-lg text-brand-purple">
                    <span class="material-symbols-outlined">person_add</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Following</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ $user->following()->count() }}</h3>
            <p class="text-[10px] text-gray-400 dark:text-text-secondary mt-2">
                Artists & users
            </p>
        </div>

        <!-- Tracks Played -->
        <div class="glass-card rounded-xl p-5 hover:border-orange-400/30 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3 opacity-10">
                <span class="material-symbols-outlined text-6xl text-orange-500">headphones</span>
            </div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                    <span class="material-symbols-outlined">music_note</span>
                </div>
            </div>
            <p class="text-gray-500 dark:text-text-secondary text-sm font-medium">Tracks Played</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ $user->playHistory()->count() }}</h3>
            <a href="{{ route('frontend.player.history') }}" class="text-[10px] text-orange-500 hover:underline mt-2 inline-block">
                View History →
            </a>
        </div>
    </div>

    <!-- Content Grid -->
    <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main Content - Contact & Account Info -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Contact Information -->
            <div class="glass-panel rounded-2xl p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-green">contact_page</span>
                        Contact Information
                    </h2>
                    <a href="{{ route('frontend.profile.edit') }}" class="text-brand-green hover:text-green-600 text-sm font-medium flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">edit</span>
                        Edit
                    </a>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-gray-500 dark:text-text-secondary text-xs font-medium mb-1 uppercase tracking-wide">Email Address</label>
                        <p class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                            <span class="material-symbols-outlined text-gray-400 text-sm">mail</span>
                            {{ $user->email }}
                        </p>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-gray-500 dark:text-text-secondary text-xs font-medium mb-1 uppercase tracking-wide">Phone Number</label>
                        <p class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                            <span class="material-symbols-outlined text-gray-400 text-sm">phone</span>
                            {{ $user->phone ?: 'Not provided' }}
                        </p>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-gray-500 dark:text-text-secondary text-xs font-medium mb-1 uppercase tracking-wide">Country</label>
                        <p class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                            <span class="material-symbols-outlined text-gray-400 text-sm">location_on</span>
                            {{ $user->country ?: 'Not provided' }}
                        </p>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        <label class="block text-gray-500 dark:text-text-secondary text-xs font-medium mb-1 uppercase tracking-wide">Member Since</label>
                        <p class="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                            <span class="material-symbols-outlined text-gray-400 text-sm">calendar_today</span>
                            {{ $user->created_at->format('F j, Y') }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Account Activity -->
            <div class="glass-panel rounded-2xl p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <span class="material-symbols-outlined text-brand-purple">analytics</span>
                    Account Activity
                </h2>

                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-green-500/20 rounded-lg">
                                <span class="material-symbols-outlined text-green-500">check_circle</span>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900 dark:text-white">Email Verified</p>
                                <p class="text-xs text-gray-500 dark:text-text-secondary">Your email is confirmed</p>
                            </div>
                        </div>
                        <span class="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full">Active</span>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-blue-500/20 rounded-lg">
                                <span class="material-symbols-outlined text-blue-500">devices</span>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900 dark:text-white">Last Login</p>
                                <p class="text-xs text-gray-500 dark:text-text-secondary">{{ $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Recently' }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div class="flex items-center gap-3">
                            <div class="p-2 bg-purple-500/20 rounded-lg">
                                <span class="material-symbols-outlined text-purple-500">shield</span>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900 dark:text-white">Account Security</p>
                                <p class="text-xs text-gray-500 dark:text-text-secondary">Password protected</p>
                            </div>
                        </div>
                        <a href="{{ route('frontend.profile.settings') }}" class="text-brand-green hover:text-green-600 text-xs font-medium">
                            Manage →
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="glass-panel rounded-2xl p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-brand-green">flash_on</span>
                    Quick Actions
                </h3>
                <div class="space-y-3">
                    <a href="{{ route('frontend.profile.edit') }}"
                       class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                        <div class="p-2 bg-brand-green/20 rounded-lg group-hover:bg-brand-green/30 transition-colors">
                            <span class="material-symbols-outlined text-brand-green">edit</span>
                        </div>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Edit Profile</span>
                    </a>

                    <a href="{{ route('frontend.profile.settings') }}"
                       class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                        <div class="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                            <span class="material-symbols-outlined text-blue-500">settings</span>
                        </div>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Account Settings</span>
                    </a>

                    <a href="{{ route('frontend.player.downloads') }}"
                       class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                        <div class="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <span class="material-symbols-outlined text-purple-500">download</span>
                        </div>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Downloaded Music</span>
                    </a>

                    <a href="{{ route('frontend.player.history') }}"
                       class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                        <div class="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                            <span class="material-symbols-outlined text-orange-500">history</span>
                        </div>
                        <span class="text-gray-700 dark:text-gray-300 font-medium">Listening History</span>
                    </a>
                </div>
            </div>

            <!-- Account Security Card -->
            <div class="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-brand-purple/20 via-brand-blue/20 to-brand-green/20 dark:from-brand-purple/30 dark:via-brand-blue/30 dark:to-brand-green/30 border border-brand-purple/20">
                <div class="absolute -right-8 -bottom-8 opacity-10">
                    <span class="material-symbols-outlined text-[120px] text-brand-purple">security</span>
                </div>
                <div class="relative z-10">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-brand-purple">shield</span>
                        Account Security
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-green-500 text-sm mt-0.5">verified</span>
                            <div>
                                <p class="text-gray-900 dark:text-white text-sm font-medium">Account Status</p>
                                <p class="text-gray-500 dark:text-gray-400 text-xs">Secure and verified</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <span class="material-symbols-outlined text-blue-500 text-sm mt-0.5">lock</span>
                            <div>
                                <p class="text-gray-900 dark:text-white text-sm font-medium">Privacy Settings</p>
                                <p class="text-gray-500 dark:text-gray-400 text-xs">Manage your preferences</p>
                            </div>
                        </div>
                    </div>

                    <a href="{{ route('frontend.profile.settings') }}" class="inline-flex items-center gap-1 mt-4 text-brand-purple dark:text-brand-purple hover:text-purple-700 dark:hover:text-purple-400 text-sm font-semibold transition-colors">
                        Security Settings
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>
            </div>

            <!-- Credits Card -->
            <div class="glass-panel rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="material-symbols-outlined text-yellow-500">paid</span>
                        Credits
                    </h3>
                    <a href="{{ route('frontend.credits.index') }}" class="text-brand-green hover:text-green-600 text-xs font-bold flex items-center gap-1">
                        VIEW ALL <span class="material-symbols-outlined text-xs">arrow_forward</span>
                    </a>
                </div>
                <div class="text-center py-4">
                    <p class="text-4xl font-bold text-gray-900 dark:text-white">{{ number_format(auth()->user()->credits_balance ?? 0) }}</p>
                    <p class="text-gray-500 dark:text-text-secondary text-sm mt-1">Available Credits</p>
                </div>
                <a href="{{ route('frontend.credits.earn') }}" class="block w-full text-center px-4 py-2.5 bg-brand-green hover:bg-green-600 text-white font-semibold rounded-lg transition-all">
                    Earn More Credits
                </a>
            </div>
        </div>
    </div>
</div>
@endsection
