@extends('layouts.admin')

@section('title', 'Approvals Dashboard')

@section('content')
<div class="flex flex-col space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Approvals Dashboard</h1>
            <p class="text-slate-600 dark:text-slate-300">Manage all pending approvals across the platform</p>
        </div>

        <div class="flex items-center space-x-3">
            <!-- Bulk Actions Button -->
            <button id="bulk-approve-btn" class="btn bg-success text-white hover:bg-success-focus disabled:opacity-50" disabled>
                <svg class="size-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Bulk Approve
            </button>

            <!-- Filter Dropdown -->
            <div x-data="{ open: false }" class="relative">
                <button @click="open = !open" class="btn bg-slate-150 text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-100 dark:hover:bg-navy-450">
                    <svg class="size-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                    </svg>
                    Filter: {{ ucfirst($filter) }}
                </button>

                <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-navy-700">
                    <div class="py-1">
                        <a href="{{ route('admin.approvals.index', ['filter' => 'all', 'status' => $status]) }}" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-navy-100 dark:hover:bg-navy-600">All Types</a>
                        <a href="{{ route('admin.approvals.index', ['filter' => 'artists', 'status' => $status]) }}" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-navy-100 dark:hover:bg-navy-600">Artists Only</a>
                        @if(config('store.enabled', false))
                        <a href="{{ route('admin.approvals.index', ['filter' => 'stores', 'status' => $status]) }}" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-navy-100 dark:hover:bg-navy-600">Stores Only</a>
                        @endif
                        @if(config('sacco.enabled', false))
                        <a href="{{ route('admin.approvals.index', ['filter' => 'sacco', 'status' => $status]) }}" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-navy-100 dark:hover:bg-navy-600">SACCO Only</a>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Total Pending -->
        <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Total Pending</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ $stats['total_pending'] }}</p>
                </div>
            </div>
        </div>

        <!-- Artists -->
        <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Artists Pending</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ $stats['artists']['pending'] }}</p>
                </div>
            </div>
        </div>

        <!-- Stores -->
        @if(config('store.enabled', false))
        <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Stores Pending</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ $stats['stores']['pending'] }}</p>
                </div>
            </div>
        </div>
        @endif

        <!-- SACCO -->
        @if(config('sacco.enabled', false))
        <div class="bg-white rounded-lg p-6 shadow-sm dark:bg-navy-800">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-300">SACCO Pending</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ $stats['sacco']['pending'] }}</p>
                </div>
            </div>
        </div>
        @endif
    </div>

    <!-- Status Tabs -->
    <div class="border-b border-slate-200 dark:border-navy-500">
        <nav class="-mb-px flex space-x-8">
            <a href="{{ route('admin.approvals.index', ['filter' => $filter, 'status' => 'pending']) }}"
               class="py-2 px-1 border-b-2 font-medium text-sm {{ $status === 'pending' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300' }}">
                Pending
            </a>
            <a href="{{ route('admin.approvals.index', ['filter' => $filter, 'status' => 'approved']) }}"
               class="py-2 px-1 border-b-2 font-medium text-sm {{ $status === 'approved' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300' }}">
                Approved
            </a>
            <a href="{{ route('admin.approvals.index', ['filter' => $filter, 'status' => 'rejected']) }}"
               class="py-2 px-1 border-b-2 font-medium text-sm {{ $status === 'rejected' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300' }}">
                Rejected
            </a>
        </nav>
    </div>

    <!-- Approvals List -->
    <div class="bg-white rounded-lg shadow-sm dark:bg-navy-800">
        @if($approvals->count() > 0)
            <!-- Select All Header -->
            @if($status === 'pending')
            <div class="px-6 py-4 border-b border-slate-200 dark:border-navy-500">
                <label class="flex items-center">
                    <input type="checkbox" id="select-all" class="form-checkbox h-4 w-4 text-primary">
                    <span class="ml-2 text-sm text-slate-600 dark:text-slate-300">Select all visible items</span>
                </label>
            </div>
            @endif

            <!-- Approvals Items -->
            <div class="divide-y divide-slate-200 dark:divide-navy-500">
                @foreach($approvals as $approval)
                <div class="approval-item p-6 hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors duration-200"
                     data-type="{{ $approval['type'] }}" data-id="{{ $approval['id'] }}">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start space-x-4">
                            @if($status === 'pending')
                            <!-- Checkbox for bulk selection -->
                            <input type="checkbox" class="approval-checkbox form-checkbox h-4 w-4 text-primary mt-1"
                                   data-type="{{ $approval['type'] }}" data-id="{{ $approval['id'] }}">
                            @endif

                            <!-- Icon based on type -->
                            <div class="flex-shrink-0 mt-1">
                                @switch($approval['type'])
                                    @case('artist_verification')
                                        <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                        </div>
                                        @break
                                    @case('store_approval')
                                        <div class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                                            <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                            </svg>
                                        </div>
                                        @break
                                    @case('sacco_membership')
                                        <div class="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                                            <svg class="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                        </div>
                                        @break
                                @endswitch
                            </div>

                            <!-- Content -->
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ $approval['title'] }}</h3>

                                    <!-- Priority Badge -->
                                    @if($approval['priority'] === 'high')
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">High Priority</span>
                                    @elseif($approval['priority'] === 'medium')
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">Medium Priority</span>
                                    @endif
                                </div>

                                <p class="text-sm text-slate-600 dark:text-slate-300">{{ $approval['subtitle'] }}</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Submitted {{ $approval['submitted_at']->diffForHumans() }}
                                </p>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center space-x-2 ml-4">
                            <!-- View Details -->
                            <a href="{{ $approval['action_url'] }}" class="btn bg-slate-150 text-slate-800 hover:bg-slate-200 dark:bg-navy-500 dark:text-navy-100 dark:hover:bg-navy-450">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                View
                            </a>

                            @if($status === 'pending')
                            <!-- Approve -->
                            <form method="POST" action="{{ $approval['approve_url'] }}" class="inline-block">
                                @csrf
                                <button type="submit" class="btn bg-success text-white hover:bg-success-focus">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Approve
                                </button>
                            </form>

                            <!-- Reject -->
                            <form method="POST" action="{{ $approval['reject_url'] }}" class="inline-block">
                                @csrf
                                <button type="submit" class="btn bg-error text-white hover:bg-error-focus"
                                        onclick="return confirm('Are you sure you want to reject this application?')">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Reject
                                </button>
                            </form>
                            @else
                            <!-- Status Badge -->
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                {{ $status === 'approved' ? 'bg-success/10 text-success' : 'bg-error/10 text-error' }}">
                                {{ ucfirst($status) }}
                            </span>
                            @endif
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        @else
            <!-- Empty State -->
            <div class="p-12 text-center">
                <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-slate-900 dark:text-white">No {{ $status }} approvals</h3>
                <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    @if($status === 'pending')
                        Great job! No pending approvals at the moment.
                    @else
                        No {{ $status }} applications found for the selected filter.
                    @endif
                </p>
            </div>
        @endif
    </div>

