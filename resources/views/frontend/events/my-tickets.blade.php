@extends('frontend.layouts.events')

@section('title', 'My Tickets')

@section('content')
<div class="p-6">
    <!-- Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">My Tickets</h1>
        <p class="text-gray-400">View and manage all your event tickets</p>
    </div>

    @if($attendees->count() > 0)
        <!-- Tickets List -->
        <div class="space-y-6 mb-8">
            @foreach($attendees as $attendee)
                <div class="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
                    <div class="p-6">
                        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <!-- Event Image & Info -->
                            <div class="lg:col-span-2">
                                <div class="flex gap-4">
                                    <!-- Event Image -->
                                    <div class="flex-shrink-0">
                                        @if($attendee->event->banner_image)
                                            <img src="{{ asset('storage/' . $attendee->event->banner_image) }}"
                                                 alt="{{ $attendee->event->title }}"
                                                 class="w-20 h-20 object-cover rounded-lg">
                                        @else
                                            <div class="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                                                <span class="material-icons-round text-gray-500 text-2xl">event</span>
                                            </div>
                                        @endif
                                    </div>

                                    <!-- Event Details -->
                                    <div class="min-w-0 flex-1">
                                        <h3 class="text-white font-semibold text-lg mb-1 truncate">
                                            <a href="{{ route('frontend.events.show', $attendee->event) }}"
                                               class="hover:text-green-400 transition-colors">
                                                {{ $attendee->event->title }}
                                            </a>
                                        </h3>
                                        <p class="text-gray-400 text-sm mb-2">{{ $attendee->event->category }}</p>

                                        <!-- Date & Time -->
                                        <div class="flex items-center gap-2 text-gray-300 text-sm mb-1">
                                            <span class="material-icons-round text-xs">event</span>
                                            <span>{{ $attendee->event->formatted_date }}</span>
                                        </div>

                                        @if($attendee->event->formatted_time)
                                            <div class="flex items-center gap-2 text-gray-300 text-sm mb-1">
                                                <span class="material-icons-round text-xs">schedule</span>
                                                <span>{{ $attendee->event->formatted_time }}</span>
                                            </div>
                                        @endif

                                        <!-- Location -->
                                        <div class="flex items-center gap-2 text-gray-300 text-sm">
                                            <span class="material-icons-round text-xs">location_on</span>
                                            <span class="truncate">{{ $attendee->event->venue_name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Ticket Info -->
                            <div>
                                <h4 class="text-white font-medium mb-3">Ticket Details</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Type:</span>
                                        <span class="text-white">{{ $attendee->ticket_type }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Code:</span>
                                        <span class="text-white font-mono text-xs">{{ $attendee->ticket_code }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Quantity:</span>
                                        <span class="text-white">{{ $attendee->quantity }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Amount:</span>
                                        <span class="text-white">{{ $attendee->formatted_amount }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Registered:</span>
                                        <span class="text-white">{{ $attendee->created_at->format('M j, Y') }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Status & Actions -->
                            <div class="flex flex-col justify-between">
                                <!-- Status -->
                                <div class="mb-4">
                                    <div class="flex items-center gap-2 mb-2">
                                        @switch($attendee->status)
                                            @case('confirmed')
                                                <span class="material-icons-round text-green-400 text-sm">check_circle</span>
                                                <span class="text-green-400 font-medium">Confirmed</span>
                                                @break
                                            @case('pending')
                                                <span class="material-icons-round text-yellow-400 text-sm">schedule</span>
                                                <span class="text-yellow-400 font-medium">Pending</span>
                                                @break
                                            @case('checked_in')
                                                <span class="material-icons-round text-blue-400 text-sm">done_all</span>
                                                <span class="text-blue-400 font-medium">Checked In</span>
                                                @break
                                            @case('cancelled')
                                                <span class="material-icons-round text-red-400 text-sm">cancel</span>
                                                <span class="text-red-400 font-medium">Cancelled</span>
                                                @break
                                            @case('no_show')
                                                <span class="material-icons-round text-gray-400 text-sm">event_busy</span>
                                                <span class="text-gray-400 font-medium">No Show</span>
                                                @break
                                        @endswitch
                                    </div>

                                    @if($attendee->is_checked_in)
                                        <p class="text-gray-400 text-xs">
                                            Checked in: {{ $attendee->checked_in_at->format('M j g:i A') }}
                                        </p>
                                    @endif

                                    <!-- Payment Status -->
                                    <div class="flex items-center gap-2 mt-2">
                                        @switch($attendee->payment_status)
                                            @case('completed')
                                                <span class="material-icons-round text-green-400 text-xs">paid</span>
                                                <span class="text-green-400 text-xs">Paid</span>
                                                @break
                                            @case('pending')
                                                <span class="material-icons-round text-yellow-400 text-xs">pending</span>
                                                <span class="text-yellow-400 text-xs">Payment Pending</span>
                                                @break
                                            @case('failed')
                                                <span class="material-icons-round text-red-400 text-xs">error</span>
                                                <span class="text-red-400 text-xs">Payment Failed</span>
                                                @break
                                            @case('refunded')
                                                <span class="material-icons-round text-blue-400 text-xs">undo</span>
                                                <span class="text-blue-400 text-xs">Refunded</span>
                                                @break
                                        @endswitch
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="space-y-2">
                                    @if($attendee->is_confirmed)
                                        <a href="{{ route('frontend.events.ticket', $attendee->event) }}"
                                           class="block w-full bg-green-500 text-black text-center font-medium py-2 px-4 rounded-lg hover:bg-green-400 transition-colors text-sm">
                                            View Ticket
                                        </a>
                                    @endif

                                    @if($attendee->payment_status === 'pending')
                                        <a href="{{ route('frontend.events.checkout', $attendee->event) }}"
                                           class="block w-full bg-yellow-600 text-white text-center font-medium py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors text-sm">
                                            Complete Payment
                                        </a>
                                    @endif

                                    @if($attendee->can_cancel)
                                        <form action="{{ route('frontend.events.cancel', $attendee->event) }}" method="POST" class="inline w-full"
                                              onsubmit="return confirm('Are you sure you want to cancel this registration?')">
                                            @csrf
                                            <button type="submit"
                                                    class="w-full bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-500 transition-colors text-sm">
                                                Cancel
                                            </button>
                                        </form>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Event Status Banner -->
                    @if($attendee->event->is_past)
                        <div class="bg-gray-700 border-t border-gray-600 px-6 py-2">
                            <p class="text-gray-400 text-sm">This event has ended</p>
                        </div>
                    @elseif($attendee->event->is_sold_out)
                        <div class="bg-red-900/30 border-t border-red-500/30 px-6 py-2">
                            <p class="text-red-400 text-sm">This event is sold out</p>
                        </div>
                    @elseif($attendee->event->starts_at <= now()->addDays(7))
                        <div class="bg-green-900/30 border-t border-green-500/30 px-6 py-2">
                            <p class="text-green-400 text-sm">This event is coming up soon!</p>
                        </div>
                    @endif
                </div>
            @endforeach
        </div>

        <!-- Pagination -->
        @if($attendees->hasPages())
            <div class="flex justify-center">
                {{ $attendees->links() }}
            </div>
        @endif
    @else
        <!-- No Tickets -->
        <div class="text-center py-16">
            <div class="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-icons-round text-gray-500 text-4xl">confirmation_number</span>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
            <p class="text-gray-400 mb-6">You haven't registered for any events yet. Discover amazing events and get your tickets!</p>
            <a href="{{ route('frontend.events.index') }}"
               class="inline-flex items-center gap-2 bg-green-500 text-black font-medium py-2.5 px-6 rounded-lg hover:bg-green-400 transition-colors">
                <span class="material-icons-round text-sm">explore</span>
                Browse Events
            </a>
        </div>
    @endif

    <!-- Quick Stats -->
    @if($attendees->count() > 0)
        <div class="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-white">{{ $attendees->total() }}</p>
                <p class="text-gray-400 text-sm">Total Tickets</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-green-400">{{ $attendees->where('status', 'confirmed')->count() }}</p>
                <p class="text-gray-400 text-sm">Confirmed</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-blue-400">{{ $attendees->where('status', 'checked_in')->count() }}</p>
                <p class="text-gray-400 text-sm">Attended</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-yellow-400">{{ $attendees->where('status', 'pending')->count() }}</p>
                <p class="text-gray-400 text-sm">Pending</p>
            </div>
        </div>
    @endif
</div>
@endsection