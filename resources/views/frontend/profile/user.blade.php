@extends('layouts.app')

@section('title', $user->display_name ?? $user->name . ' - Profile')

@section('left-sidebar')
    @include('frontend.partials.user-left-sidebar')
@endsection

@push('styles')
<style>
    /* Light mode styles */
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
    /* Dark mode styles */
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .dark .glass-card {
        background: rgba(30, 35, 45, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .stat-glow {
        box-shadow: 0 4px 20px -5px rgba(var(--brand-green-rgb, 34, 197, 94), 0.3);
    }
</style>
@endpush

@section('content')
<div class="max-w-[1400px] mx-auto space-y-6" x-data="userProfile()">

    {{-- Profile Hero Section --}}
    <div class="glass-panel rounded-2xl overflow-hidden relative">
        {{-- Cover Image / Gradient Background --}}
        <div class="h-48 md:h-64 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 relative overflow-hidden">
            @if($user->banner)
                <img src="{{ Storage::url($user->banner) }}" 
                     alt="Cover" 
                     class="absolute inset-0 w-full h-full object-cover opacity-50">
            @endif
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            {{-- Decorative elements --}}
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div class="absolute -left-20 -bottom-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        {{-- Profile Info Overlay --}}
        <div class="relative px-6 md:px-8 pb-6">
            <div class="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
                {{-- Avatar --}}
                <div class="relative">
                    <div class="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-2xl">
                        <img src="{{ $user->avatar_url ?? '/images/default-avatar.svg' }}" 
                             alt="{{ $user->display_name ?? $user->name }}"
                             class="w-full h-full object-cover">
                    </div>
                    @if($user->is_premium)
                        <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <span class="material-symbols-outlined text-white text-sm">star</span>
                        </div>
                    @endif
                </div>

                {{-- User Details --}}
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ $user->is_artist ? 'Artist' : 'Music Lover' }}</span>
                        @if($user->is_verified)
                            <span class="material-symbols-outlined text-brand-green text-sm">verified</span>
                        @endif
                    </div>
                    <h1 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {{ $user->display_name ?? $user->name }}
                    </h1>
                    @if($user->username)
                        <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">
                            @<span>{{ $user->username }}</span>
                        </p>
                    @endif
                    @if($user->bio)
                        <p class="text-gray-600 dark:text-gray-300 text-sm max-w-xl line-clamp-2">
                            {{ $user->bio }}
                        </p>
                    @endif
                    <div class="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                        @if($user->country)
                            <span class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">location_on</span>
                                {{ $user->country }}
                            </span>
                        @endif
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">calendar_today</span>
                            Joined {{ $user->created_at->format('M Y') }}
                        </span>
                    </div>
                </div>

                {{-- Action Buttons --}}
                <div class="flex items-center gap-3 mt-4 md:mt-0">
                    @auth
                        @if(auth()->id() !== $user->id)
                            <button 
                                @click="toggleFollow()"
                                :class="isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-brand-green text-white'"
                                class="px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:scale-105 shadow-lg"
                            >
                                <span x-text="isFollowing ? 'Following' : 'Follow'"></span>
                            </button>
                            <button class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <span class="material-symbols-outlined">mail</span>
                            </button>
                        @endif
                    @endauth
                    <button 
                        @click="shareProfile()"
                        class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span class="material-symbols-outlined">share</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    {{-- Stats Cards Row --}}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {{-- Followers --}}
        <div class="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform cursor-pointer group">
            <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">group</span>
                </div>
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {{ number_format($stats['followers_count'] ?? 0) }}
            </div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Followers</div>
        </div>

        {{-- Following --}}
        <div class="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform cursor-pointer group">
            <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">person_add</span>
                </div>
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {{ number_format($stats['following_count'] ?? 0) }}
            </div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Following</div>
        </div>

        {{-- Playlists --}}
        <div class="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform cursor-pointer group">
            <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400">queue_music</span>
                </div>
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {{ number_format($stats['playlists_count'] ?? 0) }}
            </div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Public Playlists</div>
        </div>

        {{-- Liked Songs --}}
        <div class="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform cursor-pointer group">
            <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-pink-600 dark:text-pink-400">favorite</span>
                </div>
            </div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {{ number_format($stats['likes_count'] ?? 0) }}
            </div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Liked Songs</div>
        </div>
    </div>

    {{-- Content Grid --}}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {{-- Main Content (2/3) --}}
        <div class="lg:col-span-2 space-y-6">
            {{-- Public Playlists Section --}}
            @if(isset($recentPlaylists) && $recentPlaylists->count() > 0)
            <div class="glass-panel rounded-2xl overflow-hidden">
                <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <span class="material-symbols-outlined text-white text-lg">queue_music</span>
                        </div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Public Playlists</h2>
                    </div>
                </div>
                <div class="p-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        @foreach($recentPlaylists as $playlist)
                        <a href="{{ route('frontend.playlists.show', $playlist) }}" class="group">
                            <div class="glass-card rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all hover:scale-[1.02]">
                                <div class="flex items-center gap-4">
                                    {{-- Playlist Cover --}}
                                    <div class="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        @if($playlist->cover_image)
                                            <img src="{{ Storage::url($playlist->cover_image) }}" alt="{{ $playlist->name }}" class="w-full h-full object-cover">
                                        @else
                                            <span class="material-symbols-outlined text-white text-2xl">queue_music</span>
                                        @endif
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-green transition-colors">
                                            {{ $playlist->name }}
                                        </h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            {{ $playlist->songs_count ?? $playlist->songs->count() }} songs
                                        </p>
                                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {{ $playlist->created_at->diffForHumans() }}
                                        </p>
                                    </div>
                                    <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div class="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center shadow-lg">
                                            <span class="material-symbols-outlined text-black">play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                        @endforeach
                    </div>
                </div>
            </div>
            @else
            {{-- Empty Playlists State --}}
            <div class="glass-panel rounded-2xl p-12 text-center">
                <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <span class="material-symbols-outlined text-gray-400 text-4xl">queue_music</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Public Playlists</h3>
                <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    {{ $user->display_name ?? $user->name }} hasn't shared any public playlists yet.
                </p>
            </div>
            @endif

            {{-- Recently Liked Songs (if available) --}}
            @if(isset($recentlyLiked) && $recentlyLiked->count() > 0)
            <div class="glass-panel rounded-2xl overflow-hidden">
                <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <span class="material-symbols-outlined text-white text-lg">favorite</span>
                        </div>
                        <h2 class="text-lg font-bold text-gray-900 dark:text-white">Recently Liked</h2>
                    </div>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-800">
                    @foreach($recentlyLiked->take(5) as $song)
                    <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <img src="{{ $song->cover_url ?? '/images/default-cover.jpg' }}" 
                                     alt="{{ $song->title }}"
                                     class="w-full h-full object-cover">
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span class="material-symbols-outlined text-white">play_arrow</span>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-gray-900 dark:text-white truncate">{{ $song->title }}</h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ $song->artist->stage_name ?? 'Unknown Artist' }}</p>
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
            @endif
        </div>

        {{-- Sidebar (1/3) --}}
        <div class="space-y-6">
            {{-- About Card --}}
            <div class="glass-panel rounded-2xl p-5">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">About</h3>
                <div class="space-y-4">
                    @if($user->bio)
                        <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {{ $user->bio }}
                        </p>
                    @else
                        <p class="text-gray-500 dark:text-gray-400 text-sm italic">
                            No bio available
                        </p>
                    @endif

                    <div class="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        @if($user->country)
                        <div class="flex items-center gap-3 text-sm">
                            <span class="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                            <span class="text-gray-600 dark:text-gray-300">{{ $user->country }}</span>
                        </div>
                        @endif
                        <div class="flex items-center gap-3 text-sm">
                            <span class="material-symbols-outlined text-gray-400 text-lg">calendar_today</span>
                            <span class="text-gray-600 dark:text-gray-300">Joined {{ $user->created_at->format('F j, Y') }}</span>
                        </div>
                        @if($user->is_premium)
                        <div class="flex items-center gap-3 text-sm">
                            <span class="material-symbols-outlined text-amber-500 text-lg">workspace_premium</span>
                            <span class="text-amber-600 dark:text-amber-400 font-medium">Premium Member</span>
                        </div>
                        @endif
                    </div>
                </div>
            </div>

            {{-- Follow Suggestions (if logged in and viewing another user) --}}
            @auth
                @if(auth()->id() !== $user->id && isset($mutualFollowers) && $mutualFollowers->count() > 0)
                <div class="glass-panel rounded-2xl p-5">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Mutual Connections</h3>
                    <div class="space-y-3">
                        @foreach($mutualFollowers->take(5) as $mutual)
                        <a href="{{ route('frontend.profile.user', $mutual) }}" class="flex items-center gap-3 group">
                            <img src="{{ $mutual->avatar_url ?? '/images/default-avatar.svg' }}" 
                                 alt="{{ $mutual->name }}"
                                 class="w-10 h-10 rounded-full object-cover">
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-brand-green transition-colors">
                                    {{ $mutual->display_name ?? $mutual->name }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ $mutual->followers_count ?? 0 }} followers
                                </p>
                            </div>
                        </a>
                        @endforeach
                    </div>
                </div>
                @endif
            @endauth

            {{-- Share Profile Card --}}
            <div class="glass-panel rounded-2xl p-5">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Share Profile</h3>
                <div class="flex items-center gap-2">
                    <button @click="copyProfileLink()" class="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-lg">link</span>
                        Copy Link
                    </button>
                    <button class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </button>
                    <button class="w-10 h-10 flex items-center justify-center rounded-lg bg-[#25D366] text-white hover:opacity-90 transition-opacity">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function userProfile() {
    return {
        isFollowing: {{ auth()->check() && auth()->user()->isFollowing($user) ? 'true' : 'false' }},
        
        async toggleFollow() {
            @auth
            try {
                const response = await fetch('{{ route("frontend.users.toggle-follow", $user->id) }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });
                
                const data = await response.json();
                if (data.success) {
                    this.isFollowing = data.is_following;
                    // Update follower count display
                    const followerCountEl = document.querySelector('.follower-count');
                    if (followerCountEl) {
                        followerCountEl.textContent = data.followers_count.toLocaleString() + ' Followers';
                    }
                }
            } catch (error) {
                console.error('Error toggling follow:', error);
            }
            @else
            window.location.href = '{{ route("login") }}';
            @endauth
        },
        
        shareProfile() {
            if (navigator.share) {
                navigator.share({
                    title: '{{ $user->display_name ?? $user->name }} on TesoTunes',
                    url: window.location.href
                });
            } else {
                this.copyProfileLink();
            }
        },
        
        copyProfileLink() {
            navigator.clipboard.writeText(window.location.href);
            // Show toast notification
            if (typeof Alpine !== 'undefined' && Alpine.store('toast')) {
                Alpine.store('toast').show('Profile link copied!', 'success');
            } else {
                alert('Profile link copied to clipboard!');
            }
        }
    };
}
</script>
@endpush

@endsection
