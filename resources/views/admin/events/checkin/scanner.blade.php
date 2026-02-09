@extends('layouts.admin')

@section('title', 'QR Scanner - ' . $event->title)

@section('content')
<div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
                <p class="mt-1 text-sm text-gray-600">{{ $event->title }} - {{ $event->formatted_date }}</p>
            </div>
            <div class="flex space-x-3">
                <a href="{{ route('admin.events.checkin.dashboard', $event) }}"
                   class="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Dashboard
                </a>
                <a href="{{ route('admin.events.checkin.manual', $event) }}"
                   class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-2 5a1 1 0 100 2 1 1 0 000-2z"></path>
                    </svg>
                    Manual Check-in
                </a>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- QR Scanner -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h2>

            <!-- Scanner Container -->
            <div class="relative mb-4">
                <div id="qr-reader" class="w-full"></div>
                <div id="qr-reader-results" class="mt-4"></div>
            </div>

            <!-- Manual Input Fallback -->
            <div class="border-t pt-4">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Or enter ticket code manually:</h3>
                <div class="flex space-x-2">
                    <input type="text" id="manual-ticket-code" placeholder="Enter ticket code..."
                           class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <button type="button" id="validate-manual"
                            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
                        Validate
                    </button>
                </div>
            </div>
        </div>

        <!-- Validation Results -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Ticket Information</h2>

            <!-- Status Messages -->
            <div id="status-messages" class="mb-4"></div>

            <!-- Attendee Details -->
            <div id="attendee-details" class="hidden">
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Name:</span>
                            <span class="text-sm font-medium text-gray-900" id="attendee-name"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Email:</span>
                            <span class="text-sm font-medium text-gray-900" id="attendee-email"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Ticket Type:</span>
                            <span class="text-sm font-medium text-gray-900" id="ticket-type"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Quantity:</span>
                            <span class="text-sm font-medium text-gray-900" id="ticket-quantity"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Amount Paid:</span>
                            <span class="text-sm font-medium text-gray-900" id="amount-paid"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Ticket Code:</span>
                            <span class="text-sm font-mono text-gray-900" id="ticket-code"></span>
                        </div>
                    </div>
                </div>

                <button type="button" id="confirm-checkin"
                        class="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Confirm Check-in
                </button>
            </div>

            <!-- Instructions -->
            <div id="instructions" class="text-center text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"></path>
                </svg>
                <p class="text-sm">Position the QR code within the camera view</p>
                <p class="text-xs mt-1">or enter the ticket code manually below</p>
            </div>
        </div>
    </div>
</div>

<!-- Success/Error Modals -->
<div id="success-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div>
                <h3 class="text-lg font-medium text-gray-900">Check-in Successful!</h3>
                <p class="text-sm text-gray-600" id="success-message"></p>
            </div>
        </div>
        <div class="flex justify-end">
            <button type="button" onclick="closeModal('success-modal')"
                    class="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700">
                Continue Scanning
            </button>
        </div>
    </div>
</div>

<div id="error-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </div>
            <div>
                <h3 class="text-lg font-medium text-gray-900">Check-in Failed</h3>
                <p class="text-sm text-gray-600" id="error-message"></p>
            </div>
        </div>
        <div class="flex justify-end">
            <button type="button" onclick="closeModal('error-modal')"
                    class="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700">
                Try Again
            </button>
        </div>
    </div>
</div>
@endsection

@push('styles')
<link href="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/minified/html5-qrcode.min.css" rel="stylesheet">
@endpush

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/minified/html5-qrcode.min.js"></script>
<script>
let html5QrcodeScanner;
let currentAttendeeId = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeScanner();

    // Manual validation
    document.getElementById('validate-manual').addEventListener('click', function() {
        const ticketCode = document.getElementById('manual-ticket-code').value.trim();
        if (ticketCode) {
            validateTicket(ticketCode);
        }
    });

    // Enter key on manual input
    document.getElementById('manual-ticket-code').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const ticketCode = this.value.trim();
            if (ticketCode) {
                validateTicket(ticketCode);
            }
        }
    });

    // Confirm check-in
    document.getElementById('confirm-checkin').addEventListener('click', function() {
        if (currentAttendeeId) {
            performCheckIn(currentAttendeeId);
        }
    });
});

