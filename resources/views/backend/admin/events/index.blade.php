@extends('layouts.admin')

@section('title', 'Events Management')

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Events Management</h1>
            <p class="text-slate-500 dark:text-navy-300">Manage music events and concerts</p>
        </div>
        <div class="flex items-center space-x-2">
            <a href="{{ route('admin.events.create') }}" class="btn bg-primary text-white hover:bg-primary/90">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Event
            </a>
        </div>
    </div>
@endsection

@section('content')
    <!-- Events Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Events</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $events->total() ?? 0 }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Upcoming</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $upcomingEvents ?? 0 }}</p>
                </div>
                <div class="size-11 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">This Month</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $monthlyEvents ?? 0 }}</p>
                </div>
                <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Attendees</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $totalAttendees ?? 0 }}</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Events Table -->
    <div class="card">
        <div class="flex items-center justify-between p-4 sm:p-5">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Events List</h3>

            <!-- Filters -->
            <div class="flex items-center space-x-2">
                <div class="flex">
                    <input type="text" placeholder="Search events..."
                           class="form-input w-64"
                           x-data=""
                           x-on:input.debounce.300ms="$event.target.form.submit()">
                </div>
                <select class="form-select w-auto">
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-y border-slate-200 dark:border-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Event
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Date & Time
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Location
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Tickets
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($events ?? [] as $event)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- Event Info -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-3">
                                    <div class="avatar size-12 overflow-hidden rounded-lg">
                                        @php
                                            $eventImage = $event->featured_image ?? $event->cover_image ?? null;
                                        @endphp
                                        @if($eventImage)
                                            <img class="rounded-lg object-cover size-12" src="{{ asset('storage/' . $eventImage) }}" alt="{{ $event->title ?? 'Event' }}" 
                                                 onerror="this.src='{{ asset('images/placeholder-event.jpg') }}'"/>
                                        @else
                                            <div class="size-12 rounded-lg bg-slate-100 dark:bg-navy-700 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        @endif
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-navy-100">{{ $event->title ?? 'Sample Event' }}</p>
                                        <p class="text-xs text-slate-400 dark:text-navy-300">{{ $event->event_type ?? 'Music Concert' }}</p>
                                    </div>
                                </div>
                            </td>

                            <!-- Date & Time -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm lg:px-5">
                                <div>
                                    <p class="font-medium text-slate-700 dark:text-navy-100">
                                        {{ isset($event->starts_at) ? \Carbon\Carbon::parse($event->starts_at)->format('M j, Y') : (isset($event->event_date) ? $event->event_date : 'N/A') }}
                                    </p>
                                    <p class="text-xs text-slate-400 dark:text-navy-300">
                                        {{ isset($event->starts_at) ? \Carbon\Carbon::parse($event->starts_at)->format('g:i A') : (isset($event->event_time) ? $event->event_time : 'N/A') }}
                                    </p>
                                </div>
                            </td>

                            <!-- Location -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-100 lg:px-5">
                                <div>
                                    <p class="font-medium">{{ $event->venue_name ?? 'N/A' }}</p>
                                    <p class="text-xs text-slate-400 dark:text-navy-300">{{ $event->city ?? 'N/A' }}, {{ $event->country ?? 'Uganda' }}</p>
                                </div>
                            </td>

                            <!-- Tickets Sold -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-100 lg:px-5">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium">{{ $event->tickets_sold ?? 0 }}</span>
                                    <span class="text-xs text-slate-400 dark:text-navy-300">/ {{ $event->total_tickets ?? 0 }}</span>
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <span class="badge rounded-full
                                    {{ ($event->status ?? 'draft') === 'draft' ? 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100' :
                                       (($event->status ?? 'draft') === 'published' ? 'bg-success/10 text-success' :
                                       (($event->status ?? 'draft') === 'completed' ? 'bg-info/10 text-info' : 'bg-error/10 text-error')) }}">
                                    {{ ucfirst($event->status ?? 'draft') }}
                                </span>
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center gap-1">
                                    <!-- View -->
                                    <a href="{{ route('admin.events.show', $event->id) }}" 
                                       class="btn size-8 rounded-full p-0 hover:bg-primary/20 text-primary" 
                                       title="View Event">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>
                                    
                                    <!-- Edit -->
                                    <a href="{{ route('admin.events.edit', $event->id) }}" 
                                       class="btn size-8 rounded-full p-0 hover:bg-warning/20 text-warning" 
                                       title="Edit Event">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>
                                    
                                    <!-- QR Code -->
                                    <button onclick="openQRModal({{ $event->id }}, '{{ addslashes($event->title ?? 'Event') }}')" 
                                            class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info" 
                                            title="Generate QR Code">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    </button>
                                    
                                    <!-- Delete -->
                                    <button class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error"
                                            onclick="if(confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                                                document.getElementById('delete-form-{{ $event->id }}').submit();
                                            }"
                                            title="Delete Event">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <form id="delete-form-{{ $event->id }}" action="{{ route('admin.events.destroy', $event->id) }}" method="POST" class="hidden">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-4 py-8 text-center">
                                <div class="flex flex-col items-center justify-center space-y-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-slate-300 dark:text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p class="text-lg font-medium text-slate-700 dark:text-navy-100">No events found</p>
                                        <p class="text-slate-400 dark:text-navy-300">Create your first event to get started</p>
                                    </div>
                                    <a href="{{ route('admin.events.create') }}" class="btn bg-primary text-white">
                                        Create Event
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if(isset($events) && method_exists($events, 'links'))
            <div class="p-4">
                {{ $events->links() }}
            </div>
        @endif
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
                    <p class="font-semibold text-slate-800 dark:text-navy-50" id="qrEventTitle">Loading...</p>
                </div>

                <!-- QR Code Display -->
                <div class="flex flex-col items-center justify-center p-6 bg-white dark:bg-navy-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-navy-500">
                    <div id="qrCodeContainer" class="mb-4">
                        <!-- QR code will be generated here -->
                    </div>
                    <p class="text-xs text-slate-500 dark:text-navy-400 text-center">
                        Scan this QR code to view event details or check-in attendees
                    </p>
                </div>

                <!-- Actions -->
                <div class="mt-6 flex gap-3">
                    <button onclick="downloadQRCode()" class="btn bg-primary text-white hover:bg-primary-focus flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download QR Code
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
let currentQRCode = null;
let currentEventId = null;
let currentEventTitle = null;

