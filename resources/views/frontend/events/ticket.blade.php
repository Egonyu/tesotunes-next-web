@extends('frontend.layouts.events')

@section('title', 'Your Ticket - ' . $event->title)

@section('content')
<div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Your Ticket</h1>
        <p class="text-gray-400">Save this ticket to your device or print it for entry</p>
    </div>

    <!-- Digital Ticket -->
    <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-8">
        <!-- Ticket Header -->
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 text-black">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold mb-1">{{ $event->title }}</h2>
                    <p class="text-green-900 font-medium">{{ $attendee->eventTicket->ticket_type }}</p>
                </div>
                <div class="text-right">
                    <p class="text-green-900 text-sm font-medium">TESOTUNES</p>
                    <p class="text-green-900 text-xs">Digital Ticket</p>
                </div>
            </div>
        </div>

        <!-- Ticket Body -->
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Event Details -->
                <div class="space-y-6">
                    <!-- Event Image -->
                    @if($event->banner_image)
                        <div class="aspect-video rounded-lg overflow-hidden">
                            <img src="{{ asset('storage/' . $event->banner_image) }}" alt="{{ $event->title }}"
                                 class="w-full h-full object-cover">
                        </div>
                    @endif

                    <!-- Event Info -->
                    <div class="space-y-4">
                        <div>
                            <h3 class="text-white font-semibold mb-2">Event Details</h3>
                            <div class="space-y-2">
                                <div class="flex items-center gap-3">
                                    <span class="material-icons-round text-green-400 text-sm">event</span>
                                    <span class="text-gray-300">{{ $event->formatted_date }}</span>
                                </div>
                                @if($event->formatted_time)
                                    <div class="flex items-center gap-3">
                                        <span class="material-icons-round text-green-400 text-sm">schedule</span>
                                        <span class="text-gray-300">{{ $event->formatted_time }}</span>
                                    </div>
                                @endif
                                <div class="flex items-start gap-3">
                                    <span class="material-icons-round text-green-400 text-sm mt-0.5">location_on</span>
                                    <div class="text-gray-300">
                                        <p>{{ $event->venue_name }}</p>
                                        @if($event->venue_address)
                                            <p class="text-sm text-gray-400">{{ $event->venue_address }}</p>
                                        @endif
                                        @if($event->city)
                                            <p class="text-sm text-gray-400">{{ $event->city }}</p>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Attendee Info -->
                        <div>
                            <h3 class="text-white font-semibold mb-2">Attendee Information</h3>
                            <div class="space-y-2">
                                <div class="flex items-center gap-3">
                                    <span class="material-icons-round text-green-400 text-sm">person</span>
                                    <span class="text-gray-300">{{ $attendee->user->name }}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="material-icons-round text-green-400 text-sm">email</span>
                                    <span class="text-gray-300">{{ $attendee->user->email }}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="material-icons-round text-green-400 text-sm">confirmation_number</span>
                                    <span class="text-gray-300 font-mono">{{ $attendee->ticket_code }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Ticket Details -->
                        <div>
                            <h3 class="text-white font-semibold mb-2">Ticket Information</h3>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Type:</span>
                                    <span class="text-white">{{ $attendee->eventTicket->ticket_type }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Quantity:</span>
                                    <span class="text-white">{{ $attendee->quantity }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Amount Paid:</span>
                                    <span class="text-white">{{ $attendee->formatted_amount }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Status:</span>
                                    <span class="text-green-400 font-medium">{{ $attendee->status_text }}</span>
                                </div>
                                @if($attendee->is_checked_in)
                                    <div class="flex justify-between">
                                        <span class="text-gray-400">Checked In:</span>
                                        <span class="text-green-400">{{ $attendee->checked_in_at->format('M j, Y g:i A') }}</span>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>

                <!-- QR Code Section -->
                <div class="flex flex-col items-center justify-center">
                    <div class="bg-white p-6 rounded-2xl mb-4">
                        @if($attendee->qr_code_url)
                            <img src="{{ $attendee->qr_code_url }}" alt="QR Code"
                                 class="w-48 h-48 object-contain">
                        @else
                            <div class="w-48 h-48 flex items-center justify-center bg-gray-200 text-gray-500">
                                <div class="text-center">
                                    <span class="material-icons-round text-4xl mb-2">qr_code</span>
                                    <p class="text-sm">Generating QR Code...</p>
                                </div>
                            </div>
                        @endif
                    </div>

                    <div class="text-center">
                        <p class="text-white font-semibold mb-2">{{ $attendee->ticket_code }}</p>
                        <p class="text-gray-400 text-sm mb-4">Present this QR code at the event entrance</p>

                        @if(!$attendee->is_checked_in)
                            <div class="flex items-center gap-2 text-green-400 text-sm">
                                <span class="material-icons-round text-sm">check_circle</span>
                                <span>Valid for Entry</span>
                            </div>
                        @else
                            <div class="flex items-center gap-2 text-blue-400 text-sm">
                                <span class="material-icons-round text-sm">done_all</span>
                                <span>Already Checked In</span>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <!-- Ticket Footer -->
        <div class="bg-gray-900 border-t border-gray-700 p-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                <div class="flex items-center gap-4">
                    <span>Issued: {{ $attendee->created_at->format('M j, Y g:i A') }}</span>
                    @if($attendee->payment_reference)
                        <span>Ref: {{ $attendee->payment_reference }}</span>
                    @endif
                </div>
                <div class="flex items-center gap-2">
                    <span class="material-icons-round text-sm">security</span>
                    <span>Verified Ticket</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Ticket Perks -->
    @if($attendee->eventTicket->perks && count($attendee->eventTicket->perks) > 0)
        <div class="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 class="text-xl font-semibold text-white mb-4">Your Ticket Includes</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @foreach($attendee->eventTicket->perks as $perk)
                    <div class="flex items-center gap-3">
                        <span class="material-icons-round text-green-400 text-sm">check</span>
                        <span class="text-gray-300">{{ $perk }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- Important Information -->
    <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
        <div class="flex items-start gap-3">
            <span class="material-icons-round text-yellow-400 mt-1">info</span>
            <div>
                <h3 class="text-lg font-medium text-white mb-3">Important Information</h3>
                <ul class="text-gray-300 space-y-2 text-sm">
                    <li>• This ticket is non-transferable and valid only for the registered attendee</li>
                    <li>• Please arrive at least 30 minutes before the event start time</li>
                    <li>• Have your ID ready along with this digital ticket</li>
                    <li>• Screenshots of this ticket are acceptable for entry</li>
                    <li>• Contact support if you experience any issues with your ticket</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <button onclick="window.print()"
                class="flex items-center justify-center gap-2 bg-green-500 text-black font-medium py-3 px-6 rounded-lg hover:bg-green-400 transition-colors">
            <span class="material-icons-round text-sm">print</span>
            Print Ticket
        </button>

        <button onclick="saveTicketImage()"
                class="flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-500 transition-colors">
            <span class="material-icons-round text-sm">download</span>
            Save Image
        </button>

        <button onclick="shareTicket()"
                class="flex items-center justify-center gap-2 bg-gray-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors">
            <span class="material-icons-round text-sm">share</span>
            Share
        </button>
    </div>

    <!-- Back to Events -->
    <div class="text-center">
        <a href="{{ route('frontend.events.index') }}"
           class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <span class="material-icons-round text-sm">arrow_back</span>
            Back to Events
        </a>
    </div>
</div>

@push('scripts')
<script>
// Save ticket as image
function saveTicketImage() {
    // Use html2canvas library if available, otherwise fallback
    if (typeof html2canvas !== 'undefined') {
        const ticketElement = document.querySelector('.bg-gradient-to-br');
        html2canvas(ticketElement, {
            backgroundColor: '#1f2937',
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'ticket-{{ $attendee->ticket_code }}.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    } else {
        alert('Image save feature requires additional libraries. Please use the print function instead.');
    }
}

// Share ticket
function shareTicket() {
    if (navigator.share) {
        navigator.share({
            title: 'My Ticket - {{ $event->title }}',
            text: 'I\'m attending {{ $event->title }} on {{ $event->formatted_date }}!',
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback - copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Ticket URL copied to clipboard!');
        }).catch(() => {
            alert('Unable to share. You can copy the URL from your browser\'s address bar.');
        });
    }
}

// Print styles
const printStyles = `
@media print {
    body * {
        visibility: hidden;
    }
    .bg-gradient-to-br, .bg-gradient-to-br * {
        visibility: visible;
    }
    .bg-gradient-to-br {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        height: auto !important;
        box-shadow: none !important;
    }
    .no-print {
        display: none !important;
    }
}
`;

// Add print styles to document
const styleElement = document.createElement('style');
styleElement.textContent = printStyles;
document.head.appendChild(styleElement);
</script>
@endpush

@push('styles')
<style>
@media print {
    .no-print {
        display: none !important;
    }
}
</style>
@endpush
@endsection