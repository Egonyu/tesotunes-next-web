@extends('layouts.admin')

@section('title', $artist->stage_name . ' - Artist Details')

@push('head')
<!-- Material Icons -->
<link href="https://fonts.googleapis.com/css2?family=Material+Icons+Round" rel="stylesheet">
@endpush

@section('content')
<div class="p-6" x-data="artistPage()">
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <div class="flex items-center gap-3 mb-2">
                <a href="{{ route('admin.music.artists.index') }}" 
                   class="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <span class="material-icons-round">arrow_back</span>
                </a>
                <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{{ $artist->stage_name }}</h1>
                @if($artist->is_verified)
                    <span class="material-icons-round text-blue-500" title="Verified Artist">verified</span>
                @endif
            </div>
            <p class="text-slate-600 dark:text-gray-400">Artist Profile & Analytics</p>
        </div>
        <div class="flex flex-wrap gap-3">
            <!-- Copy Profile Link -->
            <button 
                @click="copyArtistLink()"
                class="bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                title="Copy public profile link">
                <span class="material-icons-round text-sm">link</span>
                <span x-text="copied ? 'Copied!' : 'Copy Link'"></span>
            </button>
            
            <!-- Edit Button -->
            <a href="{{ route('admin.music.artists.edit', $artist) }}" 
               class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <span class="material-icons-round text-sm">edit</span>
                Edit Artist
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Profile Info -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Profile Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-slate-200 dark:border-gray-700 shadow-sm">
                <div class="flex flex-col sm:flex-row items-start gap-6">
                    <!-- Avatar -->
                    <div class="flex-shrink-0 mx-auto sm:mx-0">
                        <img src="{{ $artist->avatar_url }}" alt="{{ $artist->stage_name }}" 
                             class="w-32 h-32 rounded-full object-cover ring-4 ring-slate-200 dark:ring-gray-700">
                    </div>

                    <!-- Info -->
                    <div class="flex-1 text-center sm:text-left">
                        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">{{ $artist->stage_name }}</h2>
                        
                        <div class="flex flex-wrap gap-4 mb-4 justify-center sm:justify-start">
                            @if($artist->user)
                                <div class="flex items-center gap-2 text-slate-600 dark:text-gray-300">
                                    <span class="material-icons-round text-sm">person</span>
                                    <span>{{ $artist->user->name }}</span>
                                </div>
                                <div class="flex items-center gap-2 text-slate-600 dark:text-gray-300">
                                    <span class="material-icons-round text-sm">email</span>
                                    <span>{{ $artist->user->email }}</span>
                                </div>
                                @if($artist->user->country)
                                    <div class="flex items-center gap-2 text-slate-600 dark:text-gray-300">
                                        <span class="material-icons-round text-sm">location_on</span>
                                        <span>{{ $artist->user->country }}</span>
                                    </div>
                                @endif
                            @else
                                <div class="flex items-center gap-2 text-slate-600 dark:text-gray-300">
                                    <span class="material-icons-round text-sm">info</span>
                                    <span>Legacy Artist (No User Account)</span>
                                </div>
                            @endif
                        </div>

                        @if($artist->bio)
                            <p class="text-slate-600 dark:text-gray-400 mb-4">{{ $artist->bio }}</p>
                        @endif

                        <!-- Status Badges -->
                        <div class="flex flex-wrap gap-2 justify-center sm:justify-start">
                            @if($artist->verification_status === 'verified')
                                <span class="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-500 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm">
                                    <span class="material-icons-round text-xs">check_circle</span>
                                    Verified
                                </span>
                            @elseif($artist->verification_status === 'pending')
                                <span class="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-500 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm">
                                    <span class="material-icons-round text-xs">schedule</span>
                                    Pending
                                </span>
                            @elseif($artist->verification_status === 'rejected')
                                <span class="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-500 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm">
                                    <span class="material-icons-round text-xs">cancel</span>
                                    Rejected
                                </span>
                            @endif

                            @if($artist->is_trusted)
                                <span class="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-500 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm">
                                    <span class="material-icons-round text-xs">stars</span>
                                    Trusted
                                </span>
                            @endif

                            <span class="inline-flex items-center gap-1 bg-slate-100 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                                <span class="material-icons-round text-xs">info</span>
                                {{ ucfirst($artist->status) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Analytics Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-slate-200 dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-2 mb-4">
                    <span class="material-icons-round text-blue-500">analytics</span>
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Analytics</h3>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700/50 rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-icons-round text-purple-600 dark:text-purple-400 text-sm">music_note</span>
                            <p class="text-slate-600 dark:text-gray-400 text-sm">Total Songs</p>
                        </div>
                        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ number_format($analytics['total_songs'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-icons-round text-blue-600 dark:text-blue-400 text-sm">album</span>
                            <p class="text-slate-600 dark:text-gray-400 text-sm">Total Albums</p>
                        </div>
                        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ number_format($analytics['total_albums'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-700/50 rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-icons-round text-green-600 dark:text-green-400 text-sm">play_circle</span>
                            <p class="text-slate-600 dark:text-gray-400 text-sm">Total Plays</p>
                        </div>
                        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ number_format($analytics['total_plays'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20 border border-pink-200 dark:border-pink-700/50 rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-icons-round text-pink-600 dark:text-pink-400 text-sm">people</span>
                            <p class="text-slate-600 dark:text-gray-400 text-sm">Followers</p>
                        </div>
                        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ number_format($analytics['total_followers'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700/50 rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-icons-round text-orange-600 dark:text-orange-400 text-sm">headphones</span>
                            <p class="text-slate-600 dark:text-gray-400 text-sm">Monthly Listeners</p>
                        </div>
                        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ number_format($analytics['monthly_listeners'] ?? 0) }}</p>
                    </div>
                    <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-4">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-icons-round text-yellow-600 dark:text-yellow-400 text-sm">attach_money</span>
                            <p class="text-slate-600 dark:text-gray-400 text-sm">Total Revenue</p>
                        </div>
                        <p class="text-2xl font-bold text-slate-800 dark:text-white">UGX {{ number_format($analytics['revenue'] ?? 0) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Quick Info -->
        <div class="space-y-6">
            <!-- Upload Settings -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-slate-200 dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-2 mb-4">
                    <span class="material-icons-round text-purple-500">settings</span>
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Upload Settings</h3>
                </div>
                
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between items-center">
                        <span class="text-slate-600 dark:text-gray-400 flex items-center gap-2">
                            <span class="material-icons-round text-xs">cloud_upload</span>
                            Can Upload:
                        </span>
                        <span class="text-slate-800 dark:text-white font-medium">
                            @if($artist->can_upload)
                                <span class="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <span class="material-icons-round text-xs">check_circle</span>
                                    Yes
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <span class="material-icons-round text-xs">cancel</span>
                                    No
                                </span>
                            @endif
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-gray-400 flex items-center gap-2">
                            <span class="material-icons-round text-xs">calendar_month</span>
                            Monthly Limit:
                        </span>
                        <span class="text-slate-800 dark:text-white font-medium">{{ $artist->monthly_upload_limit ?? 'Unlimited' }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-600 dark:text-gray-400 flex items-center gap-2">
                            <span class="material-icons-round text-xs">percent</span>
                            Commission Rate:
                        </span>
                        <span class="text-slate-800 dark:text-white font-medium">{{ $artist->commission_rate ?? 30 }}%</span>
                    </div>
                </div>
            </div>

            <!-- Timestamps -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-slate-200 dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-2 mb-4">
                    <span class="material-icons-round text-blue-500">schedule</span>
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Timestamps</h3>
                </div>
                
                <div class="space-y-3 text-sm">
                    <div>
                        <span class="text-slate-600 dark:text-gray-400 block mb-1 flex items-center gap-2">
                            <span class="material-icons-round text-xs">add_circle</span>
                            Created:
                        </span>
                        <span class="text-slate-800 dark:text-white">{{ $artist->created_at->format('M j, Y g:i A') }}</span>
                    </div>
                    <div>
                        <span class="text-slate-600 dark:text-gray-400 block mb-1 flex items-center gap-2">
                            <span class="material-icons-round text-xs">update</span>
                            Last Updated:
                        </span>
                        <span class="text-slate-800 dark:text-white">{{ $artist->updated_at->format('M j, Y g:i A') }}</span>
                    </div>
                    @if($artist->verified_at)
                        <div>
                            <span class="text-slate-600 dark:text-gray-400 block mb-1 flex items-center gap-2">
                                <span class="material-icons-round text-xs">verified</span>
                                Verified:
                            </span>
                            <span class="text-slate-800 dark:text-white">{{ $artist->verified_at->format('M j, Y g:i A') }}</span>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-slate-200 dark:border-gray-700 shadow-sm">
                <div class="flex items-center gap-2 mb-4">
                    <span class="material-icons-round text-green-500">flash_on</span>
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-white">Quick Actions</h3>
                </div>
                
                <div class="space-y-2">
                    <a href="{{ route('frontend.artist.show', $artist) }}" target="_blank"
                       class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center flex items-center justify-center gap-2">
                        <span class="material-icons-round text-sm">visibility</span>
                        View Public Profile
                    </a>
                    <a href="{{ route('admin.music.songs.index', ['artist' => $artist->id]) }}"
                       class="w-full bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors text-center flex items-center justify-center gap-2">
                        <span class="material-icons-round text-sm">music_note</span>
                        View Songs
                    </a>
                    <a href="{{ route('admin.music.albums.index', ['artist' => $artist->id]) }}"
                       class="w-full bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors text-center flex items-center justify-center gap-2">
                        <span class="material-icons-round text-sm">album</span>
                        View Albums
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function artistPage() {
    return {
        copied: false,
        
        copyArtistLink() {
            const url = '{{ route('frontend.artist.show', $artist) }}';
            
            // Check if clipboard API is available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url)
                    .then(() => {
                        this.copied = true;
                        setTimeout(() => this.copied = false, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy:', err);
                        this.fallbackCopy(url);
                    });
            } else {
                // Fallback for older browsers
                this.fallbackCopy(url);
            }
        },
        
        fallbackCopy(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                this.copied = true;
                setTimeout(() => this.copied = false, 2000);
            } catch (err) {
                console.error('Fallback copy failed:', err);
                alert('Failed to copy link. Please copy manually: ' + text);
            }
            
            document.body.removeChild(textarea);
        }
    };
}
</script>
@endpush
@endsection
