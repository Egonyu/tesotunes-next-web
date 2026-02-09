@extends('frontend.layouts.music')

@section('title', $artist->stage_name . ' - Albums')

@section('content')
<div class="min-h-screen">
    <!-- Artist Header -->
    <div class="mb-8">
        <div class="flex items-center gap-4 mb-6">
            <a href="{{ route('frontend.artist.show', $artist) }}" 
               class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <span class="material-icons-round">arrow_back</span>
            </a>
            <div class="flex items-center gap-4">
                <img src="{{ $artist->avatar_url }}" 
                     alt="{{ $artist->stage_name }}" 
                     class="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-md"
                     onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name={{ urlencode($artist->stage_name) }}&size=64&background=10b981&color=fff'">
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{{ $artist->stage_name }}</h1>
                    <p class="text-gray-500 dark:text-gray-400">{{ $albums->total() }} {{ Str::plural('Album', $albums->total()) }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Albums Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        @forelse($albums as $album)
        <div class="group bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300">
            <!-- Album Artwork -->
            <div class="relative aspect-square">
                <img src="{{ $album->artwork_url ?? asset('images/default-album-artwork.svg') }}" 
                     alt="{{ $album->title }}" 
                     class="w-full h-full object-cover">
                
                <!-- Play Button Overlay -->
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <button @click="playAlbum({{ $album->id }})"
                            class="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-all duration-300 hover:bg-emerald-600 hover:scale-110">
                        <span class="material-icons-round text-white text-2xl">play_arrow</span>
                    </button>
                </div>

                <!-- Album Type Badge -->
                @if($album->album_type && $album->album_type !== 'album')
                <div class="absolute top-3 right-3">
                    <span class="px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-lg uppercase tracking-wide">
                        {{ $album->album_type }}
                    </span>
                </div>
                @endif

                <!-- Explicit Badge -->
                @if($album->is_explicit)
                <div class="absolute top-3 left-3">
                    <span class="w-6 h-6 bg-gray-900 text-white text-[10px] font-bold rounded flex items-center justify-center">E</span>
                </div>
                @endif
            </div>

            <!-- Album Info -->
            <div class="p-4">
                <a href="{{ route('album.show', $album->id) }}" class="block group/title">
                    <h3 class="font-semibold text-gray-900 dark:text-white mb-1 truncate group-hover/title:text-emerald-600 dark:group-hover/title:text-emerald-400 transition-colors">
                        {{ $album->title }}
                    </h3>
                </a>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {{ $album->release_year ?? $album->created_at->format('Y') }}
                </p>
                
                <!-- Stats -->
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1.5">
                        <span class="material-icons-round text-sm text-emerald-500">queue_music</span>
                        {{ $album->total_tracks ?? 0 }} tracks
                    </span>
                    <span class="flex items-center gap-1.5">
                        <span class="material-icons-round text-sm text-blue-500">play_arrow</span>
                        {{ number_format($album->play_count ?? 0) }}
                    </span>
                </div>
            </div>
        </div>
        @empty
        <div class="col-span-full">
            <div class="bg-white dark:bg-gray-800/50 rounded-2xl p-16 text-center border border-gray-100 dark:border-gray-700/50">
                <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span class="material-icons-round text-gray-400 text-4xl">album</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No albums yet</h3>
                <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{{ $artist->stage_name }} hasn't released any albums. Check back later for new releases!</p>
                <a href="{{ route('frontend.artist.show', $artist) }}" 
                   class="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors">
                    <span class="material-icons-round">music_note</span>
                    View Singles
                </a>
            </div>
        </div>
        @endforelse
    </div>

    <!-- Pagination -->
    @if($albums->hasPages())
    <div class="mt-8">
        {{ $albums->links() }}
    </div>
    @endif
</div>

@push('scripts')
<script>
function playAlbum(albumId) {
    // Fetch album tracks and play
    fetch(`/api/v1/albums/${albumId}/tracks`)
        .then(r => r.json())
        .then(data => {
            if (data.data && data.data.length > 0 && window.TesoTunes) {
                window.TesoTunes.setQueue(data.data, 0, true);
            }
        })
        .catch(err => console.error('Could not load album tracks:', err));
}
</script>
@endpush
@endsection