</div>

@if($status === 'pending')
<!-- Bulk Actions JavaScript -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.getElementById('select-all');
    const individualCheckboxes = document.querySelectorAll('.approval-checkbox');
    const bulkApproveBtn = document.getElementById('bulk-approve-btn');

    // Select all functionality
    selectAllCheckbox?.addEventListener('change', function() {
        individualCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateBulkApproveButton();
    });

    // Individual checkbox functionality
    individualCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkedCheckboxes = document.querySelectorAll('.approval-checkbox:checked');
            selectAllCheckbox.checked = checkedCheckboxes.length === individualCheckboxes.length;
            updateBulkApproveButton();
        });
    });

    function updateBulkApproveButton() {
        const checkedCheckboxes = document.querySelectorAll('.approval-checkbox:checked');
        bulkApproveBtn.disabled = checkedCheckboxes.length === 0;
    }

    // Bulk approve functionality
    bulkApproveBtn?.addEventListener('click', function() {
        const checkedCheckboxes = document.querySelectorAll('.approval-checkbox:checked');

        if (checkedCheckboxes.length === 0) {
            alert('Please select at least one item to approve.');
            return;
        }

        if (!confirm(`Are you sure you want to approve ${checkedCheckboxes.length} selected item(s)?`)) {
            return;
        }

        const approvals = Array.from(checkedCheckboxes).map(checkbox => ({
            type: checkbox.dataset.type,
            id: parseInt(checkbox.dataset.id)
        }));

        // Disable button and show loading
        bulkApproveBtn.disabled = true;
        bulkApproveBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...';

        fetch('{{ route("admin.approvals.bulk-approve") }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ approvals })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success > 0) {
                alert(`Successfully approved ${data.success} item(s).`);
                location.reload();
            } else {
                alert('No items were approved. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        })
        .finally(() => {
            bulkApproveBtn.disabled = false;
            bulkApproveBtn.innerHTML = '<svg class="size-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Bulk Approve';
        });
    });
});
</script>
@endif

@endsection