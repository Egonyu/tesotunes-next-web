@extends('layouts.app')

@section('left-sidebar')
    @include('frontend.partials.modern-left-sidebar')
@endsection

@section('title', 'Playlists Hub')

@push('styles')
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
    /* Light mode glass */
    .glass-panel {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    /* Dark mode glass */
    .dark .glass-panel {
        background: rgba(31, 34, 41, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .playlist-card:hover .play-button {
        opacity: 1;
        transform: translateY(0);
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
@endpush

@section('content')
<div class="font-[Epilogue]">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-20 glass-panel h-16 flex items-center justify-between px-6 rounded-xl mb-6">
        <div class="flex items-center gap-4">
            <div class="flex gap-2 mr-4">
                <button onclick="history.back()" class="size-8 rounded-full bg-gray-200 dark:bg-black/40 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-black/60 text-gray-700 dark:text-white">
                    <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button onclick="history.forward()" class="size-8 rounded-full bg-gray-200 dark:bg-black/40 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-black/60 text-gray-700 dark:text-white">
                    <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
            <div class="flex gap-2 overflow-x-auto hide-scrollbar">
                <a href="{{ route('frontend.playlists.index', ['sort' => 'recent']) }}" class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full {{ request('sort', 'recent') == 'recent' ? 'bg-brand-green text-black' : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20' }} px-4 text-xs font-bold">Recent</a>
                <a href="{{ route('frontend.playlists.index', ['sort' => 'popular']) }}" class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full {{ request('sort') == 'popular' ? 'bg-brand-green text-black' : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20' }} px-4 text-xs font-bold">Popular</a>
                <a href="{{ route('frontend.playlists.index', ['sort' => 'featured']) }}" class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full {{ request('sort') == 'featured' ? 'bg-brand-green text-black' : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20' }} px-4 text-xs font-bold">Featured</a>
            </div>
        </div>
        @auth
        <div class="flex items-center gap-4">
            <a href="{{ route('frontend.playlists.create') }}" class="flex h-8 items-center gap-2 rounded-full bg-brand-green text-black px-4 text-xs font-bold hover:brightness-110">
                <span class="material-symbols-outlined text-sm">add</span> Create Playlist
            </a>
        </div>
        @endauth
    </header>

    <!-- Hero Section -->
    @if($heroPlaylist ?? false)
    <section class="relative">
        <a href="{{ route('frontend.playlists.show', $heroPlaylist) }}" class="group relative h-80 md:h-96 w-full rounded-2xl overflow-hidden flex flex-col justify-end p-8 md:p-10 bg-cover bg-center block" style="background-image: linear-gradient(to top, rgba(17,19,23,1) 0%, rgba(17,19,23,0.4) 50%, rgba(17,19,23,0) 100%), url('{{ $heroPlaylist->artwork_url ?? asset('images/default-playlist.svg') }}');">
            <div class="flex flex-col gap-4 max-w-2xl">
                <span class="text-brand-green font-bold tracking-widest text-xs uppercase">Playlist of the Day</span>
                <h2 class="text-4xl md:text-6xl font-black tracking-tighter leading-none text-white">{{ $heroPlaylist->title }}</h2>
                <p class="text-white/70 text-base md:text-lg line-clamp-2">{{ $heroPlaylist->description ?? 'Discover amazing tracks curated just for you.' }}</p>
                <div class="flex items-center gap-4 mt-2">
                    <button onclick="event.preventDefault(); playPlaylist({{ $heroPlaylist->id }})" class="h-12 md:h-14 px-8 md:px-10 bg-brand-green text-black rounded-full font-black text-base md:text-lg hover:scale-105 transition-transform flex items-center gap-2">
                        <span class="material-symbols-outlined text-xl md:text-2xl">play_arrow</span> Play
                    </button>
                    <button class="size-12 md:size-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                    <div class="text-white/40 text-sm font-medium ml-2 hidden sm:block">
                        {{ $heroPlaylist->songs_count ?? 0 }} songs • {{ $heroPlaylist->total_duration_seconds ? gmdate('G\h i\m', $heroPlaylist->total_duration_seconds) : 'N/A' }}
                    </div>
                </div>
            </div>
        </a>
    </section>
    @else
    <!-- Empty Hero Section -->
    <section class="relative">
        <div class="group relative h-80 md:h-96 w-full rounded-2xl overflow-hidden flex flex-col justify-center items-center p-8 md:p-10 bg-gradient-to-br from-brand-green/20 to-emerald-900/40">
            <span class="material-symbols-outlined text-6xl text-brand-green/50 mb-4">queue_music</span>
            <h2 class="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">No Playlists Yet</h2>
            <p class="text-gray-600 dark:text-white/60 text-center max-w-md mb-6">Be the first to create a playlist and share your favorite tracks with the community.</p>
            @auth
            <a href="{{ route('frontend.playlists.create') }}" class="h-12 px-8 bg-brand-green text-black rounded-full font-bold text-base hover:scale-105 transition-transform flex items-center gap-2">
                <span class="material-symbols-outlined">add</span> Create First Playlist
            </a>
            @else
            <a href="{{ route('login') }}" class="h-12 px-8 bg-brand-green text-black rounded-full font-bold text-base hover:scale-105 transition-transform flex items-center gap-2">
                <span class="material-symbols-outlined">login</span> Sign In to Create
            </a>
            @endauth
        </div>
    </section>
    @endif

    <!-- Featured Playlists Carousel -->
    @if(($featuredPlaylists ?? collect())->count() > 0)
    <section class="mt-12">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Featured Playlists</h3>
            <a class="text-xs font-bold text-gray-500 dark:text-white/50 hover:text-brand-green transition-colors" href="#">SEE ALL</a>
        </div>
        <div class="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
            @foreach($featuredPlaylists as $playlist)
            <a href="{{ route('frontend.playlists.show', $playlist) }}" class="playlist-card group min-w-[160px] md:min-w-[200px] glass-panel p-3 md:p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer block">
                <div class="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-xl">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-gray-200 dark:bg-gray-800" style="background-image: url('{{ $playlist->artwork_url ?? asset('images/default-playlist.svg') }}');"></div>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <div class="play-button absolute bottom-2 right-2 size-10 md:size-12 bg-brand-green rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 transition-all duration-300">
                        <span class="material-symbols-outlined text-black">play_arrow</span>
                    </div>
                </div>
                <h4 class="font-bold mb-1 truncate text-gray-900 dark:text-white text-sm md:text-base">{{ $playlist->title }}</h4>
                <p class="text-xs text-gray-500 dark:text-white/50 line-clamp-2">{{ $playlist->songs_count ?? 0 }} songs • By {{ $playlist->owner->name ?? 'TesoTunes' }}</p>
            </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Popular Playlists (Made For You style) -->
    @if(($popularPlaylists ?? collect())->count() > 0)
    <section class="mt-12">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Popular Playlists</h3>
            <a class="text-xs font-bold text-gray-500 dark:text-white/50 hover:text-brand-green transition-colors" href="#">SEE ALL</a>
        </div>
        <div class="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1">
            @foreach($popularPlaylists->take(6) as $playlist)
            <a href="{{ route('frontend.playlists.show', $playlist) }}" class="playlist-card group min-w-[160px] md:min-w-[200px] glass-panel p-3 md:p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer block">
                <div class="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-xl">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-gray-200 dark:bg-gray-800" style="background-image: url('{{ $playlist->artwork_url ?? asset('images/default-playlist.svg') }}');"></div>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <div class="play-button absolute bottom-2 right-2 size-10 md:size-12 bg-brand-green rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 transition-all duration-300">
                        <span class="material-symbols-outlined text-black">play_arrow</span>
                    </div>
                </div>
                <h4 class="font-bold mb-1 truncate text-gray-900 dark:text-white text-sm md:text-base">{{ $playlist->title }}</h4>
                <p class="text-xs text-gray-500 dark:text-white/50 line-clamp-2">{{ number_format($playlist->play_count ?? 0) }} plays</p>
            </a>
            @endforeach
        </div>
    </section>
    @endif

    <!-- Genre & Mood Grid -->
    <section class="mt-12">
        <h3 class="text-xl md:text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Explore Genres & Moods</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            <a href="{{ route('frontend.genres') }}?genre=chill" class="relative h-36 md:h-48 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-purple-600 to-indigo-900">
                <div class="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>
                <div class="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
                    <h4 class="text-lg md:text-2xl font-black italic tracking-tighter text-white">CHILL RHYTHMS</h4>
                    <span class="material-symbols-outlined self-end text-2xl md:text-3xl text-white">filter_vintage</span>
                </div>
            </a>
            <a href="{{ route('frontend.genres') }}?genre=gospel" class="relative h-36 md:h-48 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-orange-500 to-red-800">
                <div class="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>
                <div class="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
                    <h4 class="text-lg md:text-2xl font-black italic tracking-tighter text-white">GOSPEL SOUL</h4>
                    <span class="material-symbols-outlined self-end text-2xl md:text-3xl text-white">auto_awesome</span>
                </div>
            </a>
            <a href="{{ route('frontend.genres') }}?genre=workout" class="relative h-36 md:h-48 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-cyan-500 to-blue-900">
                <div class="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>
                <div class="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
                    <h4 class="text-lg md:text-2xl font-black italic tracking-tighter text-white">ENERGY BOOST</h4>
                    <span class="material-symbols-outlined self-end text-2xl md:text-3xl text-white">bolt</span>
                </div>
            </a>
            <a href="{{ route('frontend.genres') }}?genre=jazz" class="relative h-36 md:h-48 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-900">
                <div class="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>
                <div class="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
                    <h4 class="text-lg md:text-2xl font-black italic tracking-tighter text-white">TESO JAZZ</h4>
                    <span class="material-symbols-outlined self-end text-2xl md:text-3xl text-white">piano</span>
                </div>
            </a>
        </div>
    </section>

    <!-- Trending & Editor's Picks -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mt-12 md:mt-16">
        <!-- Trending Section -->
        <div class="lg:col-span-2">
            <h3 class="text-xl md:text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Trending in Teso</h3>
            <div class="space-y-2">
                @forelse($trendingSongs ?? [] as $index => $song)
                <div class="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer" onclick="playSong({{ $song->id }})">
                    <span class="w-8 text-center text-gray-400 dark:text-white/40 font-bold group-hover:text-brand-green">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</span>
                    <div class="size-12 rounded bg-cover bg-gray-200 dark:bg-gray-800" style="background-image: url('{{ $song->artwork_url }}')"></div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-sm text-gray-900 dark:text-white truncate">{{ $song->title }}</h5>
                        <p class="text-xs text-gray-500 dark:text-white/50 truncate">{{ $song->artist->stage_name ?? 'Unknown Artist' }}</p>
                    </div>
                    <div class="text-xs text-gray-400 dark:text-white/40 group-hover:text-gray-700 dark:group-hover:text-white transition-colors">{{ gmdate('i:s', $song->duration_seconds ?? 0) }}</div>
                    <button class="material-symbols-outlined text-gray-400 dark:text-white/40 hover:text-brand-green">more_horiz</button>
                </div>
                @empty
                <div class="text-center py-8 text-gray-500 dark:text-white/40">
                    <span class="material-symbols-outlined text-4xl mb-2 block">music_off</span>
                    <p>No trending songs yet</p>
                </div>
                @endforelse
            </div>
        </div>
        
        <!-- Editor's Picks -->
        <div>
            <h3 class="text-xl md:text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">Editor's Picks</h3>
            <div class="space-y-4">
                @forelse(($editorsPicks ?? collect())->take(3) as $playlist)
                <a href="{{ route('frontend.playlists.show', $playlist) }}" class="flex gap-4 items-center group">
                    <div class="size-16 md:size-20 rounded-xl bg-cover flex-shrink-0 bg-gray-200 dark:bg-gray-800" style="background-image: url('{{ $playlist->artwork_url ?? asset('images/default-playlist.svg') }}')"></div>
                    <div>
                        <h6 class="font-bold leading-tight mb-1 text-gray-900 dark:text-white group-hover:text-brand-green transition-colors">{{ $playlist->title }}</h6>
                        <p class="text-xs text-gray-500 dark:text-white/40 mb-2">{{ $playlist->updated_at->diffForHumans() }}</p>
                        <span class="text-xs font-bold text-brand-green group-hover:underline">EXPLORE</span>
                    </div>
                </a>
                @empty
                <div class="text-center py-8 text-gray-500 dark:text-white/40">
                    <span class="material-symbols-outlined text-3xl mb-2 block">playlist_add</span>
                    <p class="text-sm">No editor's picks yet</p>
                </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- All Playlists Grid -->
    @if(($allPlaylists ?? collect())->count() > 0)
    <section class="mt-12 md:mt-16">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">All Playlists</h3>
            <span class="text-xs text-gray-500 dark:text-white/50">{{ $totalPlaylists ?? 0 }} playlists</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            @foreach($allPlaylists as $playlist)
            <a href="{{ route('frontend.playlists.show', $playlist) }}" class="playlist-card group glass-panel p-3 md:p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer block">
                <div class="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-xl">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 bg-gray-200 dark:bg-gray-800" style="background-image: url('{{ $playlist->artwork_url ?? asset('images/default-playlist.svg') }}');"></div>
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                    <div class="play-button absolute bottom-2 right-2 size-10 md:size-12 bg-brand-green rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-4 transition-all duration-300">
                        <span class="material-symbols-outlined text-black">play_arrow</span>
                    </div>
                </div>
                <h4 class="font-bold mb-1 truncate text-gray-900 dark:text-white text-sm">{{ $playlist->title }}</h4>
                <p class="text-xs text-gray-500 dark:text-white/50 truncate">{{ $playlist->songs_count ?? 0 }} songs</p>
            </a>
            @endforeach
        </div>
        
        <!-- Pagination -->
        @if($allPlaylists->hasPages())
        <div class="flex justify-center mt-8">
            {{ $allPlaylists->links() }}
        </div>
        @endif
    </section>
    @endif

    <!-- Empty State for No Playlists at All -->
    @if(($totalPlaylists ?? 0) === 0)
    <section class="mt-12 md:mt-16 text-center py-16">
        <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-white/20 mb-4 block">library_music</span>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Playlists Yet</h3>
        <p class="text-gray-600 dark:text-white/60 max-w-md mx-auto mb-6">The community hasn't created any playlists yet. Be the first to share your music taste!</p>
        @auth
        <a href="{{ route('frontend.playlists.create') }}" class="inline-flex h-12 px-8 bg-brand-green text-black rounded-full font-bold text-base hover:scale-105 transition-transform items-center gap-2">
            <span class="material-symbols-outlined">add</span> Create a Playlist
        </a>
        @else
        <a href="{{ route('login') }}" class="inline-flex h-12 px-8 bg-brand-green text-black rounded-full font-bold text-base hover:scale-105 transition-transform items-center gap-2">
            <span class="material-symbols-outlined">login</span> Sign In to Create
        </a>
        @endauth
    </section>
    @endif
</div>
@endsection
