<!DOCTYPE html>
<html class="dark" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>Music Events - TesoTunes</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Alpine.js -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    "primary": "#f59e0b",
                    "primary-hover": "#d97706",
                    "background-light": "#f6f5f8",
                    "background-dark": "#0d1117",
                    "card-dark": "#161b22",
                    "border-dark": "#30363d",
                    "text-secondary": "#8b949e",
                    "status-orange": "#F59E0B",
                    "status-green": "#10B981",
                    "status-red": "#EF4444",
                    "status-blue": "#3B82F6",
                    "status-purple": "#8B5CF6",
                },
                fontFamily: {
                    "display": ["Spline Sans", "sans-serif"]
                },
                borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
            },
        },
    }
</script>
<style>
    body {
        font-family: "Spline Sans", sans-serif;
    }
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #0d1117; 
    }
    ::-webkit-scrollbar-thumb {
        background: #30363d; 
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #484f58; 
    }
    .event-card {
        transition: all 0.3s ease;
    }
    .event-card:hover {
        transform: translateY(-4px);
    }
    .event-card:hover .event-cover {
        transform: scale(1.05);
    }
    .event-cover {
        transition: transform 0.5s ease;
    }
</style>
</head>
<body class="bg-background-dark text-white h-screen overflow-hidden flex flex-col md:flex-row">

<!-- Sidebar -->
<aside class="w-full md:w-64 flex-shrink-0 border-r border-border-dark bg-background-dark flex flex-col h-full hidden md:flex">
    <div class="p-6 flex items-center gap-3">
        <a href="{{ route('frontend.home') }}" class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-xl">celebration</span>
            </div>
            <div>
                <h1 class="text-white text-lg font-bold leading-tight">TesoTunes</h1>
                <p class="text-text-secondary text-xs">Events Hub</p>
            </div>
        </a>
    </div>
    
    <nav class="flex-1 flex flex-col gap-2 px-4 overflow-y-auto">
        <a class="flex items-center gap-3 px-3 py-3 rounded-lg {{ request()->routeIs('frontend.events.index') && !request('tab') ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-card-dark hover:text-white' }} transition-colors" href="{{ route('frontend.events.index') }}">
            <span class="material-symbols-outlined">event</span>
            <span class="font-medium">All Events</span>
        </a>
        <a class="flex items-center gap-3 px-3 py-3 rounded-lg {{ request('tab') === 'upcoming' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-card-dark hover:text-white' }} transition-colors" href="{{ route('frontend.events.index', ['tab' => 'upcoming']) }}">
            <span class="material-symbols-outlined">schedule</span>
            <span class="font-medium">Upcoming</span>
        </a>
        <a class="flex items-center gap-3 px-3 py-3 rounded-lg {{ request('tab') === 'thisweek' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-card-dark hover:text-white' }} transition-colors" href="{{ route('frontend.events.index', ['tab' => 'thisweek']) }}">
            <span class="material-symbols-outlined">date_range</span>
            <span class="font-medium">This Week</span>
        </a>
        @auth
        <a class="flex items-center gap-3 px-3 py-3 rounded-lg {{ request()->routeIs('frontend.events.my-tickets') ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-card-dark hover:text-white' }} transition-colors" href="{{ route('frontend.events.my-tickets') }}">
            <span class="material-symbols-outlined">confirmation_number</span>
            <span class="font-medium">My Tickets</span>
        </a>
        @endauth
        
        <div class="mt-6 mb-2 px-3">
            <p class="text-xs font-semibold text-text-secondary uppercase tracking-wider">Categories</p>
        </div>
        
        @foreach($categories->take(6) as $category)
        <a class="flex items-center gap-3 px-3 py-2 rounded-lg {{ request('category') === $category ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-card-dark hover:text-white' }} transition-colors" href="{{ route('frontend.events.index', ['category' => $category]) }}">
            <span class="material-symbols-outlined text-lg">
                @switch($category)
                    @case('concert')
                        mic
                        @break
                    @case('festival')
                        celebration
                        @break
                    @case('meetup')
                        groups
                        @break
                    @case('workshop')
                        school
                        @break
                    @case('party')
                        nightlife
                        @break
                    @default
                        event
                @endswitch
            </span>
            <span class="font-medium text-sm">{{ ucfirst($category) }}</span>
        </a>
        @endforeach
    </nav>
    
    <div class="p-4 border-t border-border-dark">
        @auth
        <div class="flex items-center gap-3 px-3 py-2">
            @if(auth()->user()->avatar_url)
            <div class="size-8 rounded-full bg-cover bg-center" style="background-image: url('{{ auth()->user()->avatar_url }}');"></div>
            @else
            <div class="size-8 rounded-full bg-card-dark flex items-center justify-center">
                <span class="material-symbols-outlined text-text-secondary text-[18px]">person</span>
            </div>
            @endif
            <div class="flex flex-col">
                <p class="text-sm font-medium text-white">{{ auth()->user()->name }}</p>
                <p class="text-xs text-text-secondary">Event Explorer</p>
            </div>
        </div>
        @else
        <a href="{{ route('login') }}" class="flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-white transition-colors">
            <span class="material-symbols-outlined">login</span>
            <span class="font-medium text-sm">Sign In</span>
        </a>
        @endauth
    </div>
