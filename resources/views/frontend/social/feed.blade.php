@extends('frontend.layouts.music')

@section('title', 'Social Feed')

@section('content')
<div class="flex flex-col min-h-screen bg-white dark:bg-gray-950">
    <!-- Sticky Header -->
    @include('frontend.partials.timeline-header')
    
    <!-- Main Content Grid -->
    <div class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-12 gap-6">
            <!-- Left Sidebar (Desktop Only) -->
            <aside class="hidden lg:block col-span-3 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto">
                @include('frontend.partials.timeline-left-sidebar')
            </aside>
            
            <!-- Center Feed -->
            <main class="col-span-12 lg:col-span-6">
                @if(isset($activities) && $activities->count() > 0)
                    @include('frontend.partials.timeline-feed-infinite', ['activities' => $activities])
                @else
                    <div class="space-y-6">
                        @auth
                        @include('frontend.partials.create-post-box')
                        @endauth
                        
                        <div class="bg-white dark:bg-[#161B22] rounded-xl p-12 text-center border border-gray-200 dark:border-[#30363D]">
                            <span class="material-icons-round text-6xl text-gray-600 mb-4 block">rss_feed</span>
                            <p class="text-gray-400 mb-4">No activity yet</p>
                            <p class="text-sm text-gray-500 mb-4">Follow some artists to see their latest updates!</p>
                            <a href="{{ route('frontend.timeline') }}" class="inline-block bg-brand-green text-white font-semibold py-2 px-6 rounded-full hover:bg-green-500 transition-colors">
                                Discover Music
                            </a>
                        </div>
                    </div>
                @endif
            </main>
            
            <!-- Right Sidebar (Desktop Only) -->
            <aside class="hidden lg:block col-span-3 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto space-y-6">
                @include('frontend.partials.timeline-right-sidebar')
            </aside>
        </div>
    </div>
    
    <!-- Modals -->
    @auth
    @include('frontend.modals.create-post-modal')
    @include('frontend.modals.comments-modal')
    @endauth
</div>
@endsection
