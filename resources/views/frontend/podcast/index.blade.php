@extends('frontend.layouts.music')

@section('title', 'Podcasts - Tesotunes')

@push('styles')
<style>
    .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .dark .glass-panel {
        background: rgba(22, 27, 34, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .podcast-card {
        transition: all 0.3s ease;
    }
    .podcast-card:hover {
        transform: translateY(-4px);
    }
    .podcast-card:hover .play-overlay {
        opacity: 1;
    }
    .play-overlay {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
</style>
@endpush

@section('content')
<div class="max-w-[1600px] mx-auto space-y-6">
    <!-- Header Panel -->
    <div class="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <a href="{{ route('frontend.social.feed') }}" class="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-base">home</span>
                    Home
                </a>
                <span class="material-symbols-outlined text-base">chevron_right</span>
                <span class="text-gray-900 dark:text-white">Podcasts</span>
            </nav>

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Podcasts</h1>
                    <p class="text-gray-500 dark:text-gray-400">Discover amazing podcasts from talented creators</p>
                </div>
                @auth
                <a href="{{ route('podcast.create') }}" 
                   class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20">
                    <span class="material-symbols-outlined text-xl">add</span>
                    Create Podcast
                </a>
                @endauth
            </div>
        </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Podcasts -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-purple-100 dark:bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">podcasts</span>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($podcasts->total()) }}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Total Podcasts</p>
                </div>
            </div>
        </div>

        <!-- Categories -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">category</span>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ number_format($categories->count()) }}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Categories</p>
                </div>
            </div>
        </div>

        <!-- Active Filter -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-green-100 dark:bg-green-600/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400">filter_alt</span>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ request('category') ? $categories->firstWhere('id', request('category'))?->name ?? 'All' : 'All' }}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Active Filter</p>
                </div>
            </div>
        </div>

        <!-- Sort By -->
        <div class="glass-panel rounded-xl p-5">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-orange-100 dark:bg-orange-600/20 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-orange-600 dark:text-orange-400">sort</span>
                </div>
                <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white capitalize">{{ request('sort', 'Latest') }}</p>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Sort Order</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters & Search Panel -->
    <div class="glass-panel rounded-xl p-4">
        <form action="{{ route('podcast.index') }}" method="GET" class="flex flex-col lg:flex-row lg:items-center gap-4">
            <!-- Search -->
            <div class="flex-1 relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">search</span>
                <input type="text"
                       name="search"
                       value="{{ request('search') }}"
                       placeholder="Search podcasts..."
                       class="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors">
            </div>

            <div class="flex flex-wrap items-center gap-3">
                <!-- Category Filter -->
                <select name="category"
                        class="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors">
                    <option value="">All Categories</option>
                    @foreach($categories as $category)
                        <option value="{{ $category->id }}" {{ request('category') == $category->id ? 'selected' : '' }}>
                            {{ $category->name }}
                        </option>
                    @endforeach
                </select>

                <!-- Language Filter -->
                <select name="language"
                        class="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors">
                    <option value="">All Languages</option>
                    <option value="en" {{ request('language') == 'en' ? 'selected' : '' }}>English</option>
                    <option value="lug" {{ request('language') == 'lug' ? 'selected' : '' }}>Luganda</option>
                    <option value="swa" {{ request('language') == 'swa' ? 'selected' : '' }}>Swahili</option>
                </select>

                <!-- Sort -->
                <select name="sort"
                        class="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-colors">
                    <option value="latest" {{ request('sort') == 'latest' ? 'selected' : '' }}>Latest</option>
                    <option value="popular" {{ request('sort') == 'popular' ? 'selected' : '' }}>Most Popular</option>
                    <option value="trending" {{ request('sort') == 'trending' ? 'selected' : '' }}>Trending</option>
                </select>

                <button type="submit" 
                        class="px-6 py-2.5 bg-brand-green hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">search</span>
                    Search
                </button>
            </div>
        </form>
    </div>

    <!-- Podcasts Grid -->
    @if($podcasts->count() > 0)
        <div class="glass-panel rounded-xl p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    @if(request('search'))
                        Results for "{{ request('search') }}"
                    @elseif(request('category'))
                        {{ $categories->firstWhere('id', request('category'))?->name ?? 'Podcasts' }}
                    @else
                        All Podcasts
                    @endif
                </h2>
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ $podcasts->total() }} podcasts</span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                @foreach($podcasts as $podcast)
                    <div class="podcast-card group">
                        <a href="{{ route('podcast.show', $podcast->slug) }}" class="block">
                            <!-- Cover Image -->
                            <div class="relative mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square shadow-lg">
                                <img src="{{ $podcast->cover_image_url ?? asset('images/podcast-placeholder.png') }}"
                                     alt="{{ $podcast->title }}"
                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                
                                <!-- Play Button Overlay -->
                                <div class="play-overlay absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <button class="w-14 h-14 bg-brand-green rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                                        <span class="material-symbols-outlined text-white text-3xl">play_arrow</span>
                                    </button>
                                </div>

                                <!-- Episode Count Badge -->
                                <div class="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white">
                                    {{ $podcast->episodes_count ?? 0 }} eps
                                </div>
                            </div>

                            <!-- Podcast Info -->
                            <div>
                                <h3 class="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-brand-green transition-colors">{{ $podcast->title }}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ $podcast->creator->name ?? 'Unknown' }}</p>
                                
                                <!-- Stats -->
                                <div class="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                                    <span class="flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm">headphones</span>
                                        {{ number_format($podcast->total_listens ?? 0) }}
                                    </span>
                                    <span class="flex items-center gap-1">
                                        <span class="material-symbols-outlined text-sm">group</span>
                                        {{ number_format($podcast->total_subscribers ?? 0) }}
                                    </span>
                                </div>
                            </div>
                        </a>
                    </div>
                @endforeach
            </div>

            <!-- Pagination -->
            @if($podcasts->hasPages())
                <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {{ $podcasts->links() }}
                </div>
            @endif
        </div>
    @else
        <!-- Empty State -->
        <div class="glass-panel rounded-xl p-12 text-center">
            <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-4xl">podcasts</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No podcasts found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                @if(request()->hasAny(['search', 'category', 'language']))
                    Try adjusting your search or filters to find what you're looking for.
                @else
                    Be the first to create a podcast and share your voice with the world!
                @endif
            </p>
            <div class="flex items-center justify-center gap-4">
                @if(request()->hasAny(['search', 'category', 'language']))
                    <a href="{{ route('podcast.index') }}"
                       class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors">
                        <span class="material-symbols-outlined">clear</span>
                        Clear Filters
                    </a>
                @endif
                @auth
                    <a href="{{ route('podcast.create') }}"
                       class="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20">
                        <span class="material-symbols-outlined">add</span>
                        Create Podcast
                    </a>
                @endauth
            </div>
        </div>
    @endif

    <!-- Categories Section -->
    @if($categories->count() > 0)
        <div class="glass-panel rounded-xl p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Browse by Category</h2>
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ $categories->count() }} categories</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                @foreach($categories as $category)
                    <a href="{{ route('podcast.index', ['category' => $category->id]) }}"
                       class="group bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl p-5 transition-all border border-gray-200 dark:border-gray-700 hover:border-brand-green dark:hover:border-brand-green hover:shadow-lg">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-brand-green">{{ $category->icon ?? 'folder' }}</span>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-brand-green transition-colors">{{ $category->name }}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $category->podcasts_count ?? 0 }} podcasts</p>
                            </div>
                        </div>
                    </a>
                @endforeach
            </div>
        </div>
    @endif
</div>
@endsection