function initializeScanner() {
    html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        },
        false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code matched = ${decodedText}`, decodedResult);

    // Stop scanning temporarily
    html5QrcodeScanner.pause(true);

    // Try to parse as JSON (our QR format) or use as plain text (manual codes)
    try {
        const qrData = JSON.parse(decodedText);
        if (qrData.ticket_code) {
            validateQrCode(decodedText);
        } else {
            throw new Error('Invalid QR format');
        }
    } catch (e) {
        // Treat as plain ticket code
        validateTicket(decodedText);
    }
}

function onScanFailure(error) {
    // Handle scan failure, usually better to ignore and keep scanning
    console.warn(`Code scan error = ${error}`);
}

function validateQrCode(qrData) {
    fetch('{{ route("admin.events.checkin.validate") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            qr_data: qrData,
            event_id: {{ $event->id }}
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAttendeeDetails(data.attendee);
        } else {
            showError(data.message);
            setTimeout(() => {
                html5QrcodeScanner.resume();
            }, 3000);
        }
    })
    .catch(error => {
        console.error('Validation error:', error);
        showError('Failed to validate ticket');
        setTimeout(() => {
            html5QrcodeScanner.resume();
        }, 3000);
    });
}

function validateTicket(ticketCode) {
    // For manual entry, create a mock QR data structure
    const mockQrData = JSON.stringify({
        ticket_code: ticketCode,
        event_id: {{ $event->id }},
        type: 'manual_entry'
    });

    validateQrCode(mockQrData);
}

function showAttendeeDetails(attendee) {
    currentAttendeeId = attendee.id;

    document.getElementById('attendee-name').textContent = attendee.user_name;
    document.getElementById('attendee-email').textContent = attendee.user_email || '';
    document.getElementById('ticket-type').textContent = attendee.ticket_type;
    document.getElementById('ticket-quantity').textContent = attendee.quantity || '1';
    document.getElementById('amount-paid').textContent = attendee.amount_paid;
    document.getElementById('ticket-code').textContent = attendee.ticket_code;

    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('attendee-details').classList.remove('hidden');

    clearStatusMessages();
    showSuccess('Valid ticket - ready for check-in');
}

function performCheckIn(attendeeId) {
    const button = document.getElementById('confirm-checkin');
    const originalText = button.innerHTML;

    button.disabled = true;
    button.innerHTML = 'Checking in...';

    fetch('{{ route("admin.events.checkin.checkin") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            attendee_id: attendeeId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showModal('success-modal', data.message);
            resetScanner();
        } else {
            showModal('error-modal', data.message);
        }
    })
    .catch(error => {
        console.error('Check-in error:', error);
        showModal('error-modal', 'Failed to check in attendee');
    })
    .finally(() => {
        button.disabled = false;
        button.innerHTML = originalText;
    });
}

function resetScanner() {
    currentAttendeeId = null;
    document.getElementById('attendee-details').classList.add('hidden');
    document.getElementById('instructions').classList.remove('hidden');
    document.getElementById('manual-ticket-code').value = '';
    clearStatusMessages();

    // Resume scanning
    if (html5QrcodeScanner) {
        html5QrcodeScanner.resume();
    }
}

function showSuccess(message) {
    const container = document.getElementById('status-messages');
    container.innerHTML = `
        <div class="rounded-md bg-green-50 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-green-800">${message}</p>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    const container = document.getElementById('status-messages');
    container.innerHTML = `
        <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-red-800">${message}</p>
                </div>
            </div>
        </div>
    `;
}

function clearStatusMessages() {
    document.getElementById('status-messages').innerHTML = '';
}

function showModal(modalId, message) {
    const modal = document.getElementById(modalId);
    const messageElement = modal.querySelector('#' + (modalId.includes('success') ? 'success' : 'error') + '-message');
    messageElement.textContent = message;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    resetScanner();
}
</script>
@endpush