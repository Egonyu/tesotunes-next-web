@extends('layouts.admin')

@section('title', 'SACCO Members')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">SACCO Members</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Manage all member accounts and applications</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.sacco.members.pending') }}" class="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning hover:bg-warning/20 rounded-lg transition">
                <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Applications
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Total Members</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $members->total() }}</p>
                </div>
                <div class="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Active Members</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $members->where('status', 'active')->count() }}</p>
                </div>
                <div class="p-2 bg-success/10 text-success rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Pending</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $members->where('status', 'pending')->count() }}</p>
                </div>
                <div class="p-2 bg-warning/10 text-warning rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card p-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-slate-600 dark:text-navy-300 text-sm">Suspended</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50 mt-1">{{ $members->where('status', 'suspended')->count() }}</p>
                </div>
                <div class="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Form -->
    <div class="card p-5 mb-6">
        <form method="GET" action="{{ route('admin.sacco.members.index') }}" class="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div class="md:col-span-5">
                <input type="text" name="search" 
                       class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary" 
                       placeholder="Search by name or email..." 
                       value="{{ request('search') }}">
            </div>
            <div class="md:col-span-3">
                <select name="status" class="w-full px-4 py-2 border border-slate-300 dark:border-navy-400 rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="">All Status</option>
                    <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                    <option value="suspended" {{ request('status') === 'suspended' ? 'selected' : '' }}>Suspended</option>
                    <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Rejected</option>
                </select>
            </div>
            <div class="md:col-span-4 flex gap-2">
                <button type="submit" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                </button>
                <a href="{{ route('admin.sacco.members.index') }}" class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-navy-600 text-slate-700 dark:text-navy-100 rounded-lg hover:bg-slate-300 transition">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                </a>
            </div>
        </form>
    </div>

    <!-- Members Table -->
    <div class="card">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-slate-50 dark:bg-navy-600">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Member #</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Type</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Credit Score</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Total Savings</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Active Loans</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-navy-200 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-navy-500">
                    @forelse($members as $member)
                    <tr class="hover:bg-slate-50 dark:hover:bg-navy-600 transition">
                        <td class="px-4 py-3 text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->membership_number }}</td>
                        <td class="px-4 py-3">
                            <div class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $member->user->display_name ?? $member->user->username }}</div>
                            <div class="text-xs text-slate-500 dark:text-navy-400">{{ $member->user->email }}</div>
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs font-medium rounded-full bg-info/10 text-info">
                                {{ ucfirst($member->member_type) }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="text-sm font-bold text-slate-800 dark:text-navy-50 mb-1">{{ $member->credit_score }}</div>
                            <div class="w-20 h-1.5 bg-slate-200 dark:bg-navy-500 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-blue-500 to-green-500" style="width: {{ ($member->credit_score / 900) * 100 }}%"></div>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-slate-700 dark:text-navy-200">
                            UGX {{ number_format($member->accounts->where('account_type', 'savings')->sum('balance')) }}
                        </td>
                        <td class="px-4 py-3 text-sm text-slate-700 dark:text-navy-200">
                            {{ $member->loans->whereIn('status', ['active', 'overdue'])->count() }}
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 text-xs font-medium rounded-full 
                                {{ $member->status === 'active' ? 'bg-success/10 text-success' : '' }}
                                {{ $member->status === 'pending' ? 'bg-warning/10 text-warning' : '' }}
                                {{ $member->status === 'suspended' ? 'bg-red-500/10 text-red-500' : '' }}
                                {{ $member->status === 'rejected' ? 'bg-slate-500/10 text-slate-500' : '' }}">
                                {{ ucfirst($member->status) }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <a href="{{ route('admin.sacco.members.show', $member) }}" 
                                   class="inline-flex items-center justify-center size-8 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition">
                                    <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                                @if($member->status === 'pending')
                                <form action="{{ route('admin.sacco.members.approve', $member) }}" method="POST" class="inline">
                                    @csrf
                                    <button type="submit" 
                                            class="inline-flex items-center justify-center size-8 bg-success/10 text-success hover:bg-success/20 rounded-lg transition"
                                            onclick="return confirm('Approve this member?')">
                                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="px-4 py-12 text-center">
                            <div class="flex flex-col items-center">
                                <svg class="size-12 text-slate-400 dark:text-navy-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p class="text-slate-500 dark:text-navy-400">No members found</p>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($members->hasPages())
        <div class="px-4 py-3 border-t border-slate-200 dark:border-navy-500">
            {{ $members->links() }}
        </div>
        @endif
    </div>
</div>
@endsection
