@extends('frontend.layouts.events')

@section('title', $event->title . ' - Events')

@section('content')
<div class="content-container">
    <!-- Event Header -->
    <div class="mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Event Image -->
            <div class="aspect-video bg-surface-light dark:bg-surface-dark rounded-lg overflow-hidden">
                @if($event->banner_image)
                    <img src="{{ asset('storage/' . $event->banner_image) }}" alt="{{ $event->title }}"
                         class="w-full h-full object-cover">
                @else
                    <div class="w-full h-full flex items-center justify-center">
                        <span class="material-icons-round text-muted text-6xl">event</span>
                    </div>
                @endif
            </div>

            <!-- Event Info -->
            <div class="space-y-6">
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <span class="badge badge-brand">
                            {{ ucfirst($event->category) }}
                        </span>
                        @if($event->is_featured)
                            <span class="badge badge-warning">
                                Featured
                            </span>
                        @endif
                    </div>
                    <h1 class="text-3xl lg:text-4xl font-bold text-primary mb-3">{{ $event->title }}</h1>
                    <p class="text-secondary text-lg">{{ $event->description }}</p>
                </div>

                <!-- Event Details -->
                <div class="space-y-4">
                    <!-- Date & Time -->
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-lg flex items-center justify-center flex-shrink-0">
                            <span class="material-icons-round text-brand">event</span>
                        </div>
                        <div>
                            <p class="text-primary font-medium">{{ $event->formatted_date }}</p>
                            @if($event->formatted_time)
                                <p class="text-muted text-sm">{{ $event->formatted_time }}</p>
                            @endif
                        </div>
                    </div>

                    <!-- Location -->
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-lg flex items-center justify-center flex-shrink-0">
                            <span class="material-icons-round text-brand">location_on</span>
                        </div>
                        <div>
                            <p class="text-primary font-medium">{{ $event->venue_name }}</p>
                            @if($event->venue_address)
                                <p class="text-muted text-sm">{{ $event->venue_address }}</p>
                            @endif
                            @if($event->city)
                                <p class="text-muted text-sm">{{ $event->city }}</p>
                            @endif
                        </div>
                    </div>

                    <!-- Organizer -->
                    @if($event->organizer)
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-lg flex items-center justify-center flex-shrink-0">
                                <span class="material-icons-round text-brand">person</span>
                            </div>
                            <div>
                                <p class="text-primary font-medium">Organized by</p>
                                <p class="text-muted text-sm">{{ $event->organizer->name }}</p>
                            </div>
                        </div>
                    @endif

                    <!-- Attendees Count -->
                    @if($event->confirmed_attendees_count > 0)
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 bg-surface-light dark:bg-surface-dark rounded-lg flex items-center justify-center flex-shrink-0">
                                <span class="material-icons-round text-brand">people</span>
                            </div>
                            <div>
                                <p class="text-primary font-medium">{{ $event->confirmed_attendees_count }} people attending</p>
                                @if($event->capacity)
                                    <p class="text-muted text-sm">{{ $event->available_tickets }} spots remaining</p>
                                @endif
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Tickets Section -->
    @if($event->tickets->count() > 0)
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-primary mb-6">Tickets</h2>

            @if($userAttendee)
                <!-- User Already Registered -->
                <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-6">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-icons-round text-brand">check_circle</span>
                        <h3 class="text-lg font-medium text-primary">You're registered for this event!</h3>
                    </div>
                    <p class="text-secondary mb-4">
                        Status: <span class="font-medium text-brand">{{ $userAttendee->status_text }}</span>
                    </p>
                    <div class="flex gap-3">
                        @if($userAttendee->is_confirmed)
                            <a href="{{ route('frontend.events.ticket', $event) }}"
                               class="bg-brand text-black font-medium py-2.5 px-6 rounded-lg hover:bg-green-400 transition-colors">
                                View Ticket
                            </a>
                        @endif
                        @if($userAttendee->can_cancel)
                            <form action="{{ route('frontend.events.cancel', $event) }}" method="POST" class="inline"
                                  onsubmit="return confirm('Are you sure you want to cancel your registration?')">
                                @csrf
                                <button type="submit"
                                        class="bg-red-500 text-primary font-medium py-2.5 px-6 rounded-lg hover:bg-red-500 transition-colors">
                                    Cancel Registration
                                </button>
                            </form>
                        @endif
                    </div>
                </div>
            @elseif(!$event->canUserRegister(Auth::user()))
                <!-- Cannot Register -->
                <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-icons-round text-red-400">block</span>
                        <h3 class="text-lg font-medium text-primary">Registration Not Available</h3>
                    </div>
                    <p class="text-secondary">
                        @if($event->is_sold_out)
                            This event is sold out.
                        @elseif($event->is_past)
                            This event has already passed.
                        @elseif($event->registration_deadline && now()->isAfter($event->registration_deadline))
                            Registration deadline has passed.
                        @else
                            Registration is not available at this time.
                        @endif
                    </p>
                </div>
            @else
                <!-- Available Tickets -->
                <div class="space-y-4">
                    @foreach($event->tickets as $ticket)
                        @if($ticket->is_active && $ticket->is_available)
                            <div class="card rounded-lg p-6">
                                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div class="flex-1">
                                        <h3 class="text-xl font-semibold text-primary mb-2">{{ $ticket->ticket_type }}</h3>
                                        @if($ticket->description)
                                            <p class="text-secondary mb-3">{{ $ticket->description }}</p>
                                        @endif

                                        @if($ticket->perks && count($ticket->perks) > 0)
                                            <div class="mb-3">
                                                <p class="text-sm font-medium text-secondary mb-2">What's included:</p>
                                                <ul class="text-sm text-muted space-y-1">
                                                    @foreach($ticket->perks as $perk)
                                                        <li class="flex items-center gap-2">
                                                            <span class="material-icons-round text-brand text-sm">check</span>
                                                            {{ $perk }}
                                                        </li>
                                                    @endforeach
                                                </ul>
                                            </div>
                                        @endif

                                        <div class="flex items-center gap-4 text-sm text-muted">
                                            @if($ticket->quantity_available)
                                                <span>{{ $ticket->quantity_remaining }} remaining</span>
                                            @else
                                                <span>Unlimited available</span>
                                            @endif
                                            @if($ticket->max_per_order > 1)
                                                <span>Max {{ $ticket->max_per_order }} per order</span>
                                            @endif
                                        </div>
                                    </div>

                                    <div class="lg:text-right">
                                        <div class="mb-4">
                                            @if($ticket->price == 0)
                                                <p class="text-2xl font-bold text-brand">Free</p>
                                            @else
                                                <p class="text-2xl font-bold text-primary">UGX {{ number_format($ticket->price) }}</p>
                                            @endif
                                        </div>

                                        @auth
                                            @if($ticket->canPurchase(1))
                                                <form action="{{ route('frontend.events.register', $event) }}" method="POST" class="space-y-3">
                                                    @csrf
                                                    <input type="hidden" name="ticket_id" value="{{ $ticket->id }}">

                                                    @if($ticket->max_per_order > 1)
                                                        <div class="flex items-center gap-2">
                                                            <label class="text-sm text-secondary">Quantity:</label>
                                                            <select name="quantity" class="bg-surface-light dark:bg-surface-dark text-primary rounded px-3 py-1 text-sm">
                                                                @for($i = 1; $i <= min($ticket->max_per_order, $ticket->quantity_remaining ?: $ticket->max_per_order); $i++)
                                                                    <option value="{{ $i }}">{{ $i }}</option>
                                                                @endfor
                                                            </select>
                                                        </div>
                                                    @else
                                                        <input type="hidden" name="quantity" value="1">
                                                    @endif

                                                    <button type="submit"
                                                            class="w-full lg:w-auto bg-brand text-black font-medium py-2.5 px-8 rounded-lg hover:bg-green-400 transition-colors">
                                                        @if($ticket->price == 0)
                                                            Register Free
                                                        @else
                                                            Get Tickets
                                                        @endif
                                                    </button>
                                                </form>
                                            @else
                                                <button disabled
                                                        class="w-full lg:w-auto bg-gray-600 text-muted font-medium py-2.5 px-8 rounded-lg cursor-not-allowed">
                                                    @if($ticket->is_sold_out)
                                                        Sold Out
                                                    @else
                                                        Not Available
                                                    @endif
                                                </button>
                                            @endif
                                        @else
                                            <a href="{{ route('login') }}"
                                               class="block w-full lg:w-auto bg-brand text-black font-medium py-2.5 px-8 rounded-lg hover:bg-green-400 transition-colors text-center">
                                                Login to Register
                                            </a>
                                        @endauth
                                    </div>
                                </div>
                            </div>
                        @endif
                    @endforeach
                </div>
            @endif
        </div>
    @endif

    <!-- Event Description -->
    @if($event->description)
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-primary mb-4">About This Event</h2>
            <div class="card rounded-lg p-6">
                <p class="text-secondary leading-relaxed whitespace-pre-wrap">{{ $event->description }}</p>
            </div>
        </div>
    @endif

    <!-- Additional Info -->
    @if($event->requirements && count($event->requirements) > 0)
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-primary mb-4">Requirements</h2>
            <div class="card rounded-lg p-6">
                <ul class="text-secondary space-y-2">
                    @foreach($event->requirements as $requirement)
                        <li class="flex items-start gap-2">
                            <span class="material-icons-round text-yellow-400 text-sm mt-0.5">info</span>
                            {{ $requirement }}
                        </li>
                    @endforeach
                </ul>
            </div>
        </div>
    @endif

    <!-- Related Events -->
    @if($relatedEvents->count() > 0)
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-primary mb-6">You Might Also Like</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                @foreach($relatedEvents as $relatedEvent)
                    <div class="card rounded-lg overflow-hidden hover:bg-surface-light dark:bg-surface-dark transition-colors group">
                        <div class="aspect-video bg-surface-light dark:bg-surface-dark relative overflow-hidden">
                            @if($relatedEvent->banner_image)
                                <img src="{{ asset('storage/' . $relatedEvent->banner_image) }}" alt="{{ $relatedEvent->title }}"
                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            @else
                                <div class="w-full h-full flex items-center justify-center">
                                    <span class="material-icons-round text-gray-500 text-3xl">event</span>
                                </div>
                            @endif
                        </div>

                        <div class="p-4">
                            <h3 class="text-primary font-semibold mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                                <a href="{{ route('frontend.events.show', $relatedEvent) }}">{{ $relatedEvent->title }}</a>
                            </h3>
                            <p class="text-muted text-sm mb-2">{{ $relatedEvent->formatted_date }}</p>
                            <p class="text-muted text-sm">{{ $relatedEvent->venue_name }}</p>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- Back Button -->
    <div class="mb-8">
        <a href="{{ route('frontend.events.index') }}"
           class="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors">
            <span class="material-icons-round text-sm">arrow_back</span>
            Back to Events
        </a>
    </div>
</div>
@endsection