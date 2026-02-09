@extends('layouts.admin')

@section('title', 'Check-in - ' . $event->title)

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Event Check-in</h1>
            <p class="text-slate-500 dark:text-navy-300">Check-in attendees for {{ $event->title }}</p>
        </div>
        <div class="flex items-center space-x-2">
            <a href="{{ route('admin.events.check-in.scan', $event) }}" class="btn bg-success text-white hover:bg-success/90">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5v5H4V4zm11 14h5v5h-5v-5zM4 15h5v5H4v-5z" />
                </svg>
                QR Scanner
            </a>
            <a href="{{ route('admin.events.check-in.dashboard', $event) }}" class="btn bg-info text-white hover:bg-info/90">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
            </a>
            <a href="{{ route('admin.events.attendees.index', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Attendees
            </a>
        </div>
    </div>
@endsection

@section('content')
    <!-- Check-in Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Attendees</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['total_attendees'] }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Checked In</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['checked_in'] }}</p>
                </div>
                <div class="size-11 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Pending Check-in</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['pending_check_in'] }}</p>
                </div>
                <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Check-in Rate</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($stats['check_in_rate'], 1) }}%</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Manual Check-in -->
        <div class="card">
            <div class="p-4 sm:p-5">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-4">Manual Check-in</h3>

                <div class="space-y-4">
                    <!-- Search Form -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                            Search Attendee
                        </label>
                        <div class="flex space-x-2">
                            <input type="text" id="attendee-search"
                                   placeholder="Search by name, email, or ticket code..."
                                   class="form-input flex-1">
                            <button type="button" id="search-btn" class="btn bg-primary text-white">
                                Search
                            </button>
                        </div>
                    </div>

                    <!-- Search Results -->
                    <div id="search-results" class="hidden">
                        <h4 class="font-medium text-slate-700 dark:text-navy-100 mb-2">Search Results</h4>
                        <div id="search-results-container" class="space-y-2 max-h-64 overflow-y-auto">
                            <!-- Results will be populated here -->
                        </div>
                    </div>

                    <!-- Check-in Form -->
                    <div id="checkin-form" class="hidden">
                        <div class="border border-slate-200 dark:border-navy-500 rounded-lg p-4 bg-slate-50 dark:bg-navy-600">
                            <h4 class="font-medium text-slate-700 dark:text-navy-100 mb-3">Confirm Check-in</h4>
                            <div id="attendee-details" class="space-y-2 mb-4">
                                <!-- Attendee details will be populated here -->
                            </div>
                            <div class="flex space-x-2">
                                <button type="button" id="confirm-checkin" class="btn bg-success text-white flex-1">
                                    Confirm Check-in
                                </button>
                                <button type="button" id="cancel-checkin" class="btn border border-slate-300 text-slate-700">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Check-ins -->
        <div class="card">
            <div class="p-4 sm:p-5">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Recent Check-ins</h3>
                    <a href="{{ route('admin.events.check-in.export', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export
                    </a>
                </div>

                <div class="space-y-3 max-h-96 overflow-y-auto">
                    @forelse($recentCheckIns as $attendee)
                        <div class="flex items-center space-x-3 p-3 border border-slate-200 dark:border-navy-500 rounded-lg">
                            <div class="avatar size-10">
                                <img class="rounded-full" src="{{ $attendee->user->avatar ? asset('storage/' . $attendee->user->avatar) : asset('images/avatar-placeholder.png') }}" alt="{{ $attendee->user->name }}" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-slate-700 dark:text-navy-100 truncate">{{ $attendee->user->name }}</p>
                                <p class="text-xs text-slate-400 dark:text-navy-300">{{ $attendee->ticket_type }} • {{ $attendee->ticket_code }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-slate-400 dark:text-navy-300">{{ $attendee->checked_in_at->format('g:i A') }}</p>
                                @if($attendee->checkedInBy)
                                    <p class="text-xs text-slate-400 dark:text-navy-300">by {{ $attendee->checkedInBy->name }}</p>
                                @endif
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-12 text-slate-300 dark:text-navy-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-slate-500 dark:text-navy-300">No check-ins yet</p>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- Success/Error Messages -->
    <div id="message-container" class="fixed top-4 right-4 z-50"></div>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('attendee-search');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const searchResultsContainer = document.getElementById('search-results-container');
    const checkinForm = document.getElementById('checkin-form');
    const attendeeDetails = document.getElementById('attendee-details');
    const confirmCheckinBtn = document.getElementById('confirm-checkin');
    const cancelCheckinBtn = document.getElementById('cancel-checkin');
    const messageContainer = document.getElementById('message-container');

    let selectedAttendee = null;

    // Search functionality
    function performSearch() {
        const query = searchInput.value.trim();
        if (query.length < 2) {
            showMessage('Please enter at least 2 characters to search', 'warning');
            return;
        }

        fetch(`{{ route('admin.events.check-in.manual-check-in', $event) }}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ search: query })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySearchResults(data.attendees);
            } else {
                showMessage(data.message || 'Search failed', 'error');
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            showMessage('Search failed. Please try again.', 'error');
        });
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function displaySearchResults(attendees) {
        if (attendees.length === 0) {
            searchResultsContainer.innerHTML = '<p class="text-slate-500 dark:text-navy-300 p-3 text-center">No attendees found</p>';
        } else {
            searchResultsContainer.innerHTML = attendees.map(attendee => `
                <div class="border border-slate-200 dark:border-navy-500 rounded-lg p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-navy-600 attendee-result"
                     data-attendee-id="${attendee.id}" data-attendee='${JSON.stringify(attendee)}'>
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-medium text-slate-700 dark:text-navy-100">${attendee.name}</p>
                            <p class="text-xs text-slate-400 dark:text-navy-300">${attendee.email}</p>
                            <p class="text-xs text-slate-500 dark:text-navy-400">${attendee.ticket_type} • ${attendee.ticket_code}</p>
                        </div>
                        <div class="text-right">
                            <span class="badge rounded-full text-xs ${getStatusBadgeClass(attendee.status)}">
                                ${attendee.status}
                            </span>
                            ${attendee.can_check_in ?
                                '<p class="text-xs text-success mt-1">Can check-in</p>' :
                                '<p class="text-xs text-error mt-1">Cannot check-in</p>'
                            }
                        </div>
                    </div>
                </div>
            `).join('');

            // Add click handlers
            document.querySelectorAll('.attendee-result').forEach(element => {
                element.addEventListener('click', function() {
                    const attendee = JSON.parse(this.dataset.attendee);
                    selectAttendee(attendee);
                });
            });
        }

        searchResults.classList.remove('hidden');
        checkinForm.classList.add('hidden');
    }

    function selectAttendee(attendee) {
        if (!attendee.can_check_in) {
            showMessage('This attendee cannot be checked in', 'error');
            return;
        }

        selectedAttendee = attendee;

        attendeeDetails.innerHTML = `
            <div class="flex items-center space-x-3 mb-3">
                <div class="avatar size-12">
                    <img class="rounded-full" src="${attendee.avatar || '/images/avatar-placeholder.png'}" alt="${attendee.name}" />
                </div>
                <div>
                    <p class="font-medium text-slate-700 dark:text-navy-100">${attendee.name}</p>
                    <p class="text-sm text-slate-400 dark:text-navy-300">${attendee.email}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-slate-400 dark:text-navy-300">Ticket Type</p>
                    <p class="font-medium">${attendee.ticket_type}</p>
                </div>
                <div>
                    <p class="text-slate-400 dark:text-navy-300">Ticket Code</p>
                    <p class="font-medium">${attendee.ticket_code}</p>
                </div>
                <div>
                    <p class="text-slate-400 dark:text-navy-300">Status</p>
                    <p class="font-medium">${attendee.status}</p>
                </div>
                <div>
                    <p class="text-slate-400 dark:text-navy-300">Registration</p>
                    <p class="font-medium">${new Date(attendee.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        `;

        searchResults.classList.add('hidden');
        checkinForm.classList.remove('hidden');
    }

    // Check-in confirmation
    confirmCheckinBtn.addEventListener('click', function() {
        if (!selectedAttendee) return;

        fetch(`{{ route('admin.events.check-in.process', $event) }}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ attendee_id: selectedAttendee.id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
                resetForm();
                // Optionally refresh the page or update stats
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Check-in error:', error);
            showMessage('Check-in failed. Please try again.', 'error');
        });
    });

    cancelCheckinBtn.addEventListener('click', resetForm);

    function resetForm() {
        selectedAttendee = null;
        searchInput.value = '';
        searchResults.classList.add('hidden');
        checkinForm.classList.add('hidden');
    }

    function getStatusBadgeClass(status) {
        const classes = {
            'confirmed': 'bg-success/10 text-success',
            'pending': 'bg-warning/10 text-warning',
            'checked_in': 'bg-info/10 text-info',
            'cancelled': 'bg-error/10 text-error'
        };
        return classes[status] || 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100';
    }

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert ${type === 'success' ? 'alert-success' :
                                      type === 'warning' ? 'alert-warning' : 'alert-error'}
                                mb-4 transition-all duration-300`;
        messageDiv.textContent = message;

        messageContainer.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
});
</script>
@endsection