function openQRModal(eventId, eventTitle) {
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        alert('QR Code library failed to load. Please refresh the page.');
        return;
    }

    // Validate parameters
    if (!eventId) {
        console.error('Event ID is required');
        alert('Invalid event ID');
        return;
    }

    currentEventId = eventId;
    currentEventTitle = eventTitle || 'Unknown Event';
    
    document.getElementById('qrEventTitle').textContent = eventTitle;
    document.getElementById('qrModal').classList.remove('hidden');
    document.getElementById('qrModal').classList.add('flex');
    
    // Clear previous QR code
    document.getElementById('qrCodeContainer').innerHTML = '';
    
    try {
        // Generate new QR code
        const eventUrl = `{{ url('/') }}/events/${eventId}`;
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
        currentEventId = null;
        currentEventTitle = null;
    }
}

function downloadQRCode() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    if (canvas && currentEventId) {
        try {
            const link = document.createElement('a');
            link.download = `event-${currentEventId}-qrcode.png`;
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
    if (canvas && currentEventId) {
        try {
            const eventTitle = currentEventTitle || 'Unknown Event';
            const eventId = currentEventId || 'Unknown';
            const canvasData = canvas.toDataURL();

            const windowContent = '<!DOCTYPE html>' +
                '<html>' +
                '<head>' +
                '<title>Event QR Code - ' + eventTitle + '</title>' +
                '<style>' +
                'body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }' +
                'h1 { font-size: 24px; margin-bottom: 20px; }' +
                'img { margin: 20px auto; display: block; }' +
                '.info { margin-top: 20px; font-size: 14px; color: #666; }' +
                '</style>' +
                '</head>' +
                '<body>' +
                '<h1>' + eventTitle + '</h1>' +
                '<img src="' + canvasData + '" alt="QR Code" />' +
                '<div class="info">' +
                '<p>Scan this QR code to view event details</p>' +
                '<p>Event ID: ' + eventId + '</p>' +
                '</div>' +
                '</body>' +
                '</html>';
            
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

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeQRModal();
    }
});

// Log when scripts load
console.log('Events index page scripts loaded');
</script>
@endpush