@extends('layouts.admin')

@section('title', 'Artists Management')

@section('content')
    <x-slot name="breadcrumbs">
        [{ 'name': 'Dashboard', 'url': '{{ route("admin.dashboard") }}' }, { 'name': 'Music', 'url': '#' }, { 'name': 'Artists' }]
    </x-slot>

    <!-- Header with Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Artists</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($artists->total() ?? \App\Models\Artist::count()) }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Verified</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($verifiedArtists) }}</p>
                </div>
                <div class="size-11 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.586-4.586L16 8l-4.586 4.586a2 2 0 001.414 3.414L16 12l4.586 4.586A2 2 0 0023.414 15L20 12l3.414-3.414a2 2 0 00-1.414-3.414L16 8z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Active Artists</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($activeArtists) }}</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Pending Verification</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($pendingVerification) }}</p>
                </div>
                <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="card mb-6">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Artists Management</h3>
                <a href="{{ route('admin.music.artists.create') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Artist
                </a>
            </div>
        </div>

        <form method="GET" class="p-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <!-- Search -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Search</label>
                    <input name="search" type="text" placeholder="Artist name, email..."
                           value="{{ request('search') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Status Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Status</label>
                    <select name="status" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Status</option>
                        <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                        <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactive</option>
                        <option value="suspended" {{ request('status') === 'suspended' ? 'selected' : '' }}>Suspended</option>
                    </select>
                </div>

                <!-- Verification Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Verification</label>
                    <select name="verification" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All</option>
                        <option value="verified" {{ request('verification') === 'verified' ? 'selected' : '' }}>Verified</option>
                        <option value="pending" {{ request('verification') === 'pending' ? 'selected' : '' }}>Pending</option>
                        <option value="unverified" {{ request('verification') === 'unverified' ? 'selected' : '' }}>Unverified</option>
                    </select>
                </div>

                <!-- Country Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Country</label>
                    <select name="country" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Countries</option>
                        @foreach($countries as $country)
                            <option value="{{ $country }}" {{ request('country') === $country ? 'selected' : '' }}>
                                {{ $country }}
                            </option>
                        @endforeach
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                <a href="{{ route('admin.music.artists.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Clear
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Apply Filters
                </button>
            </div>
        </form>
    </div>

    <!-- Artists Table -->
    <div class="card">
        <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
            <table class="is-hoverable w-full text-left">
                <thead>
                    <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Artist
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Contact
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Stats
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Earnings
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Joined
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($artists ?? [] as $artist)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- Artist Info -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-3">
                                    <div class="avatar size-12">
                                        <img class="rounded-full" src="{{ $artist->avatar_url }}" alt="{{ $artist->name }}" />
                                    </div>
                                    <div>
                                        <div class="flex items-center space-x-2">
                                            <p class="font-medium text-slate-700 dark:text-navy-100">{{ $artist->name }}</p>
                                            @if($artist->verified)
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 12l2 2 4-4m5.586-4.586L16 8l-4.586 4.586a2 2 0 001.414 3.414L16 12l4.586 4.586A2 2 0 0023.414 15L20 12l3.414-3.414a2 2 0 00-1.414-3.414L16 8z" />
                                                </svg>
                                            @endif
                                        </div>
                                        <p class="text-xs text-slate-400">
                                            @if($artist->songs_count > 0)
                                                {{ $artist->songs_count }} {{ $artist->songs_count == 1 ? 'song' : 'songs' }}
                                            @else
                                                No songs yet
                                            @endif
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <!-- Contact -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="text-sm text-slate-700 dark:text-navy-100">{{ $artist->email }}</p>
                                    @if($artist->phone)
                                        <p class="text-xs text-slate-400">{{ $artist->phone }}</p>
                                    @endif
                                    @if($artist->country)
                                        <p class="text-xs text-slate-400">{{ $artist->country }}</p>
                                    @endif
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex flex-col space-y-1">
                                    <!-- Account Status -->
                                    <span class="badge rounded-full {{ $artist->status === 'active' ? 'bg-success/10 text-success' : ($artist->status === 'suspended' ? 'bg-error/10 text-error' : 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100') }}">
                                        {{ ucfirst($artist->status) }}
                                    </span>
                                    
                                    <!-- Verification Status (Dynamic) -->
                                    @if($artist->verification_status === 'verified' || $artist->is_verified)
                                        <span class="badge rounded-full bg-primary/10 text-primary text-xs">Verified</span>
                                    @elseif($artist->verification_status === 'pending')
                                        <span class="badge rounded-full bg-warning/10 text-warning text-xs">Pending</span>
                                    @elseif($artist->verification_status === 'rejected')
                                        <span class="badge rounded-full bg-error/10 text-error text-xs">Rejected</span>
                                    @else
                                        <span class="badge rounded-full bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100 text-xs">Unverified</span>
                                    @endif
                                </div>
                            </td>

                            <!-- Stats -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="text-xs space-y-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-500">Songs:</span>
                                        <span class="font-medium text-slate-700 dark:text-navy-100">{{ number_format($artist->songs_count) }}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-500">Albums:</span>
                                        <span class="font-medium text-slate-700 dark:text-navy-100">{{ number_format($artist->albums_count) }}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-slate-500">Followers:</span>
                                        <span class="font-medium text-slate-700 dark:text-navy-100">{{ number_format($artist->followers_count) }}</span>
                                    </div>
                                </div>
                            </td>

                            <!-- Earnings -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="text-sm">
                                    <p class="font-medium text-slate-700 dark:text-navy-100">
                                        ${{ number_format($artist->total_earnings, 2) }}
                                    </p>
                                    <p class="text-xs text-slate-400">
                                        This Month: ${{ number_format($artist->monthly_earnings, 2) }}
                                    </p>
                                </div>
                            </td>

                            <!-- Joined Date -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-100 lg:px-5">
                                {{ $artist->created_at->format('M j, Y') }}
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-2">
                                    <a href="{{ route('admin.music.artists.show', $artist) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>

                                    <a href="{{ route('admin.music.artists.edit', $artist) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>

                                    @if(!$artist->is_verified && in_array($artist->verification_status, ['pending', null]))
                                        <form method="POST" action="{{ route('admin.music.artists.verify', $artist) }}" class="inline" x-data>
                                            @csrf
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                    onclick="return confirm('Are you sure you want to verify this artist?')"
                                                    title="Quick Verify">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                        </form>
                                    @endif

                                    <!-- Link to Full Verification Page -->
                                    @if($artist->user_id && $artist->user)
                                        <a href="{{ route('admin.artist-verification.show', $artist->user->username ?? $artist->slug) }}" 
                                           class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                           title="Manage Verification & KYC">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </a>
                                    @endif

                                    <form method="POST" action="{{ route('admin.music.artists.destroy', $artist) }}" class="inline">
                                        @csrf
                                        <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                onclick="return confirm('Are you sure you want to {{ $artist->status === 'active' ? 'suspend' : 'activate' }} this artist?')">
                                            @if($artist->status === 'active')
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                                </svg>
                                            @else
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            @endif
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-4 py-12 text-center">
                                <div class="flex flex-col items-center space-y-4">
                                    <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-500">
                                        <svg class="size-8 text-slate-400 dark:text-navy-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div class="text-center">
                                        <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">No Artists Found</h3>
                                        <p class="mt-1 text-sm text-slate-400 dark:text-navy-300">
                                            @if(request()->hasAny(['search', 'verification', 'status']))
                                                No artists match your current search criteria. Try adjusting your filters.
                                            @else
                                                No artists have joined your music platform yet.
                                            @endif
                                        </p>
                                    </div>
                                    <div class="flex space-x-3">
                                        @if(request()->hasAny(['search', 'verification', 'status']))
                                            <a href="{{ route('admin.music.artists.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                                                Clear Filters
                                            </a>
                                        @endif
                                        <a href="{{ route('admin.music.artists.create') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Artist
                                        </a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if(isset($artists) && $artists->hasPages())
            <div class="flex items-center justify-between px-4 py-4">
                <div class="text-sm text-slate-400">
                    Showing {{ $artists->firstItem() }}-{{ $artists->lastItem() }} of {{ $artists->total() }} artists
                </div>
                {{ $artists->links() }}
            </div>
        @endif
    </div>
@endsection