</aside>

<!-- Main Content Wrapper -->
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background-dark">
    <!-- Top Header -->
    <header class="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-background-dark flex-shrink-0 z-20">
        <!-- Mobile Menu Toggle -->
        <button class="md:hidden text-white mr-4" @click="mobileMenuOpen = !mobileMenuOpen">
            <span class="material-symbols-outlined">menu</span>
        </button>
        
        <!-- Search Bar -->
        <form method="GET" action="{{ route('frontend.events.index') }}" class="hidden md:flex flex-1 max-w-md">
            <div class="relative w-full">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-text-secondary">search</span>
                </div>
                <input name="search" value="{{ request('search') }}" class="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-card-dark text-white placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm" placeholder="Search events, venues, cities..." type="text"/>
            </div>
        </form>
        
        <!-- Right Actions -->
        <div class="flex items-center gap-4">
            <a href="{{ route('frontend.home') }}" class="text-text-secondary hover:text-white transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined">home</span>
                <span class="hidden sm:inline text-sm">Home</span>
            </a>
            <div class="w-px h-6 bg-border-dark mx-1"></div>
            @auth
            <button class="relative p-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-card-dark">
                <span class="material-symbols-outlined">notifications</span>
            </button>
            @else
            <a href="{{ route('login') }}" class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                Sign In
            </a>
            @endauth
        </div>
    </header>
    
    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-[1400px] mx-auto flex flex-col gap-8">
            
            <!-- Page Heading & Actions -->
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 class="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <span class="material-symbols-outlined text-primary text-4xl">celebration</span>
                        Music Events
                    </h2>
                    <p class="text-text-secondary mt-1">Discover and attend amazing live music experiences</p>
                </div>
                @if(request()->hasAny(['search', 'category', 'city', 'date_from', 'price_max']))
                <a href="{{ route('frontend.events.index') }}" class="bg-card-dark hover:bg-border-dark text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors border border-border-dark">
                    <span class="material-symbols-outlined">refresh</span>
                    Clear Filters
                </a>
                @endif
            </div>
            
            @php
                $upcomingCount = $events->where('starts_at', '>=', now())->count();
                $thisWeekCount = $events->where('starts_at', '>=', now())->where('starts_at', '<=', now()->addWeek())->count();
                $freeEventsCount = $events->filter(function($event) {
                    $cheapest = $event->tickets->sortBy('price_ugx')->first();
                    return $cheapest && $cheapest->price_ugx == 0;
                })->count();
            @endphp
            
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Stat Card 1 -->
                <div class="bg-card-dark border border-border-dark rounded-xl p-5 flex flex-col justify-between h-32 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div class="flex justify-between items-start">
                        <p class="text-text-secondary text-sm font-medium group-hover:text-primary transition-colors">Total Events</p>
                        <span class="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">event</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <h3 class="text-3xl font-bold text-white">{{ $events->total() }}</h3>
                        <span class="text-xs text-text-secondary">Available</span>
                    </div>
                </div>
                
                <!-- Stat Card 2 -->
                <div class="bg-card-dark border border-border-dark rounded-xl p-5 flex flex-col justify-between h-32 hover:border-status-green/50 transition-colors cursor-pointer group">
                    <div class="flex justify-between items-start">
                        <p class="text-text-secondary text-sm font-medium group-hover:text-status-green transition-colors">This Week</p>
                        <span class="material-symbols-outlined text-status-green bg-status-green/10 p-1.5 rounded-lg">date_range</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <h3 class="text-3xl font-bold text-white">{{ $thisWeekCount }}</h3>
                        <span class="text-xs text-text-secondary">Upcoming</span>
                    </div>
                </div>
                
                <!-- Stat Card 3 -->
                <div class="bg-card-dark border border-border-dark rounded-xl p-5 flex flex-col justify-between h-32 hover:border-status-blue/50 transition-colors cursor-pointer group">
                    <div class="flex justify-between items-start">
                        <p class="text-text-secondary text-sm font-medium group-hover:text-status-blue transition-colors">Categories</p>
                        <span class="material-symbols-outlined text-status-blue bg-status-blue/10 p-1.5 rounded-lg">category</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <h3 class="text-3xl font-bold text-white">{{ $categories->count() }}</h3>
                        <span class="text-xs text-text-secondary">Types</span>
                    </div>
                </div>
                
                <!-- Stat Card 4 -->
                <div class="bg-card-dark border border-border-dark rounded-xl p-5 flex flex-col justify-between h-32 hover:border-status-purple/50 transition-colors cursor-pointer group">
                    <div class="flex justify-between items-start">
                        <p class="text-text-secondary text-sm font-medium group-hover:text-status-purple transition-colors">Cities</p>
                        <span class="material-symbols-outlined text-status-purple bg-status-purple/10 p-1.5 rounded-lg">location_city</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <h3 class="text-3xl font-bold text-white">{{ $cities->count() }}</h3>
                        <span class="text-xs text-text-secondary">Locations</span>
                    </div>
                </div>
            </div>
            
            <!-- Filters Section -->
            <div x-data="{ showFilters: false }" class="bg-card-dark border border-border-dark rounded-xl p-5">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white font-semibold flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">filter_list</span>
                        Filter Events
                    </h3>
                    <button @click="showFilters = !showFilters" class="text-text-secondary hover:text-white text-sm flex items-center gap-1 transition-colors md:hidden">
                        <span x-text="showFilters ? 'Hide' : 'Show'">Show</span>
                        <span class="material-symbols-outlined text-sm" x-text="showFilters ? 'expand_less' : 'expand_more'">expand_more</span>
                    </button>
                </div>
                
                <form method="GET" action="{{ route('frontend.events.index') }}" class="space-y-4" :class="{ 'hidden md:block': !showFilters }">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <!-- Category -->
                        <div>
                            <label class="block text-xs text-text-secondary mb-1.5 font-medium">Category</label>
                            <select name="category" class="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                <option value="">All Categories</option>
                                @foreach($categories as $category)
                                    <option value="{{ $category }}" {{ request('category') === $category ? 'selected' : '' }}>
                                        {{ ucfirst($category) }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        
                        <!-- City -->
                        <div>
                            <label class="block text-xs text-text-secondary mb-1.5 font-medium">City</label>
                            <select name="city" class="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                <option value="">All Cities</option>
                                @foreach($cities as $city)
                                    <option value="{{ $city }}" {{ request('city') === $city ? 'selected' : '' }}>
                                        {{ $city }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        
                        <!-- Date From -->
                        <div>
                            <label class="block text-xs text-text-secondary mb-1.5 font-medium">From Date</label>
                            <input type="date" name="date_from" value="{{ request('date_from') }}" class="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                        </div>
                        
                        <!-- Date To -->
                        <div>
                            <label class="block text-xs text-text-secondary mb-1.5 font-medium">To Date</label>
                            <input type="date" name="date_to" value="{{ request('date_to') }}" class="w-full bg-background-dark border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                        </div>
                        
                        <!-- Submit -->
                        <div class="flex items-end">
                            <button type="submit" class="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                                <span class="material-symbols-outlined text-lg">search</span>
                                Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            <!-- Tabs & Content -->
            <div class="flex flex-col gap-6">
                <!-- Tabs Header -->
                <div class="border-b border-border-dark">
                    <nav aria-label="Tabs" class="flex gap-8 overflow-x-auto pb-px scrollbar-hide">
                        <a class="border-b-2 {{ !request('tab') || request('tab') === 'all' ? 'border-primary text-white font-bold' : 'border-transparent text-text-secondary hover:text-white hover:border-text-secondary' }} pb-3 px-1 text-sm whitespace-nowrap transition-colors" href="{{ route('frontend.events.index') }}">
                            All Events
                            <span class="ml-2 bg-{{ !request('tab') || request('tab') === 'all' ? 'primary/20 text-primary' : 'border-dark text-text-secondary' }} py-0.5 px-2 rounded-full text-xs">{{ $events->total() }}</span>
                        </a>
                        <a class="border-b-2 {{ request('tab') === 'upcoming' ? 'border-primary text-white font-bold' : 'border-transparent text-text-secondary hover:text-white hover:border-text-secondary' }} pb-3 px-1 text-sm whitespace-nowrap transition-colors" href="{{ route('frontend.events.index', ['tab' => 'upcoming']) }}">
                            Upcoming
                            <span class="ml-2 bg-border-dark text-text-secondary py-0.5 px-2 rounded-full text-xs">{{ $upcomingCount }}</span>
                        </a>
                        <a class="border-b-2 {{ request('tab') === 'thisweek' ? 'border-primary text-white font-bold' : 'border-transparent text-text-secondary hover:text-white hover:border-text-secondary' }} pb-3 px-1 text-sm whitespace-nowrap transition-colors" href="{{ route('frontend.events.index', ['tab' => 'thisweek']) }}">
                            This Week
                            <span class="ml-2 bg-border-dark text-text-secondary py-0.5 px-2 rounded-full text-xs">{{ $thisWeekCount }}</span>
                        </a>
                        <a class="border-b-2 {{ request('tab') === 'free' ? 'border-primary text-white font-bold' : 'border-transparent text-text-secondary hover:text-white hover:border-text-secondary' }} pb-3 px-1 text-sm whitespace-nowrap transition-colors" href="{{ route('frontend.events.index', ['tab' => 'free']) }}">
                            Free Events
                            <span class="ml-2 bg-border-dark text-text-secondary py-0.5 px-2 rounded-full text-xs">{{ $freeEventsCount }}</span>
                        </a>
                    </nav>
                </div>
                
                <!-- Events Grid -->
                @if($events->count() > 0)
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    @foreach($events as $event)
                    @php
                        $cheapestTicket = $event->tickets->sortBy('price_ugx')->first();
                        $isPast = $event->starts_at->isPast();
                        $isToday = $event->starts_at->isToday();
                        $daysUntil = now()->diffInDays($event->starts_at, false);
                    @endphp
                    
                    <a href="{{ route('frontend.events.show', $event->id) }}" class="event-card bg-card-dark border border-border-dark rounded-xl overflow-hidden flex flex-col shadow-lg hover:shadow-xl hover:border-primary/30 transition-all">
                        <!-- Event Image -->
                        <div class="relative aspect-video overflow-hidden">
                            @php
                                $eventImage = $event->artwork ?? $event->banner ?? $event->cover_image ?? null;
                            @endphp
                            @if($eventImage)
                                <img src="{{ asset('storage/' . $eventImage) }}" 
                                     alt="{{ $event->title }}" 
                                     class="event-cover w-full h-full object-cover">
                            @else
                                <div class="w-full h-full bg-gradient-to-br from-primary/40 to-orange-600/40 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-white/60 text-6xl">event</span>
                                </div>
                            @endif
                            
                            <!-- Date Badge -->
                            <div class="absolute top-3 left-3 bg-background-dark/90 backdrop-blur-sm rounded-lg px-3 py-2 text-center min-w-[60px]">
                                <p class="text-primary font-bold text-lg leading-none">{{ $event->starts_at->format('d') }}</p>
                                <p class="text-white text-xs font-medium">{{ $event->starts_at->format('M') }}</p>
                            </div>
                            
                            <!-- Price Badge -->
                            <div class="absolute top-3 right-3">
                                @if($cheapestTicket)
                                    <span class="px-3 py-1.5 {{ $cheapestTicket->price_ugx > 0 ? 'bg-primary' : 'bg-status-green' }} rounded-full text-white text-xs font-bold shadow-lg">
                                        @if($cheapestTicket->price_ugx > 0)
                                            From UGX {{ number_format($cheapestTicket->price_ugx) }}
                                        @else
                                            FREE
                                        @endif
                                    </span>
                                @endif
                            </div>
                            
                            <!-- Status Badge -->
                            @if($isPast)
                                <div class="absolute bottom-3 left-3">
                                    <span class="px-2.5 py-1 bg-status-red/90 rounded-full text-white text-xs font-bold">Past Event</span>
                                </div>
                            @elseif($isToday)
                                <div class="absolute bottom-3 left-3">
                                    <span class="px-2.5 py-1 bg-status-green/90 rounded-full text-white text-xs font-bold flex items-center gap-1">
                                        <span class="size-1.5 rounded-full bg-white animate-pulse"></span>
                                        Today
                                    </span>
                                </div>
                            @elseif($daysUntil <= 7 && $daysUntil > 0)
                                <div class="absolute bottom-3 left-3">
                                    <span class="px-2.5 py-1 bg-status-orange/90 rounded-full text-white text-xs font-bold">In {{ $daysUntil }} days</span>
                                </div>
                            @endif
                        </div>
                        
                        <!-- Event Details -->
                        <div class="p-5 flex-1 flex flex-col gap-3">
                            <!-- Category -->
                            @if($event->category)
                                <span class="text-xs font-semibold text-primary uppercase tracking-wider">{{ $event->category }}</span>
                            @endif
                            
                            <!-- Title -->
                            <h3 class="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {{ $event->title }}
                            </h3>
                            
                            <!-- Date & Time -->
                            <div class="flex items-center gap-2 text-sm">
                                <span class="material-symbols-outlined text-primary text-lg">schedule</span>
                                <div>
                                    <p class="text-white font-medium">{{ $event->starts_at->format('l, M j, Y') }}</p>
                                    <p class="text-text-secondary text-xs">{{ $event->starts_at->format('g:i A') }}</p>
                                </div>
                            </div>
                            
                            <!-- Location -->
                            <div class="flex items-center gap-2 text-sm">
                                <span class="material-symbols-outlined text-status-blue text-lg">location_on</span>
                                <div class="flex-1 min-w-0">
                                    <p class="text-white font-medium truncate">{{ $event->location?->name ?? $event->venue_name ?? 'TBA' }}</p>
                                    @if($event->location?->city ?? $event->city)
                                        <p class="text-text-secondary text-xs truncate">{{ $event->location?->city ?? $event->city }}</p>
                                    @endif
                                </div>
                            </div>
                            
                            <!-- Footer -->
                            <div class="mt-auto pt-4 border-t border-border-dark/50 flex items-center justify-between">
                                <div class="flex items-center gap-3 text-xs text-text-secondary">
                                    @if($event->attendees_count > 0)
                                        <span class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-sm">people</span>
                                            {{ number_format($event->attendees_count) }} Going
                                        </span>
                                    @endif
                                    @if($event->tickets_count > 0)
                                        <span class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-sm">confirmation_number</span>
                                            {{ $event->tickets_count }} Tickets
                                        </span>
                                    @endif
                                </div>
                                <span class="text-primary text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                    View
                                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                                </span>
                            </div>
                        </div>
                    </a>
                    @endforeach
                </div>
                
                <!-- Pagination -->
                @if($events->hasPages())
                <div class="mt-6 flex justify-center">
                    <nav class="flex items-center gap-2">
                        @if($events->onFirstPage())
                            <span class="px-3 py-2 text-text-secondary cursor-not-allowed">Previous</span>
                        @else
                            <a href="{{ $events->previousPageUrl() }}" class="px-3 py-2 bg-card-dark border border-border-dark rounded-lg text-white hover:bg-border-dark transition-colors">Previous</a>
                        @endif
                        
                        <span class="px-4 py-2 bg-primary rounded-lg text-white font-bold">{{ $events->currentPage() }}</span>
                        <span class="text-text-secondary">of {{ $events->lastPage() }}</span>
                        
                        @if($events->hasMorePages())
                            <a href="{{ $events->nextPageUrl() }}" class="px-3 py-2 bg-card-dark border border-border-dark rounded-lg text-white hover:bg-border-dark transition-colors">Next</a>
                        @else
                            <span class="px-3 py-2 text-text-secondary cursor-not-allowed">Next</span>
                        @endif
                    </nav>
                </div>
                @endif
                
                @else
                <!-- Empty State -->
                <div class="col-span-full bg-card-dark border border-border-dark rounded-xl p-12 text-center">
                    <span class="material-symbols-outlined text-text-secondary text-6xl mb-4 block">event_busy</span>
                    <h3 class="text-xl font-semibold text-white mb-2">No Events Found</h3>
                    <p class="text-text-secondary mb-6 max-w-md mx-auto">
                        @if(request()->hasAny(['search', 'category', 'city', 'date_from', 'price_max']))
                            No events match your search criteria. Try adjusting your filters.
                        @else
                            There are no upcoming events at the moment. Check back soon!
                        @endif
                    </p>
                    @if(request()->hasAny(['search', 'category', 'city', 'date_from', 'price_max']))
                        <a href="{{ route('frontend.events.index') }}" class="inline-block px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors">
                            Clear Filters
                        </a>
                    @endif
                </div>
                @endif
            </div>
            
            <!-- Pro Tip Section -->
            <div class="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-4 mt-2">
                <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">tips_and_updates</span>
                <div>
                    <h4 class="text-white font-medium">Pro Tip: Book Early</h4>
                    <p class="text-text-secondary text-sm mt-1">Events often sell out quickly! Book your tickets early to secure the best seats at the best prices.</p>
                </div>
                <button class="ml-auto text-text-secondary hover:text-white" onclick="this.parentElement.remove()">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
        </div>
    </div>
</main>

<!-- Mobile Menu Overlay (hidden by default) -->
<div x-data="{ mobileMenuOpen: false }" x-show="mobileMenuOpen" @click.away="mobileMenuOpen = false" class="fixed inset-0 z-50 md:hidden" style="display: none;">
    <div class="absolute inset-0 bg-black/50" @click="mobileMenuOpen = false"></div>
    <aside class="absolute left-0 top-0 w-64 h-full bg-background-dark border-r border-border-dark overflow-y-auto">
        <!-- Mobile sidebar content (duplicate of desktop sidebar) -->
    </aside>
</div>

</body>
</html>
