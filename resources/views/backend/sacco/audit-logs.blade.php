@extends('layouts.admin')

@section('title', 'SACCO Audit Logs')

@section('content')
<div class="dashboard-content">
    <!-- Page Header - Matching Dashboard Style -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Audit Logs</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Complete audit trail of all SACCO activities and system events</p>
        </div>
        <div class="flex items-center gap-3">
            <button type="button" onclick="exportLogs()" class="btn btn-primary">
                <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Logs
            </button>
            <a href="{{ route('admin.sacco.dashboard') }}" class="btn btn-outline-secondary">
                <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </a>
        </div>
    </div>

    <!-- Filter Controls -->
    <div class="card p-5 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">
            <svg class="size-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter & Search
        </h2>
        <form method="GET" action="{{ route('admin.sacco.audit-logs') }}" id="filterForm">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Date Range -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        Start Date
                    </label>
                    <input type="date" name="start_date" value="{{ request('start_date') }}" 
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        End Date
                    </label>
                    <input type="date" name="end_date" value="{{ request('end_date') }}" 
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Action Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        Action Type
                    </label>
                    <select name="action" class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Actions</option>
                        <optgroup label="👥 Member Actions">
                            <option value="member_created" {{ request('action') == 'member_created' ? 'selected' : '' }}>Member Created</option>
                            <option value="member_approved" {{ request('action') == 'member_approved' ? 'selected' : '' }}>Member Approved</option>
                            <option value="member_suspended" {{ request('action') == 'member_suspended' ? 'selected' : '' }}>Member Suspended</option>
                            <option value="member_activated" {{ request('action') == 'member_activated' ? 'selected' : '' }}>Member Activated</option>
                        </optgroup>
                        <optgroup label="💰 Loan Actions">
                            <option value="loan_created" {{ request('action') == 'loan_created' ? 'selected' : '' }}>Loan Created</option>
                            <option value="loan_approved" {{ request('action') == 'loan_approved' ? 'selected' : '' }}>Loan Approved</option>
                            <option value="loan_disbursed" {{ request('action') == 'loan_disbursed' ? 'selected' : '' }}>Loan Disbursed</option>
                            <option value="loan_repayment" {{ request('action') == 'loan_repayment' ? 'selected' : '' }}>Loan Repayment</option>
                        </optgroup>
                        <optgroup label="💳 Transaction Actions">
                            <option value="transaction_created" {{ request('action') == 'transaction_created' ? 'selected' : '' }}>Transaction Created</option>
                            <option value="transaction_approved" {{ request('action') == 'transaction_approved' ? 'selected' : '' }}>Transaction Approved</option>
                            <option value="transaction_rejected" {{ request('action') == 'transaction_rejected' ? 'selected' : '' }}>Transaction Rejected</option>
                        </optgroup>
                        <optgroup label="📊 Dividend Actions">
                            <option value="dividend_calculated" {{ request('action') == 'dividend_calculated' ? 'selected' : '' }}>Dividend Calculated</option>
                            <option value="dividend_approved" {{ request('action') == 'dividend_approved' ? 'selected' : '' }}>Dividend Approved</option>
                            <option value="dividend_distributed" {{ request('action') == 'dividend_distributed' ? 'selected' : '' }}>Dividend Distributed</option>
                        </optgroup>
                        <optgroup label="⚙️ Settings Actions">
                            <option value="settings_updated" {{ request('action') == 'settings_updated' ? 'selected' : '' }}>Settings Updated</option>
                            <option value="loan_product_created" {{ request('action') == 'loan_product_created' ? 'selected' : '' }}>Loan Product Created</option>
                            <option value="loan_product_updated" {{ request('action') == 'loan_product_updated' ? 'selected' : '' }}>Loan Product Updated</option>
                        </optgroup>
                    </select>
                </div>

                <!-- User Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        User
                    </label>
                    <select name="user_id" class="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Users</option>
                        @foreach(\App\Models\User::whereHas('roles', function($q) {
                            $q->whereIn('name', ['admin', 'super_admin', 'finance']);
                        })->get() as $user)
                        <option value="{{ $user->id }}" {{ request('user_id') == $user->id ? 'selected' : '' }}>
                            {{ $user->display_name ?? $user->username }}
                        </option>
                        @endforeach
                    </select>
                </div>

                <!-- Search -->
                <div class="md:col-span-2 lg:col-span-3">
                    <label class="block text-sm font-medium text-slate-700 dark:text-navy-100 mb-2">
                        Search
                    </label>
                    <input type="text" name="search" value="{{ request('search') }}" 
                           placeholder="Search by description, IP address, or any details..." 
                           class="form-input w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Filter Buttons -->
                <div class="flex items-end gap-2">
                    <button type="submit" class="btn btn-primary flex-1">
                        <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Apply Filters
                    </button>
                    <a href="{{ route('admin.sacco.audit-logs') }}" class="btn btn-outline-secondary" title="Reset Filters">
                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </a>
                </div>
            </div>
        </form>
    </div>

    <!-- Stats Overview - Matching Dashboard Gradient Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <!-- Total Logs Card -->
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-blue-100 text-sm font-medium">Total Logs</p>
                    <h3 class="text-3xl font-bold mt-1">{{ number_format($logs->total()) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Today's Actions Card -->
        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white p-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-green-100 text-sm font-medium">Today's Actions</p>
                    <h3 class="text-3xl font-bold mt-1">{{ number_format(\App\Modules\Sacco\Models\SaccoAuditLog::whereDate('created_at', today())->count()) }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Active Users Card -->
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-purple-100 text-sm font-medium">Active Users</p>
                    <h3 class="text-3xl font-bold mt-1">{{ \App\Modules\Sacco\Models\SaccoAuditLog::distinct('user_id')->count('user_id') }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- Last Activity Card -->
        <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-orange-100 text-sm font-medium">Last Activity</p>
                    <h3 class="text-lg font-bold mt-1">{{ \App\Modules\Sacco\Models\SaccoAuditLog::latest()->first()?->created_at?->diffForHumans() ?? 'N/A' }}</h3>
                </div>
                <div class="p-3 bg-white/20 rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="card">
        <div class="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-navy-500">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-navy-50">
                <svg class="size-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Audit Trail
            </h2>
            <span class="badge bg-primary/10 text-primary dark:bg-accent-light/15 dark:text-accent-light">
                {{ $logs->total() }} records
            </span>
        </div>

        @if($logs->isEmpty())
        <div class="text-center py-16">
            <svg class="size-20 mx-auto text-slate-300 dark:text-navy-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 class="text-lg font-semibold text-slate-700 dark:text-navy-100">No Audit Logs Found</h3>
            <p class="text-slate-500 dark:text-navy-300 mt-1">No audit logs match your current filters</p>
            <a href="{{ route('admin.sacco.audit-logs') }}" class="btn btn-primary mt-4">
                <svg class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear Filters
            </a>
        </div>
        @else
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-b border-slate-200 dark:border-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Timestamp
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            User
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Action
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Module
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            Details
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5">
                            IP Address
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase text-slate-800 dark:text-navy-100 lg:px-5 text-center">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($logs as $log)
                    <tr class="border-b border-slate-200 dark:border-navy-500 hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                        <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                            <div class="text-sm">
                                <div class="font-semibold text-slate-700 dark:text-navy-100">{{ $log->created_at->format('M d, Y') }}</div>
                                <div class="text-slate-500 dark:text-navy-300">{{ $log->created_at->format('h:i A') }}</div>
                            </div>
                        </td>
                        <td class="px-4 py-3 lg:px-5">
                            @if($log->user)
                            <div class="flex items-center gap-3">
                                <div class="avatar size-9">
                                    <img class="rounded-full" src="{{ $log->user->avatar_url ?? '/images/default-avatar.svg' }}" alt="{{ $log->user->display_name ?? $log->user->username ?? 'Unknown' }}">
                                </div>
                                <div>
                                    <div class="font-medium text-slate-700 dark:text-navy-100">{{ $log->user->display_name ?? $log->user->username ?? 'Unknown' }}</div>
                                    <div class="text-xs text-slate-500 dark:text-navy-300">{{ $log->user->email }}</div>
                                </div>
                            </div>
                            @else
                            <div class="flex items-center gap-3">
                                <div class="flex size-9 items-center justify-center rounded-full bg-slate-200 dark:bg-navy-500">
                                    <svg class="size-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div class="font-medium text-slate-700 dark:text-navy-100">System</div>
                                    <div class="text-xs text-slate-500 dark:text-navy-300">Automated</div>
                                </div>
                            </div>
                            @endif
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                            <span class="badge {{ 
                                str_contains($log->action, 'approved') || str_contains($log->action, 'activated') || str_contains($log->action, 'disbursed') ? 'bg-success/10 text-success dark:bg-success/15' : 
                                (str_contains($log->action, 'rejected') || str_contains($log->action, 'suspended') || str_contains($log->action, 'deleted') ? 'bg-error/10 text-error dark:bg-error/15' : 
                                (str_contains($log->action, 'updated') || str_contains($log->action, 'edited') ? 'bg-warning/10 text-warning dark:bg-warning/15' : 
                                (str_contains($log->action, 'created') ? 'bg-info/10 text-info dark:bg-info/15' : 'bg-primary/10 text-primary dark:bg-accent-light/15 dark:text-accent-light')))
                            }}">
                                {{ str_replace('_', ' ', ucwords($log->action, '_')) }}
                            </span>
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                            <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">
                                {{ class_basename($log->auditable_type ?? 'N/A') }}
                            </span>
                        </td>
                        <td class="px-4 py-3 lg:px-5">
                            <div class="text-sm">
                                @if($log->new_values && is_array($log->new_values))
                                <div class="flex flex-wrap gap-1">
                                    @foreach(array_slice($log->new_values, 0, 2) as $key => $value)
                                        <span class="badge bg-slate-100 text-slate-700 dark:bg-navy-600 dark:text-navy-100 text-xs">
                                            <strong>{{ ucfirst($key) }}:</strong> 
                                            {{ is_bool($value) ? ($value ? 'Yes' : 'No') : (is_string($value) ? Str::limit($value, 15) : $value) }}
                                        </span>
                                    @endforeach
                                    @if(count($log->new_values) > 2)
                                        <span class="text-xs text-slate-500 dark:text-navy-300">+{{ count($log->new_values) - 2 }} more</span>
                                    @endif
                                </div>
                                @else
                                <span class="text-slate-400 dark:text-navy-400 text-sm">No details</span>
                                @endif
                            </div>
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                            <code class="text-xs bg-slate-100 dark:bg-navy-600 px-2 py-1 rounded">{{ $log->ip_address ?? 'N/A' }}</code>
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 lg:px-5 text-center">
                            <button type="button" onclick="viewLogDetails({{ $log->id }})" 
                                    class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25"
                                    title="View Details">
                                <svg class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-slate-200 px-4 py-4 dark:border-navy-500 sm:px-5">
            <div class="text-xs+ text-slate-500 dark:text-navy-300">
                Showing <strong>{{ $logs->firstItem() }}</strong> to <strong>{{ $logs->lastItem() }}</strong> of <strong>{{ number_format($logs->total()) }}</strong> entries
            </div>
            <div>
                {{ $logs->links() }}
            </div>
        </div>
        @endif
    </div>
</div>


<!-- Log Details Modal -->
<div class="modal" id="logDetailsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Audit Log Details</h3>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="logDetailsContent">
                <div class="text-center py-12">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <p class="mt-3 text-slate-500">Loading audit log details...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function viewLogDetails(logId) {
    const modal = new bootstrap.Modal(document.getElementById('logDetailsModal'));
    const content = document.getElementById('logDetailsContent');
    
    modal.show();
    
    // Fetch log details via AJAX
    fetch(`/admin/sacco/audit-logs/${logId}`)
        .then(response => response.json())
        .then(data => {
            content.innerHTML = `
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                            <label class="text-xs font-medium text-slate-500 dark:text-navy-300 mb-1 block">Timestamp</label>
                            <div class="font-semibold text-slate-800 dark:text-navy-100">${data.created_at}</div>
                        </div>
                        <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                            <label class="text-xs font-medium text-slate-500 dark:text-navy-300 mb-1 block">User</label>
                            <div class="font-semibold text-slate-800 dark:text-navy-100">${data.user_name || 'System'}</div>
                        </div>
                        <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                            <label class="text-xs font-medium text-slate-500 dark:text-navy-300 mb-1 block">Action</label>
                            <div class="font-semibold text-slate-800 dark:text-navy-100 capitalize">${data.action.replace(/_/g, ' ')}</div>
                        </div>
                        <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                            <label class="text-xs font-medium text-slate-500 dark:text-navy-300 mb-1 block">Module</label>
                            <div class="font-semibold text-slate-800 dark:text-navy-100">${data.auditable_type || 'N/A'}</div>
                        </div>
                        <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                            <label class="text-xs font-medium text-slate-500 dark:text-navy-300 mb-1 block">IP Address</label>
                            <div><code class="text-sm">${data.ip_address || 'N/A'}</code></div>
                        </div>
                        <div class="p-3 bg-slate-50 dark:bg-navy-600 rounded-lg">
                            <label class="text-xs font-medium text-slate-500 dark:text-navy-300 mb-1 block">User Agent</label>
                            <div class="text-sm truncate" title="${data.user_agent || 'N/A'}">${data.user_agent || 'N/A'}</div>
                        </div>
                    </div>
                    ${data.old_values ? `
                    <div class="card border border-warning-focus">
                        <div class="card-header bg-warning/10">
                            <h5 class="font-semibold">Old Values</h5>
                        </div>
                        <div class="card-body">
                            <pre class="bg-slate-100 dark:bg-navy-700 p-3 rounded text-sm overflow-auto max-h-64"><code>${JSON.stringify(data.old_values, null, 2)}</code></pre>
                        </div>
                    </div>
                    ` : ''}
                    ${data.new_values ? `
                    <div class="card border border-success-focus">
                        <div class="card-header bg-success/10">
                            <h5 class="font-semibold">New Values</h5>
                        </div>
                        <div class="card-body">
                            <pre class="bg-slate-100 dark:bg-navy-700 p-3 rounded text-sm overflow-auto max-h-64"><code>${JSON.stringify(data.new_values, null, 2)}</code></pre>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        })
        .catch(error => {
            content.innerHTML = `
                <div class="alert alert-error flex items-center space-x-2">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <strong>Error!</strong> Failed to load audit log details.
                    </div>
                </div>
            `;
        });
}

function exportLogs() {
    const form = document.getElementById('filterForm');
    const params = new URLSearchParams(new FormData(form));
    window.location.href = `/admin/sacco/audit-logs/export?${params.toString()}`;
}

// Auto-submit filter form on select change
document.querySelectorAll('#filterForm select').forEach(select => {
    select.addEventListener('change', function() {
        document.getElementById('filterForm').submit();
    });
});
</script>
@endpush
@endsection
