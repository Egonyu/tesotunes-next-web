@props([
    'section' => 'home',
    'autoplay' => true,
    'interval' => 5000,
    'genre' => null,
    'mood' => null,
    'height' => '400px'
])

@php
    // Get slides based on section, genre, or mood
    if ($genre) {
        $slides = getSlidesByGenre($genre);
    } elseif ($mood) {
        $slides = getSlidesByMood($mood);
    } else {
        $slides = getSlidesBySection($section);
    }
@endphp

@if($slides && $slides->count() > 0)
<div 
    x-data="{
        currentSlide: 0,
        slides: {{ $slides->count() }},
        autoplay: {{ $autoplay ? 'true' : 'false' }},
        interval: {{ $interval }},
        timer: null,
        
        init() {
            if (this.autoplay && this.slides > 1) {
                this.startAutoplay();
            }
        },
        
        next() {
            this.currentSlide = (this.currentSlide + 1) % this.slides;
            this.resetAutoplay();
        },
        
        prev() {
            this.currentSlide = (this.currentSlide - 1 + this.slides) % this.slides;
            this.resetAutoplay();
        },
        
        goTo(index) {
            this.currentSlide = index;
            this.resetAutoplay();
        },
        
        startAutoplay() {
            this.timer = setInterval(() => {
                this.next();
            }, this.interval);
        },
        
        resetAutoplay() {
            if (this.autoplay && this.slides > 1) {
                clearInterval(this.timer);
                this.startAutoplay();
            }
        },
        
        stopAutoplay() {
            if (this.timer) {
                clearInterval(this.timer);
            }
        }
    }"
    @mouseenter="stopAutoplay()"
    @mouseleave="if (autoplay && slides > 1) startAutoplay()"
    class="relative overflow-hidden rounded-lg bg-slate-100 dark:bg-navy-700"
    style="height: {{ $height }}"
>
    <!-- Slides -->
    <div class="relative h-full">
        @foreach($slides as $index => $slide)
        <div 
            x-show="currentSlide === {{ $index }}"
            x-transition:enter="transition ease-out duration-500"
            x-transition:enter-start="opacity-0 transform translate-x-full"
            x-transition:enter-end="opacity-100 transform translate-x-0"
            x-transition:leave="transition ease-in duration-500"
            x-transition:leave-start="opacity-100 transform translate-x-0"
            x-transition:leave-end="opacity-0 transform -translate-x-full"
            class="absolute inset-0"
            style="display: none;"
        >
            <!-- Background Image with Overlay -->
            <div class="absolute inset-0">
                <img 
                    src="{{ $slide->getFirstMediaUrl('artwork', 'lg') }}" 
                    alt="{{ $slide->title }}"
                    class="w-full h-full object-cover"
                    loading="{{ $index === 0 ? 'eager' : 'lazy' }}"
                >
                <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>

            <!-- Content -->
            <div class="relative h-full flex items-center">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="max-w-2xl">
                        <!-- Type Badge -->
                        <div class="mb-3">
                            @php
                                $typeColors = [
                                    'song' => 'bg-blue-500',
                                    'album' => 'bg-purple-500',
                                    'artist' => 'bg-pink-500',
                                    'playlist' => 'bg-green-500',
                                    'station' => 'bg-orange-500',
                                    'user' => 'bg-gray-500',
                                ];
                                $bgColor = $typeColors[$slide->object_type] ?? 'bg-blue-500';
                            @endphp
                            <span class="inline-block {{ $bgColor }} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                                {{ ucfirst($slide->object_type) }}
                            </span>
                        </div>

                        <!-- Title -->
                        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            @if($slide->title_link)
                                <a href="{{ $slide->title_link }}" class="hover:text-primary-light transition-colors">
                                    {{ $slide->title }}
                                </a>
                            @else
                                {{ $slide->title }}
                            @endif
                        </h2>

                        <!-- Description -->
                        @if($slide->description)
                        <p class="text-lg text-slate-200 mb-6 line-clamp-3">
                            {{ $slide->description }}
                        </p>
                        @endif

                        <!-- Action Buttons -->
                        <div class="flex flex-wrap gap-3">
                            @if($slide->title_link)
                            <a 
                                href="{{ $slide->title_link }}" 
                                class="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors shadow-lg"
                            >
                                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                                </svg>
                                Explore Now
                            </a>
                            @endif

                            @if($slide->object)
                            <a 
                                href="#" 
                                class="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
                            >
                                Learn More
                            </a>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @endforeach
    </div>

    <!-- Navigation Arrows -->
    @if($slides->count() > 1)
    <div class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
        <button 
            @click="prev()"
            class="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous slide"
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
        </button>

        <button 
            @click="next()"
            class="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next slide"
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        </button>
    </div>

    <!-- Indicators -->
    <div class="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        @foreach($slides as $index => $slide)
        <button 
            @click="goTo({{ $index }})"
            :class="{ 'bg-white w-8': currentSlide === {{ $index }}, 'bg-white/50 w-2': currentSlide !== {{ $index }} }"
            class="h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Go to slide {{ $index + 1 }}"
        ></button>
        @endforeach
    </div>
    @endif
</div>
@endif
