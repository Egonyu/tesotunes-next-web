@extends('layouts.admin')

@section('title', 'Event Details - ' . ($event->title ?? 'Event'))

@section('page-header')
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4">
        <div>
            <div class="flex items-center gap-3 mb-2">
                <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $event->title ?? 'Event Details' }}</h1>
                <span class="badge rounded-full text-xs font-semibold
                    {{ $event->status === 'draft' ? 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100' : '' }}
                    {{ $event->status === 'published' ? 'bg-success/10 text-success' : '' }}
                    {{ $event->status === 'completed' ? 'bg-info/10 text-info' : '' }}
                    {{ $event->status === 'cancelled' ? 'bg-error/10 text-error' : '' }}">
                    {{ ucfirst($event->status ?? 'draft') }}
                </span>
            </div>
            <p class="text-slate-500 dark:text-navy-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ \Carbon\Carbon::parse($event->starts_at)->format('l, F j, Y \a\t g:i A') }}
            </p>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button onclick="openQRModal()" class="btn bg-info text-white hover:bg-info/90">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR Code
            </button>
            <a href="{{ route('admin.events.edit', $event->id) }}" class="btn bg-primary text-white hover:bg-primary-focus flex-1 sm:flex-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Event
            </a>
            <a href="{{ route('admin.events.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span class="hidden sm:inline ml-2">Back</span>
            </a>
        </div>
    </div>
@endsection

@section('content')
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
            
            <!-- Event Cover Image -->
            @if($event->cover_image)
            <div class="card overflow-hidden">
                <div class="relative group">
                    <img src="{{ asset('storage/' . $event->cover_image) }}" 
                         alt="{{ $event->title }}" 
                         class="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                         onerror="this.src='{{ asset('images/placeholder-event.jpg') }}'">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h2 class="text-3xl font-bold mb-2 drop-shadow-lg">{{ $event->title }}</h2>
                        <p class="text-sm opacity-90 drop-shadow-md">{{ $event->event_type ? ucfirst($event->event_type) : 'Event' }}</p>
                    </div>
                </div>
            </div>
            @endif

            <!-- Event Description -->
            <div class="card">
                <div class="p-6">
                    <div class="flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">About This Event</h3>
                    </div>
                    <p class="text-slate-600 dark:text-navy-300 leading-relaxed whitespace-pre-line">{{ $event->description ?? 'No description provided.' }}</p>
                </div>
            </div>

            <!-- Event Details -->
            <div class="card">
                <div class="p-6">
                    <div class="flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Event Details</h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Date & Time -->
                        <div class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div class="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Date & Time</p>
                                <p class="font-medium text-slate-700 dark:text-navy-100">{{ \Carbon\Carbon::parse($event->starts_at)->format('M j, Y') }}</p>
                                <p class="text-sm text-slate-600 dark:text-navy-300">{{ \Carbon\Carbon::parse($event->starts_at)->format('g:i A') }}</p>
                            </div>
                        </div>

                        <!-- Location -->
                        <div class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div class="size-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Location</p>
                                <p class="font-medium text-slate-700 dark:text-navy-100">{{ $event->venue_name }}</p>
                                <p class="text-sm text-slate-600 dark:text-navy-300">{{ $event->city }}, {{ $event->country ?? 'Uganda' }}</p>
                            </div>
                        </div>

                        <!-- Capacity -->
                        @if($event->total_tickets > 0)
                        <div class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div class="size-10 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Total Capacity</p>
                                <p class="font-medium text-slate-700 dark:text-navy-100">{{ number_format($event->total_tickets) }} attendees</p>
                                <p class="text-sm text-slate-600 dark:text-navy-300">{{ $event->tickets_sold ?? 0 }} sold</p>
                            </div>
                        </div>
                        @endif

                        <!-- Event Type -->
                        <div class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
                            <div class="size-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Event Type</p>
                                <p class="font-medium text-slate-700 dark:text-navy-100">{{ ucfirst($event->event_type ?? 'Concert') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ticket Tiers -->
            @if($tickets->count() > 0)
            <div class="card">
                <div class="p-6">
                    <div class="flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Available Tickets</h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @foreach($tickets as $ticket)
                        <div class="relative overflow-hidden rounded-lg border-2 border-slate-200 dark:border-navy-600 hover:border-primary dark:hover:border-accent transition-all duration-300 group">
                            <div class="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <div class="relative p-5">
                                <div class="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 class="font-semibold text-slate-800 dark:text-navy-50 text-lg">{{ $ticket->ticket_type }}</h4>
                                        @if($ticket->description)
                                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">{{ Str::limit($ticket->description, 50) }}</p>
                                        @endif
                                    </div>
                                    <span class="badge rounded-full text-xs font-semibold {{ $ticket->is_active ? 'bg-success/10 text-success' : 'bg-slate-150 text-slate-600' }}">
                                        {{ $ticket->is_active ? 'On Sale' : 'Inactive' }}
                                    </span>
                                </div>
                                
                                <div class="flex items-end justify-between">
                                    <div>
                                        <p class="text-2xl font-bold text-primary dark:text-accent">
                                            @if($ticket->price > 0)
                                                UGX {{ number_format($ticket->price, 0) }}
                                            @else
                                                Free
                                            @endif
                                        </p>
                                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">
                                            {{ $ticket->quantity_available ?? 0 }} / {{ $ticket->quantity_total ?? 0 }} available
                                        </p>
                                    </div>
                                    
                                    @php
                                        $percentSold = $ticket->quantity_total > 0 ? (($ticket->quantity_sold ?? 0) / $ticket->quantity_total) * 100 : 0;
                                    @endphp
                                    <div class="text-right">
                                        <p class="text-sm font-medium text-slate-700 dark:text-navy-100">{{ $ticket->quantity_sold ?? 0 }} sold</p>
                                        <p class="text-xs text-slate-500 dark:text-navy-400">{{ round($percentSold) }}% sold</p>
                                    </div>
                                </div>
                                
                                <!-- Progress bar -->
                                <div class="mt-3 w-full bg-slate-200 rounded-full h-1.5 dark:bg-navy-600">
                                    <div class="bg-primary dark:bg-accent h-1.5 rounded-full transition-all duration-500" style="width: {{ round($percentSold) }}%"></div>
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>
            @else
            <div class="card">
                <div class="p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto text-slate-300 dark:text-navy-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <p class="text-slate-500 dark:text-navy-400 mb-2">No ticket tiers configured</p>
                    <p class="text-sm text-slate-400 dark:text-navy-500 mb-4">This is a free event or tickets haven't been set up yet</p>
                    <a href="{{ route('admin.events.edit', $event->id) }}" class="btn bg-primary text-white hover:bg-primary-focus text-sm">
                        Set Up Tickets
                    </a>
                </div>
            </div>
            @endif

        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            
            <!-- Quick Stats -->
            <div class="card">
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Quick Stats</h3>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Total Tickets -->
                        <div class="text-center p-4 bg-primary/5 rounded-lg">
                            <p class="text-2xl font-bold text-primary dark:text-accent">{{ number_format($event->total_tickets ?? 0) }}</p>
                            <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">Total Tickets</p>
                        </div>
                        
                        <!-- Tickets Sold -->
                        <div class="text-center p-4 bg-success/5 rounded-lg">
                            <p class="text-2xl font-bold text-success">{{ number_format($event->tickets_sold ?? 0) }}</p>
                            <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">Tickets Sold</p>
                        </div>
                        
                        <!-- Attendees -->
                        <div class="text-center p-4 bg-info/5 rounded-lg">
                            <p class="text-2xl font-bold text-info">{{ number_format($attendeesCount) }}</p>
                            <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">Attendees</p>
                        </div>
                        
                        <!-- Revenue -->
                        <div class="text-center p-4 bg-warning/5 rounded-lg">
                            @php
                                $totalRevenue = 0;
                                if ($tickets && count($tickets) > 0) {
                                    foreach ($tickets as $ticket) {
                                        $totalRevenue += (floatval($ticket->price ?? 0) * intval($ticket->quantity_sold ?? 0));
                                    }
                                }
                                $revenueDisplay = $totalRevenue > 0 ? number_format($totalRevenue / 1000, 1) : '0';
                            @endphp
                            <p class="text-2xl font-bold text-warning">{{ $revenueDisplay }}K</p>
                            <p class="text-xs text-slate-600 dark:text-navy-300 mt-1">Revenue (UGX)</p>
                        </div>
                    </div>
                    
                    <!-- Progress -->
                    @if(isset($event->total_tickets) && $event->total_tickets > 0)
                    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-navy-600">
                        <div class="flex items-center justify-between text-sm mb-2">
                            <span class="text-slate-600 dark:text-navy-300">Sales Progress</span>
                            @php
                                $ticketsSold = intval($event->tickets_sold ?? 0);
                                $totalTickets = intval($event->total_tickets ?? 1);
                                $progress = $totalTickets > 0 ? ($ticketsSold / $totalTickets) * 100 : 0;
                            @endphp
                            <span class="font-semibold text-slate-700 dark:text-navy-100">{{ round($progress) }}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2 dark:bg-navy-600">
                            <div class="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500" style="width: {{ round($progress) }}%"></div>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-navy-400 mt-2 text-center">
                            {{ number_format(max(0, $totalTickets - $ticketsSold)) }} tickets remaining
                        </p>
                    </div>
                    @endif
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Quick Actions</h3>
                    
                    <div class="space-y-2">
                        <!-- View Attendees -->
                        <form action="{{ route('admin.events.attendees', $event->id) }}" method="GET" class="w-full">
                            <button type="submit" class="btn w-full bg-primary text-white hover:bg-primary-focus justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                View Attendees ({{ $attendeesCount }})
                            </button>
                        </form>
                        
                        <!-- Download Report -->
                        <form action="{{ route('admin.events.report', $event->id) }}" method="GET" class="w-full">
                            <button type="submit" class="btn w-full border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Report
                            </button>
                        </form>
                        
                        <!-- Send Notification -->
                        <button type="button" onclick="openNotificationModal()" class="btn w-full border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Send Notification
                        </button>
                        
                        <!-- Publish/Unpublish -->
                        @if($event->status === 'draft')
                        <form action="{{ route('admin.events.publish', $event->id) }}" method="POST" class="w-full">
                            @csrf
                            <button type="submit" class="btn w-full bg-success text-white hover:bg-success/90 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Publish Event
                            </button>
                        </form>
                        @elseif($event->status === 'published')
                        <form action="{{ route('admin.events.unpublish', $event->id) }}" method="POST" class="w-full">
                            @csrf
                            <button type="submit" class="btn w-full bg-warning text-white hover:bg-warning/90 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Unpublish Event
                            </button>
                        </form>
                        @endif
                        
                        <!-- Delete Event -->
                        <form action="{{ route('admin.events.destroy', $event->id) }}" method="POST" class="w-full" onsubmit="return confirm('Are you sure you want to delete this event? This action cannot be undone.');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn w-full bg-error text-white hover:bg-error/90 justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Event
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Organizer Info -->
            @if($organizer ?? false)
            <div class="card">
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Organizer</h3>
                    
                    <div class="flex items-center gap-3">
                        <div class="avatar size-12">
                            <img class="rounded-full" src="{{ $organizer->avatar ?? asset('images/default-user.png') }}" alt="{{ $organizer->name }}"
                                 onerror="this.src='{{ asset('images/default-user.png') }}'">
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-slate-700 dark:text-navy-100">{{ $organizer->name }}</p>
                            <p class="text-sm text-slate-500 dark:text-navy-400">{{ $organizer->email }}</p>
                        </div>
                    </div>
                    
                    @if($organizer->phone ?? false)
                    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-navy-600">
                        <p class="text-xs text-slate-500 dark:text-navy-400 mb-1">Contact</p>
                        <p class="text-sm text-slate-700 dark:text-navy-100">{{ $organizer->phone }}</p>
                    </div>
                    @endif
                </div>
            </div>
            @endif

        </div>
    </div>

    <!-- Notification Modal -->
    <div id="notificationModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick="closeNotificationModal(event)">
        <div class="bg-white dark:bg-navy-800 rounded-lg shadow-xl max-w-md w-full mx-4" onclick="event.stopPropagation()">
            <div class="p-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Send Notification to Attendees</h3>
                <form action="{{ route('admin.events.notify', $event->id) }}" method="POST">
                    @csrf
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">Message</label>
                            <textarea name="message" rows="4" class="form-input w-full" placeholder="Enter your message..."></textarea>
                        </div>
                        <div class="flex gap-2">
                            <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus flex-1">Send</button>
                            <button type="button" onclick="closeNotificationModal()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- QR Code Modal -->
    <div id="qrModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50" onclick="closeQRModal(event)">
        <div class="bg-white dark:bg-navy-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all" onclick="event.stopPropagation()">
            <div class="p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-navy-50">Event QR Code</h3>
                    <button onclick="closeQRModal()" class="btn size-8 rounded-full p-0 hover:bg-slate-100 dark:hover:bg-navy-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Event Info -->
                <div class="mb-6 p-4 bg-slate-50 dark:bg-navy-900 rounded-lg">
                    <p class="text-sm text-slate-500 dark:text-navy-400 mb-1">Event</p>
                    <p class="font-semibold text-slate-800 dark:text-navy-50">{{ $event->title }}</p>
                    <p class="text-xs text-slate-500 dark:text-navy-400 mt-1">{{ \Carbon\Carbon::parse($event->starts_at)->format('M j, Y g:i A') }}</p>
                </div>

                <!-- QR Code Display -->
                <div class="flex flex-col items-center justify-center p-6 bg-white dark:bg-navy-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-navy-500">
                    <div id="qrCodeContainer" class="mb-4">
                        <!-- QR code will be generated here -->
                    </div>
                    <p class="text-xs text-slate-500 dark:text-navy-400 text-center">
                        Scan to view event or check-in attendees
                    </p>
                </div>

                <!-- Actions -->
                <div class="mt-6 flex gap-3">
                    <button onclick="downloadQRCode()" class="btn bg-primary text-white hover:bg-primary-focus flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                    <button onclick="printQRCode()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600 flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                    </button>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
<!-- QRCode.js Library - Using cdnjs for reliability -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" 
        integrity="sha512-CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA==" 
        crossorigin="anonymous" 
        referrerpolicy="no-referrer"
        onerror="console.error('Failed to load QRCode.js')"></script>

<script>
function openNotificationModal() {
    document.getElementById('notificationModal').classList.remove('hidden');
}

function closeNotificationModal(event) {
    if (!event || event.target === event.currentTarget) {
        document.getElementById('notificationModal').classList.add('hidden');
    }
}

let currentQRCode = null;

function openQRModal() {
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        alert('QR Code library failed to load. Please refresh the page.');
        return;
    }
    
    document.getElementById('qrModal').classList.remove('hidden');
    document.getElementById('qrModal').classList.add('flex');
    
    // Clear previous QR code
    document.getElementById('qrCodeContainer').innerHTML = '';
    
    try {
        // Generate new QR code
        const eventUrl = `{{ url('/events') }}/{{ $event->id }}`;
        currentQRCode = new QRCode(document.getElementById('qrCodeContainer'), {
            text: eventUrl,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        document.getElementById('qrCodeContainer').innerHTML = '<p class="text-error">Failed to generate QR code</p>';
    }
}

function closeQRModal(event) {
    if (!event || event.target === event.currentTarget) {
        document.getElementById('qrModal').classList.add('hidden');
        document.getElementById('qrModal').classList.remove('flex');
        currentQRCode = null;
    }
}

function downloadQRCode() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    if (canvas) {
        try {
            const link = document.createElement('a');
            link.download = `event-{{ $event->id }}-{{ \Str::slug($event->title) }}-qrcode.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download QR code');
        }
    } else {
        alert('No QR code to download');
    }
}

function printQRCode() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    if (canvas) {
        try {
            const windowContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Event QR Code - {{ $event->title }}</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
                        h1 { font-size: 24px; margin-bottom: 10px; }
                        .date { font-size: 14px; color: #666; margin-bottom: 30px; }
                        img { margin: 20px auto; display: block; }
                        .info { margin-top: 20px; font-size: 12px; color: #999; }
                        .venue { font-size: 14px; color: #666; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <h1>{{ $event->title }}</h1>
                    <div class="date">{{ \Carbon\Carbon::parse($event->starts_at)->format('l, F j, Y \a\t g:i A') }}</div>
                    <div class="venue">{{ $event->venue_name }}, {{ $event->city }}</div>
                    <img src="${canvas.toDataURL()}" alt="QR Code" />
                    <div class="info">
                        <p>Scan this QR code to view event details or check-in</p>
                        <p>Event ID: {{ $event->id }}</p>
                    </div>
                </body>
                </html>
            `;
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(windowContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        } catch (error) {
            console.error('Print error:', error);
            alert('Failed to print QR code');
        }
    } else {
        alert('No QR code to print');
    }
}

// Close modals on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeNotificationModal();
        closeQRModal();
    }
});

// Log when scripts load
console.log('Event show page scripts loaded');
</script>
@endpush