@extends('layouts.admin')

@section('title', '{{ $user->name }} - User Details')

@section('content')

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- User Profile Card -->
        <div class="lg:col-span-1">
            <div class="card">
                <div class="flex flex-col items-center p-6">
                    <div class="avatar size-24">
                        @if($user->avatar)
                            <img class="rounded-full object-cover" src="{{ asset('storage/' . $user->avatar) }}" alt="{{ $user->name }}" onerror="this.src='{{ asset('images/200x200.png') }}'"/>
                        @else
                            <img class="rounded-full" src="{{ asset('images/200x200.png') }}" alt="{{ $user->name }}" />
                        @endif
                    </div>
                    <h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-navy-100">{{ $user->name }}</h3>
                    <p class="text-slate-400">{{ $user->email }}</p>

                    <div class="mt-3 flex space-x-2">
                        <span class="badge {{ $user->is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error' }}">
                            {{ $user->is_active ? 'Active' : 'Inactive' }}
                        </span>
                        <span class="badge {{ $user->role === 'admin' ? 'bg-error/10 text-error' : ($user->role === 'artist' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info') }}">
                            {{ ucfirst($user->role) }}
                        </span>
                    </div>

                    <div class="mt-6 w-full space-y-3">
                        <a href="{{ route('admin.users.edit', $user) }}" class="btn w-full bg-primary text-white hover:bg-primary-focus">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit User
                        </a>

                        @if($user->role === 'artist')
                            <div class="border-t border-slate-200 pt-3 mt-3 dark:border-navy-500">
                                <h5 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 dark:text-navy-200">Quick Actions</h5>
                                <div class="space-y-2">
                                    <a href="{{ route('admin.music.songs.create', ['artist_id' => $user->id]) }}" class="btn w-full border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                        Add Song
                                    </a>
                                    <a href="{{ route('admin.music.albums.index', ['artist_id' => $user->id]) }}" class="btn w-full border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        View Albums
                                    </a>
                                    <a href="{{ route('admin.events.create', ['artist_id' => $user->id]) }}" class="btn w-full border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Add Event
                                    </a>
                                    <a href="{{ route('admin.awards.nominations.index', ['artist_id' => $user->id]) }}" class="btn w-full border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        View Nominations
                                    </a>
                                </div>
                            </div>
                        @endif

                        @if($user->id !== auth()->id())
                            {{-- Impersonate functionality disabled - route not implemented
                            <form method="POST" action="{{ route('admin.users.impersonate', $user) }}" class="w-full">
                                @csrf
                                <button type="submit" class="btn w-full border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Impersonate User
                                </button>
                            </form>
                            --}}

                            {{-- Export data functionality disabled - route not implemented
                            <form method="POST" action="{{ route('admin.users.export-data', $user) }}" class="w-full">
                                @csrf
                                <button type="submit" class="btn w-full border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export Data
                                </button>
                            </form>
                            --}}
                        @endif
                    </div>
                </div>

                <!-- User Details -->
                <div class="border-t border-slate-200 p-6 dark:border-navy-500">
                    <h4 class="mb-4 text-sm font-medium uppercase tracking-wide text-slate-400">Details</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-100">Phone:</span>
                            <span class="text-slate-800 dark:text-navy-50">{{ $user->phone ?: 'N/A' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-100">Country:</span>
                            <span class="text-slate-800 dark:text-navy-50">{{ $user->country ?: 'N/A' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-100">Joined:</span>
                            <span class="text-slate-800 dark:text-navy-50">{{ $user->created_at->format('M j, Y') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-100">Last Login:</span>
                            <span class="text-slate-800 dark:text-navy-50">{{ $user->last_login_at?->diffForHumans() ?: 'Never' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-600 dark:text-navy-100">Email Verified:</span>
                            <span class="text-slate-800 dark:text-navy-50">
                                @if($user->email_verified_at)
                                    <span class="text-success">Yes</span>
                                @else
                                    <span class="text-error">No</span>
                                @endif
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2">
            <!-- Statistics Cards -->
            <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div class="card p-4">
                    <div class="flex items-center space-x-3">
                        <div class="mask is-squircle flex size-10 shrink-0 items-center justify-center bg-info/10 text-info">
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['followers_count']) }}</p>
                            <p class="text-xs text-slate-400">Followers</p>
                        </div>
                    </div>
                </div>

                <div class="card p-4">
                    <div class="flex items-center space-x-3">
                        <div class="mask is-squircle flex size-10 shrink-0 items-center justify-center bg-success/10 text-success">
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['total_plays']) }}</p>
                            <p class="text-xs text-slate-400">Total Plays</p>
                        </div>
                    </div>
                </div>

                <div class="card p-4">
                    <div class="flex items-center space-x-3">
                        <div class="mask is-squircle flex size-10 shrink-0 items-center justify-center bg-warning/10 text-warning">
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['total_downloads']) }}</p>
                            <p class="text-xs text-slate-400">Downloads</p>
                        </div>
                    </div>
                </div>

                <div class="card p-4">
                    <div class="flex items-center space-x-3">
                        <div class="mask is-squircle flex size-10 shrink-0 items-center justify-center bg-secondary/10 text-secondary">
                            <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-lg font-semibold text-slate-700 dark:text-navy-100">${{ number_format($stats['total_payments'], 2) }}</p>
                            <p class="text-xs text-slate-400">Payments</p>
                        </div>
                    </div>
                </div>
            </div>

            @if($artistData)
            <!-- Artist Statistics -->
            <div class="mb-6 card p-6">
                <h3 class="mb-4 text-lg font-medium text-slate-700 dark:text-navy-100">Artist Statistics</h3>
                <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div class="text-center">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($artistData['total_songs']) }}</p>
                        <p class="text-xs text-slate-400 mt-1">Total Songs</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($artistData['total_albums']) }}</p>
                        <p class="text-xs text-slate-400 mt-1">Albums</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($artistData['total_streams']) }}</p>
                        <p class="text-xs text-slate-400 mt-1">Total Streams</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($artistData['followers']) }}</p>
                        <p class="text-xs text-slate-400 mt-1">Artist Followers</p>
                    </div>
                </div>
            </div>
            @endif

            <!-- Tabs -->
            <div class="card" x-data="{ activeTab: 'activity' }">
                <div class="border-b border-slate-200 dark:border-navy-500">
                    <div class="tabs-list flex overflow-x-auto">
                        <button @click="activeTab = 'activity'" :class="activeTab === 'activity' ? 'border-primary text-primary dark:border-accent dark:text-accent-light' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100'"
                                class="btn shrink-0 rounded-none border-b-2 px-4 py-2 font-medium">
                            Activity
                        </button>
                        @if($artistData)
                        <button @click="activeTab = 'songs'" :class="activeTab === 'songs' ? 'border-primary text-primary dark:border-accent dark:text-accent-light' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100'"
                                class="btn shrink-0 rounded-none border-b-2 px-4 py-2 font-medium">
                            Uploaded Songs
                        </button>
                        <button @click="activeTab = 'albums'" :class="activeTab === 'albums' ? 'border-primary text-primary dark:border-accent dark:text-accent-light' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100'"
                                class="btn shrink-0 rounded-none border-b-2 px-4 py-2 font-medium">
                            Albums
                        </button>
                        @endif
                        <button @click="activeTab = 'playlists'" :class="activeTab === 'playlists' ? 'border-primary text-primary dark:border-accent dark:text-accent-light' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100'"
                                class="btn shrink-0 rounded-none border-b-2 px-4 py-2 font-medium">
                            Playlists
                        </button>
                        <button @click="activeTab = 'listening'" :class="activeTab === 'listening' ? 'border-primary text-primary dark:border-accent dark:text-accent-light' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100'"
                                class="btn shrink-0 rounded-none border-b-2 px-4 py-2 font-medium">
                            Listening History
                        </button>
                        <button @click="activeTab = 'payments'" :class="activeTab === 'payments' ? 'border-primary text-primary dark:border-accent dark:text-accent-light' : 'border-transparent hover:text-slate-800 focus:text-slate-800 dark:hover:text-navy-100 dark:focus:text-navy-100'"
                                class="btn shrink-0 rounded-none border-b-2 px-4 py-2 font-medium">
                            Payments
                        </button>
                    </div>
                </div>

                <!-- Activity Tab -->
                <div x-show="activeTab === 'activity'" class="tab-content p-4">
                    <div class="space-y-4">
                        @forelse($recentActivity as $activity)
                            <div class="flex items-start space-x-3">
                                <div class="mask is-squircle flex size-8 shrink-0 items-center justify-center bg-slate-200 dark:bg-navy-500">
                                    <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2L3 7v11h14V7l-7-5z"/>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm text-slate-700 dark:text-navy-100">
                                        {{ ucfirst(str_replace('_', ' ', $activity->type)) }}
                                        @if($activity->subject)
                                            <span class="font-medium">{{ $activity->subject->title ?? $activity->subject->name ?? '' }}</span>
                                        @endif
                                    </p>
                                    <p class="text-xs text-slate-400">{{ $activity->created_at->diffForHumans() }}</p>
                                </div>
                            </div>
                        @empty
                            <p class="text-center text-slate-400">No recent activity</p>
                        @endforelse
                    </div>
                </div>

                @if($artistData)
                <!-- Uploaded Songs Tab -->
                <div x-show="activeTab === 'songs'" class="tab-content p-4">
                    <div class="space-y-3">
                        @forelse($artistData['recent_uploads'] as $song)
                            <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-600">
                                <div class="mask is-squircle size-12 bg-slate-200 dark:bg-navy-500">
                                    @if($song->artwork_url)
                                        <img src="{{ $song->artwork_url }}" alt="{{ $song->title }}" class="size-full object-cover" />
                                    @else
                                        <div class="flex size-full items-center justify-center text-slate-400">
                                            <svg class="size-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                                            </svg>
                                        </div>
                                    @endif
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-medium text-slate-700 dark:text-navy-100 truncate">{{ $song->title }}</p>
                                    <p class="text-xs text-slate-400">
                                        @if($song->album)
                                            {{ $song->album->title }} •
                                        @endif
                                        {{ number_format($song->play_count) }} plays • {{ $song->created_at->diffForHumans() }}
                                    </p>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="badge text-xs {{ $song->status === 'published' ? 'bg-success/10 text-success' : ($song->status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-slate-200 text-slate-600') }}">
                                        {{ ucfirst($song->status) }}
                                    </span>
                                    <a href="{{ route('admin.music.songs.show', $song) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20">
                                        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        @empty
                            <p class="text-center text-slate-400">No uploaded songs</p>
                        @endforelse
                    </div>
                </div>

                <!-- Albums Tab -->
                <div x-show="activeTab === 'albums'" class="tab-content p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @forelse($artistData['recent_albums'] as $album)
                            <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-600">
                                <div class="mask is-squircle size-16 bg-slate-200 dark:bg-navy-500">
                                    @if($album->artwork_url)
                                        <img src="{{ $album->artwork_url }}" alt="{{ $album->title }}" class="size-full object-cover" />
                                    @else
                                        <div class="flex size-full items-center justify-center text-slate-400">
                                            <svg class="size-8" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                                            </svg>
                                        </div>
                                    @endif
                                </div>
                                <div class="flex-1">
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $album->title }}</p>
                                    <p class="text-xs text-slate-400">{{ $album->songs_count }} songs • {{ $album->created_at->format('M Y') }}</p>
                                </div>
                                <a href="{{ route('admin.music.albums.show', $album) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20">
                                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                </a>
                            </div>
                        @empty
                            <p class="text-center text-slate-400 col-span-2">No albums created</p>
                        @endforelse
                    </div>
                </div>
                @endif

                <!-- Playlists Tab -->
                <div x-show="activeTab === 'playlists'" class="tab-content p-4">
                    <div class="space-y-4">
                        @forelse($user->playlists as $playlist)
                            <div class="flex items-center space-x-3">
                                <div class="mask is-squircle size-12 bg-slate-200 dark:bg-navy-500">
                                    @if($playlist->cover_image)
                                        <img src="{{ Storage::url($playlist->cover_image) }}" alt="{{ $playlist->title }}" class="size-full object-cover" />
                                    @else
                                        <div class="flex size-full items-center justify-center text-slate-400">
                                            <svg class="size-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        </div>
                                    @endif
                                </div>
                                <div class="flex-1">
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $playlist->title }}</p>
                                    <p class="text-xs text-slate-400">{{ $playlist->songs()->count() }} songs • Created {{ $playlist->created_at->diffForHumans() }}</p>
                                </div>
                                <div class="flex space-x-1">
                                    @if($playlist->is_public)
                                        <span class="badge bg-success/10 text-success text-xs">Public</span>
                                    @endif
                                    @if($playlist->is_collaborative)
                                        <span class="badge bg-info/10 text-info text-xs">Collaborative</span>
                                    @endif
                                </div>
                            </div>
                        @empty
                            <p class="text-center text-slate-400">No playlists created</p>
                        @endforelse
                    </div>
                </div>

                <!-- Listening History Tab -->
                <div x-show="activeTab === 'listening'" class="tab-content p-4">
                    <div class="space-y-3">
                        @forelse($user->playHistory->take(15) as $play)
                            <div class="flex items-center space-x-3">
                                <div class="mask is-squircle size-10 bg-slate-200 dark:bg-navy-500">
                                    @if($play->song->cover_image)
                                        <img src="{{ Storage::url($play->song->cover_image) }}" alt="{{ $play->song->title }}" class="size-full object-cover" />
                                    @else
                                        <div class="flex size-full items-center justify-center text-slate-400">
                                            <svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                                            </svg>
                                        </div>
                                    @endif
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-slate-700 dark:text-navy-100">{{ $play->song->title }}</p>
                                    <p class="text-xs text-slate-400">{{ $play->song->artist->name }} • {{ $play->played_at->diffForHumans() }}</p>
                                </div>
                                <div class="text-right">
                                    @if($play->completed)
                                        <span class="badge bg-success/10 text-success text-xs">Completed</span>
                                    @else
                                        <span class="badge bg-warning/10 text-warning text-xs">Partial</span>
                                    @endif
                                </div>
                            </div>
                        @empty
                            <p class="text-center text-slate-400">No listening history</p>
                        @endforelse
                    </div>
                </div>

                <!-- Payments Tab -->
                <div x-show="activeTab === 'payments'" class="tab-content p-4">
                    <div class="space-y-4">
                        @forelse($user->payments as $payment)
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="mask is-squircle flex size-10 items-center justify-center {{ $payment->status === 'completed' ? 'bg-success/10 text-success' : ($payment->status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error') }}">
                                        <svg class="size-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-slate-700 dark:text-navy-100">
                                            {{ $payment->subscriptionPlan->name ?? 'Payment' }}
                                        </p>
                                        <p class="text-xs text-slate-400">{{ $payment->payment_method }} • {{ $payment->created_at->format('M j, Y') }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $payment->currency }} {{ number_format($payment->amount) }}</p>
                                    <span class="badge rounded-full text-xs {{ $payment->status === 'completed' ? 'bg-success/10 text-success' : ($payment->status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error') }}">
                                        {{ ucfirst($payment->status) }}
                                    </span>
                                </div>
                            </div>
                        @empty
                            <p class="text-center text-slate-400">No payment history</p>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection