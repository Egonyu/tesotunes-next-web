@extends('layouts.admin')

@section('title', 'Manual Check-in - ' . $event->title)

@section('content')
<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Manual Check-in</h1>
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
                <a href="{{ route('admin.events.checkin.scanner', $event) }}"
                   class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"></path>
                    </svg>
                    QR Scanner
                </a>
            </div>
        </div>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex space-x-4">
            <div class="flex-1">
                <label for="search" class="sr-only">Search attendees</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input type="text" id="search" placeholder="Search by name, email, or ticket code..."
                           class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                </div>
            </div>
            <button type="button" id="clear-search"
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Clear
            </button>
        </div>
    </div>

    <!-- Search Results -->
    <div id="search-results" class="hidden bg-white rounded-lg shadow mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Search Results</h3>
        </div>
        <div id="search-results-content">
            <!-- Search results will be populated here -->
        </div>
    </div>

    <!-- Attendees List -->
    <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">All Attendees</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendee
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticket
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Check-in
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    @forelse($attendees as $attendee)
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <div class="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span class="text-sm font-medium text-gray-700">
                                                {{ substr($attendee->user->name, 0, 1) }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">{{ $attendee->user->name }}</div>
                                        <div class="text-sm text-gray-500">{{ $attendee->user->email }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">{{ $attendee->ticket_type }}</div>
                                <div class="text-sm text-gray-500">{{ $attendee->ticket_code }}</div>
                                @if($attendee->quantity > 1)
                                    <div class="text-xs text-gray-500">Qty: {{ $attendee->quantity }}</div>
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                @if($attendee->is_checked_in)
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                        </svg>
                                        Checked In
                                    </span>
                                @elseif($attendee->can_check_in)
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                                        </svg>
                                        Ready
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Not Ready
                                    </span>
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                @if($attendee->checked_in_at)
                                    <div>{{ $attendee->checked_in_at->format('M j, g:i A') }}</div>
                                    @if($attendee->checkedInBy)
                                        <div class="text-xs">by {{ $attendee->checkedInBy->name }}</div>
                                    @endif
                                @else
                                    —
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                @if($attendee->can_check_in && !$attendee->is_checked_in)
                                    <form method="POST" action="{{ route('admin.events.checkin.manual-checkin', [$event, $attendee]) }}" class="inline">
                                        @csrf
                                        <button type="submit"
                                                class="text-green-600 hover:text-green-900 mr-3"
                                                onclick="return confirm('Check in {{ $attendee->user->name }}?')">
                                            Check In
                                        </button>
                                    </form>
                                @elseif($attendee->is_checked_in)
                                    <form method="POST" action="{{ route('admin.events.checkin.undo-checkin', [$event, $attendee]) }}" class="inline">
                                        @csrf
                                        <button type="submit"
                                                class="text-red-600 hover:text-red-900 mr-3"
                                                onclick="return confirm('Undo check-in for {{ $attendee->user->name }}?')">
                                            Undo
                                        </button>
                                    </form>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                <p>No confirmed attendees found</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($attendees->hasPages())
            <div class="px-6 py-4 border-t border-gray-200">
                {{ $attendees->links() }}
            </div>
        @endif
    </div>
</div>

@push('scripts')
<script>
let searchTimeout;

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    const clearButton = document.getElementById('clear-search');
    const searchResults = document.getElementById('search-results');
    const searchResultsContent = document.getElementById('search-results-content');

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        } else {
            hideSearchResults();
        }
    });

    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        hideSearchResults();
        searchInput.focus();
    });

    function performSearch(query) {
        fetch(`{{ route('admin.events.checkin.search', $event) }}?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.attendees.length > 0) {
                    displaySearchResults(data.attendees);
                } else {
                    displayNoResults();
                }
            })
            .catch(error => {
                console.error('Search error:', error);
                hideSearchResults();
            });
    }

    function displaySearchResults(attendees) {
        let html = '';

        attendees.forEach(attendee => {
            const statusBadge = getStatusBadge(attendee);
            const actionButton = getActionButton(attendee);

            html += `
                <div class="px-6 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center flex-1">
                            <div class="flex-shrink-0 h-10 w-10">
                                <div class="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span class="text-sm font-medium text-gray-700">
                                        ${attendee.user_name.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <div class="ml-4 flex-1">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="text-sm font-medium text-gray-900">${attendee.user_name}</div>
                                        <div class="text-sm text-gray-500">${attendee.user_email}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-gray-900">${attendee.ticket_type}</div>
                                        <div class="text-sm text-gray-500">${attendee.ticket_code}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="ml-6 flex items-center space-x-3">
                            ${statusBadge}
                            ${actionButton}
                        </div>
                    </div>
                    ${attendee.checked_in_at ? `<div class="mt-2 text-xs text-gray-500">Checked in: ${attendee.checked_in_at}</div>` : ''}
                </div>
            `;
        });

        searchResultsContent.innerHTML = html;
        searchResults.classList.remove('hidden');
    }

    function displayNoResults() {
        searchResultsContent.innerHTML = `
            <div class="px-6 py-4 text-center text-gray-500">
                <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p class="text-sm">No attendees found matching your search</p>
            </div>
        `;
        searchResults.classList.remove('hidden');
    }

    function hideSearchResults() {
        searchResults.classList.add('hidden');
    }

    function getStatusBadge(attendee) {
        if (attendee.is_checked_in) {
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Checked In</span>`;
        } else if (attendee.can_check_in) {
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Ready</span>`;
        } else {
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Ready</span>`;
        }
    }

    function getActionButton(attendee) {
        if (attendee.can_check_in && !attendee.is_checked_in) {
            return `
                <form method="POST" action="{{ route('admin.events.checkin.manual-checkin', [$event, '']) }}${attendee.id}" class="inline">
                    @csrf
                    <button type="submit"
                            class="text-green-600 hover:text-green-900 text-sm font-medium"
                            onclick="return confirm('Check in ${attendee.user_name}?')">
                        Check In
                    </button>
                </form>
            `;
        } else if (attendee.is_checked_in) {
            return `
                <form method="POST" action="{{ route('admin.events.checkin.undo-checkin', [$event, '']) }}${attendee.id}" class="inline">
                    @csrf
                    <button type="submit"
                            class="text-red-600 hover:text-red-900 text-sm font-medium"
                            onclick="return confirm('Undo check-in for ${attendee.user_name}?')">
                        Undo
                    </button>
                </form>
            `;
        }
        return '';
    }
});
</script>
@endpush
@endsection