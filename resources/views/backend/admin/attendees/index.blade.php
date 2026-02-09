@extends('layouts.admin')

@section('title', 'Attendee Management - ' . $event->title)

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Attendee Management</h1>
            <p class="text-slate-500 dark:text-navy-300">Manage attendees for {{ $event->title }}</p>
        </div>
        <div class="flex items-center space-x-2">
            <a href="{{ route('admin.events.check-in.index', $event) }}" class="btn bg-success text-white hover:bg-success/90">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check-in
            </a>
            <a href="{{ route('admin.events.attendees.create', $event) }}" class="btn bg-primary text-white hover:bg-primary/90">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Attendee
            </a>
            <a href="{{ route('admin.events.show', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Event
            </a>
        </div>
    </div>
@endsection

@section('content')
    <!-- Attendee Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['total'] }}</p>
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
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Confirmed</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['confirmed'] }}</p>
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
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Pending</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['pending'] }}</p>
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
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Checked In</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['checked_in'] }}</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Revenue</p>
                    <p class="text-xl font-semibold text-slate-700 dark:text-navy-100">UGX {{ number_format($stats['revenue']) }}</p>
                </div>
                <div class="size-11 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters and Search -->
    <div class="card mb-6">
        <div class="p-4 sm:p-5">
            <form method="GET" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                    <input type="text" name="search" value="{{ request('search') }}"
                           placeholder="Search by name, email, or ticket code..."
                           class="form-input w-full">
                </div>

                <div>
                    <select name="status" class="form-select w-full">
                        <option value="">All Status</option>
                        <option value="confirmed" {{ request('status') === 'confirmed' ? 'selected' : '' }}>Confirmed</option>
                        <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                        <option value="checked_in" {{ request('status') === 'checked_in' ? 'selected' : '' }}>Checked In</option>
                        <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                        <option value="no_show" {{ request('status') === 'no_show' ? 'selected' : '' }}>No Show</option>
                    </select>
                </div>

                <div>
                    <select name="payment_status" class="form-select w-full">
                        <option value="">All Payment Status</option>
                        <option value="pending" {{ request('payment_status') === 'pending' ? 'selected' : '' }}>Pending</option>
                        <option value="completed" {{ request('payment_status') === 'completed' ? 'selected' : '' }}>Completed</option>
                        <option value="failed" {{ request('payment_status') === 'failed' ? 'selected' : '' }}>Failed</option>
                        <option value="refunded" {{ request('payment_status') === 'refunded' ? 'selected' : '' }}>Refunded</option>
                    </select>
                </div>

                <div>
                    <select name="attendance_type" class="form-select w-full">
                        <option value="">All Types</option>
                        <option value="ticket_purchase" {{ request('attendance_type') === 'ticket_purchase' ? 'selected' : '' }}>Ticket Purchase</option>
                        <option value="rsvp" {{ request('attendance_type') === 'rsvp' ? 'selected' : '' }}>RSVP</option>
                        <option value="guest_list" {{ request('attendance_type') === 'guest_list' ? 'selected' : '' }}>Guest List</option>
                    </select>
                </div>

                <div>
                    <select name="ticket_type" class="form-select w-full">
                        <option value="">All Ticket Types</option>
                        @foreach($ticketTypes as $ticketType)
                            <option value="{{ $ticketType->id }}" {{ request('ticket_type') == $ticketType->id ? 'selected' : '' }}>
                                {{ $ticketType->ticket_type }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div class="flex items-center space-x-2">
                    <button type="submit" class="btn bg-primary text-white flex-1">
                        Filter
                    </button>
                    <a href="{{ route('admin.events.attendees.index', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                        Clear
                    </a>
                </div>
            </form>
        </div>
    </div>

    <!-- Attendees Table -->
    <div class="card">
        <div class="flex items-center justify-between p-4 sm:p-5">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Attendees</h3>

            <!-- Bulk Actions -->
            <div class="flex items-center space-x-2">
                <select id="bulk-action" class="form-select w-auto">
                    <option value="">Bulk Actions</option>
                    <option value="check_in">Check In</option>
                    <option value="confirm">Confirm</option>
                    <option value="cancel">Cancel</option>
                    <option value="delete">Delete</option>
                </select>
                <button id="apply-bulk-action" class="btn bg-primary text-white" disabled>
                    Apply
                </button>
                <a href="{{ route('admin.events.attendees.export', $event) }}{{ request()->getQueryString() ? '?' . request()->getQueryString() : '' }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                </a>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-y border-slate-200 dark:border-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            <input type="checkbox" id="select-all" class="form-checkbox size-4 text-primary border border-slate-400/70 dark:border-navy-400 dark:bg-navy-700 dark:checked:border-accent">
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Attendee
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Ticket
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Payment
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Registration
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($attendees as $attendee)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- Checkbox -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <input type="checkbox" name="attendees[]" value="{{ $attendee->id }}" class="attendee-checkbox form-checkbox size-4 text-primary border border-slate-400/70 dark:border-navy-400 dark:bg-navy-700 dark:checked:border-accent">
                            </td>

                            <!-- Attendee Info -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-3">
                                    <div class="avatar size-10">
                                        <img class="rounded-full" src="{{ $attendee->user->avatar ? asset('storage/' . $attendee->user->avatar) : asset('images/avatar-placeholder.png') }}" alt="{{ $attendee->user->name }}" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-navy-100">{{ $attendee->user->name }}</p>
                                        <p class="text-xs text-slate-400 dark:text-navy-300">{{ $attendee->user->email }}</p>
                                    </div>
                                </div>
                            </td>

                            <!-- Ticket Info -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $attendee->ticket_type }}</p>
                                    <p class="text-xs text-slate-400 dark:text-navy-300">{{ $attendee->ticket_code }}</p>
                                </div>
                            </td>

                            <!-- Payment -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $attendee->formatted_amount }}</p>
                                    <span class="badge rounded-full text-xs
                                        {{ $attendee->payment_status === 'completed' ? 'bg-success/10 text-success' :
                                           ($attendee->payment_status === 'pending' ? 'bg-warning/10 text-warning' :
                                           ($attendee->payment_status === 'refunded' ? 'bg-info/10 text-info' : 'bg-error/10 text-error')) }}">
                                        {{ $attendee->payment_status_text }}
                                    </span>
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <span class="badge rounded-full
                                    {{ $attendee->status === 'confirmed' ? 'bg-success/10 text-success' :
                                       ($attendee->status === 'pending' ? 'bg-warning/10 text-warning' :
                                       ($attendee->status === 'checked_in' ? 'bg-info/10 text-info' :
                                       ($attendee->status === 'cancelled' ? 'bg-error/10 text-error' : 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100'))) }}">
                                    {{ $attendee->status_text }}
                                </span>
                                @if($attendee->attendance_type !== 'ticket_purchase')
                                    <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100 rounded-full text-xs ml-1">
                                        {{ $attendee->attendance_type_text }}
                                    </span>
                                @endif
                            </td>

                            <!-- Registration -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="text-sm">
                                    <p class="text-slate-700 dark:text-navy-100">{{ $attendee->created_at->format('M j, Y') }}</p>
                                    <p class="text-xs text-slate-400 dark:text-navy-300">{{ $attendee->created_at->format('g:i A') }}</p>
                                    @if($attendee->is_checked_in)
                                        <p class="text-xs text-info">Checked in: {{ $attendee->checked_in_at->format('M j g:i A') }}</p>
                                    @endif
                                </div>
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-1">
                                    <a href="{{ route('admin.events.attendees.show', [$event, $attendee]) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20" title="View Details">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>

                                    @if($attendee->can_check_in)
                                        <form action="{{ route('admin.events.attendees.check-in', [$event, $attendee]) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success" title="Check In">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                        </form>
                                    @endif

                                    @if($attendee->is_confirmed)
                                        <form action="{{ route('admin.events.attendees.resend-ticket', [$event, $attendee]) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info" title="Resend Ticket">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </form>
                                    @endif

                                    <a href="{{ route('admin.events.attendees.edit', [$event, $attendee]) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-4 py-8 text-center">
                                <div class="flex flex-col items-center justify-center space-y-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-slate-300 dark:text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <div>
                                        <p class="text-lg font-medium text-slate-700 dark:text-navy-100">No attendees found</p>
                                        <p class="text-slate-400 dark:text-navy-300">Try adjusting your filters or add the first attendee</p>
                                    </div>
                                    <a href="{{ route('admin.events.attendees.create', $event) }}" class="btn bg-primary text-white">
                                        Add Attendee
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if(method_exists($attendees, 'links'))
            <div class="p-4">
                {{ $attendees->appends(request()->query())->links() }}
            </div>
        @endif
    </div>

    <!-- Bulk Action Form -->
    <form id="bulk-action-form" action="{{ route('admin.events.attendees.bulk-action', $event) }}" method="POST" class="hidden">
        @csrf
        <input type="hidden" name="action" id="bulk-action-input">
        <div id="bulk-attendees-container"></div>
    </form>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.getElementById('select-all');
    const attendeeCheckboxes = document.querySelectorAll('.attendee-checkbox');
    const bulkActionSelect = document.getElementById('bulk-action');
    const applyBulkActionBtn = document.getElementById('apply-bulk-action');
    const bulkActionForm = document.getElementById('bulk-action-form');
    const bulkActionInput = document.getElementById('bulk-action-input');
    const bulkAttendeesContainer = document.getElementById('bulk-attendees-container');

    // Select all functionality
    selectAllCheckbox.addEventListener('change', function() {
        attendeeCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateBulkActionButton();
    });

    // Individual checkbox functionality
    attendeeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkedBoxes = document.querySelectorAll('.attendee-checkbox:checked');
            selectAllCheckbox.checked = checkedBoxes.length === attendeeCheckboxes.length;
            selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < attendeeCheckboxes.length;
            updateBulkActionButton();
        });
    });

    function updateBulkActionButton() {
        const checkedBoxes = document.querySelectorAll('.attendee-checkbox:checked');
        applyBulkActionBtn.disabled = checkedBoxes.length === 0 || !bulkActionSelect.value;
    }

    bulkActionSelect.addEventListener('change', updateBulkActionButton);

    // Apply bulk action
    applyBulkActionBtn.addEventListener('click', function() {
        const action = bulkActionSelect.value;
        const checkedBoxes = document.querySelectorAll('.attendee-checkbox:checked');

        if (!action || checkedBoxes.length === 0) return;

        const actionText = bulkActionSelect.options[bulkActionSelect.selectedIndex].text;

        if (!confirm(`Are you sure you want to ${actionText.toLowerCase()} ${checkedBoxes.length} selected attendee(s)?`)) {
            return;
        }

        bulkActionInput.value = action;

        // Clear previous inputs
        bulkAttendeesContainer.innerHTML = '';

        // Add selected attendee IDs
        checkedBoxes.forEach(checkbox => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'attendees[]';
            input.value = checkbox.value;
            bulkAttendeesContainer.appendChild(input);
        });

        bulkActionForm.submit();
    });
});
</script>
@endsection