@extends('layouts.admin')

@section('title', 'Ojokotau Campaigns')

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Ojokotau Campaigns</h1>
            <p class="text-slate-500 dark:text-navy-300">Manage community support and fundraising campaigns</p>
        </div>
    </div>
@endsection

@section('content')
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Campaigns</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['total'] ?? 0 }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Active</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['active'] ?? 0 }}</p>
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
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Pending Review</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['pending_review'] ?? 0 }}</p>
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
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Closed</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $stats['closed'] ?? 0 }}</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Campaigns Table -->
    <div class="card">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Campaigns List</h3>

            <!-- Filters -->
            <form method="GET" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search campaigns..."
                       class="form-input w-full sm:w-64">
                <select name="status" class="form-select w-full sm:w-auto">
                    <option value="">All Status</option>
                    @foreach(['draft', 'under_review', 'approved', 'active', 'closed', 'rejected', 'archived'] as $s)
                        <option value="{{ $s }}" {{ request('status') == $s ? 'selected' : '' }}>
                            {{ ucfirst(str_replace('_', ' ', $s)) }}
                        </option>
                    @endforeach
                </select>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary/90">Filter</button>
            </form>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-y border-slate-200 dark:border-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Campaign
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Creator
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Category
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Pledges
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
                    @forelse($campaigns ?? [] as $campaign)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- Campaign Info -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-3">
                                    <div class="size-12 rounded-lg bg-slate-100 dark:bg-navy-700 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-navy-100">{{ Str::limit($campaign->title, 30) }}</p>
                                        <div class="flex gap-1 mt-1">
                                            @if($campaign->is_verified)
                                                <span class="badge rounded-full bg-success/10 text-success text-xs">✓ Verified</span>
                                            @endif
                                            @if($campaign->is_featured)
                                                <span class="badge rounded-full bg-warning/10 text-warning text-xs">★ Featured</span>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- Creator -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm lg:px-5">
                                <div>
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $campaign->user->display_name ?? 'N/A' }}</p>
                                    <p class="text-xs text-slate-400 dark:text-navy-300">{{ $campaign->user->email ?? '' }}</p>
                                </div>
                            </td>

                            <!-- Category -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-100 lg:px-5">
                                <span class="badge rounded-full bg-slate-100 text-slate-800 dark:bg-navy-500 dark:text-navy-100">
                                    {{ $campaign->category_label ?? 'N/A' }}
                                </span>
                            </td>

                            <!-- Pledges -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-100 lg:px-5">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium">{{ $campaign->pledges_count ?? 0 }}</span>
                                    <span class="text-xs text-slate-400 dark:text-navy-300">pledges</span>
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                @php
                                    $statusClasses = [
                                        'draft' => 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100',
                                        'under_review' => 'bg-warning/10 text-warning',
                                        'approved' => 'bg-info/10 text-info',
                                        'active' => 'bg-success/10 text-success',
                                        'closed' => 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100',
                                        'rejected' => 'bg-error/10 text-error',
                                        'archived' => 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100',
                                    ];
                                @endphp
                                <span class="badge rounded-full {{ $statusClasses[$campaign->status] ?? 'bg-slate-150 text-slate-800' }}">
                                    {{ ucfirst(str_replace('_', ' ', $campaign->status)) }}
                                </span>
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center gap-1">
                                    <!-- View -->
                                    <a href="{{ route('admin.ojokotau.campaigns.show', $campaign) }}" 
                                       class="btn size-8 rounded-full p-0 hover:bg-primary/20 text-primary" 
                                       title="View Campaign">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>
                                    
                                    @if($campaign->status === 'under_review')
                                    <!-- Approve -->
                                    <form action="{{ route('admin.ojokotau.campaigns.approve', $campaign) }}" method="POST" class="inline">
                                        @csrf
                                        <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success" title="Approve">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    </form>
                                    
                                    <!-- Reject -->
                                    <form action="{{ route('admin.ojokotau.campaigns.reject', $campaign) }}" method="POST" class="inline">
                                        @csrf
                                        <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error" title="Reject">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-4 py-8 text-center">
                                <div class="flex flex-col items-center justify-center space-y-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-slate-300 dark:text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <div>
                                        <p class="text-slate-600 dark:text-navy-100">No campaigns found</p>
                                        <p class="text-sm text-slate-400 dark:text-navy-300">Community campaigns will appear here once created.</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if(isset($campaigns) && $campaigns->hasPages())
            <div class="p-4 sm:p-5 border-t border-slate-200 dark:border-navy-500">
                {{ $campaigns->withQueryString()->links() }}
            </div>
        @endif
    </div>
@endsection