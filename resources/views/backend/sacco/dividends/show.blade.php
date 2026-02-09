@extends('layouts.admin')

@section('title', 'Dividend Details - ' . $dividend->year)

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <div class="flex items-center gap-3 mb-2">
                <a href="{{ route('admin.sacco.dividends.index') }}" class="btn btn-secondary btn-sm">
                    <svg class="size-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </a>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">{{ $dividend->year }} Dividend Distribution</h1>
            </div>
            <p class="text-slate-600 dark:text-navy-300">Detailed breakdown and member distributions</p>
        </div>
        <div class="flex items-center gap-2">
            @if($dividend->status === 'calculated')
                <button onclick="approveDividend()" class="btn btn-success">
                    <svg class="size-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Approve Dividend
                </button>
            @endif
            
            @if($dividend->status === 'approved')
                <button onclick="distributeDividend()" class="btn btn-primary">
                    <svg class="size-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Distribute to Members
                </button>
            @endif

            <button onclick="exportDividend()" class="btn btn-secondary">
                <svg class="size-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
            </button>
        </div>
    </div>

    <!-- Status Banner -->
    <div class="mb-6">
        @if($dividend->status === 'calculated')
            <div class="alert alert-info">
                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>This dividend has been calculated and is pending approval.</span>
            </div>
        @elseif($dividend->status === 'approved')
            <div class="alert alert-warning">
                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This dividend has been approved and is ready for distribution to members.</span>
            </div>
        @elseif($dividend->status === 'distributed')
            <div class="alert alert-success">
                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This dividend has been distributed to all eligible members on {{ $dividend->distributed_at->format('M j, Y') }}.</span>
            </div>
        @elseif($dividend->status === 'cancelled')
            <div class="alert alert-danger">
                <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This dividend calculation has been cancelled.</span>
            </div>
        @endif
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div class="text-sm opacity-90 mb-1">Total Profit</div>
            <div class="text-2xl font-bold">UGX {{ number_format($dividend->total_profit) }}</div>
            <div class="text-xs opacity-75 mt-2">For year {{ $dividend->year }}</div>
        </div>

        <div class="card p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div class="text-sm opacity-90 mb-1">Distributable Amount</div>
            <div class="text-2xl font-bold">UGX {{ number_format($dividend->distributable_amount) }}</div>
            <div class="text-xs opacity-75 mt-2">{{ $dividend->distribution_percentage }}% of profit</div>
        </div>

        <div class="card p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div class="text-sm opacity-90 mb-1">Rate per Share</div>
            <div class="text-2xl font-bold">UGX {{ number_format($dividend->rate_per_share, 2) }}</div>
            <div class="text-xs opacity-75 mt-2">Total shares: {{ number_format($dividend->total_shares) }}</div>
        </div>

        <div class="card p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div class="text-sm opacity-90 mb-1">Eligible Members</div>
            <div class="text-2xl font-bold">{{ number_format($dividend->distributions->count()) }}</div>
            <div class="text-xs opacity-75 mt-2">Tax: {{ $dividend->withholding_tax_percentage }}%</div>
        </div>
    </div>

    <!-- Calculation Details -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2">
            <!-- Member Distributions Table -->
            <div class="card">
                <div class="card-header flex items-center justify-between">
                    <h2 class="text-xl font-bold">Member Distributions</h2>
                    <div class="flex items-center gap-2">
                        <input type="text" id="searchMember" placeholder="Search member..." class="form-input form-input-sm" onkeyup="filterMembers()">
                        <select class="form-select form-select-sm" onchange="filterDistributionStatus(this.value)">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="overflow-x-auto">
                        <table class="table w-full" id="distributionsTable">
                            <thead>
                                <tr class="bg-slate-100 dark:bg-navy-800">
                                    <th class="px-4 py-3 text-left">Member</th>
                                    <th class="px-4 py-3 text-right">Shares</th>
                                    <th class="px-4 py-3 text-right">Gross Amount</th>
                                    <th class="px-4 py-3 text-right">Tax</th>
                                    <th class="px-4 py-3 text-right">Net Amount</th>
                                    <th class="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($dividend->distributions as $dist)
                                <tr class="border-b border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-900">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <div class="avatar">
                                                <img src="{{ $dist->member->user->avatar_url ?? '/images/default-avatar.svg' }}" alt="{{ $dist->member->user->display_name ?? $dist->member->user->username }}">
                                            </div>
                                            <div>
                                                <div class="font-medium">{{ $dist->member->user->display_name ?? $dist->member->user->username }}</div>
                                                <div class="text-xs text-slate-500">{{ $dist->member->membership_number }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-right">{{ number_format($dist->shares_held, 2) }}</td>
                                    <td class="px-4 py-3 text-right font-medium">UGX {{ number_format($dist->gross_amount) }}</td>
                                    <td class="px-4 py-3 text-right text-red-600">UGX {{ number_format($dist->withholding_tax) }}</td>
                                    <td class="px-4 py-3 text-right font-bold text-green-600">UGX {{ number_format($dist->net_amount) }}</td>
                                    <td class="px-4 py-3 text-center">
                                        @if($dist->status === 'paid')
                                            <span class="badge badge-success">Paid</span>
                                            <div class="text-xs text-slate-500 mt-1">{{ $dist->paid_at->format('M j, Y') }}</div>
                                        @else
                                            <span class="badge badge-warning">Pending</span>
                                        @endif
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                            <tfoot>
                                <tr class="bg-slate-50 dark:bg-navy-800 font-bold">
                                    <td class="px-4 py-3">TOTAL</td>
                                    <td class="px-4 py-3 text-right">{{ number_format($dividend->distributions->sum('shares_held'), 2) }}</td>
                                    <td class="px-4 py-3 text-right">UGX {{ number_format($dividend->distributions->sum('gross_amount')) }}</td>
                                    <td class="px-4 py-3 text-right text-red-600">UGX {{ number_format($dividend->distributions->sum('withholding_tax')) }}</td>
                                    <td class="px-4 py-3 text-right text-green-600">UGX {{ number_format($dividend->distributions->sum('net_amount')) }}</td>
                                    <td class="px-4 py-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <!-- Calculation Info -->
            <div class="card mb-4">
                <div class="card-header">
                    <h3 class="text-lg font-bold">Calculation Details</h3>
                </div>
                <div class="card-body space-y-3">
                    <div class="flex justify-between py-2 border-b border-slate-200 dark:border-navy-700">
                        <span class="text-slate-600 dark:text-navy-300">Year:</span>
                        <span class="font-semibold">{{ $dividend->year }}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-200 dark:border-navy-700">
                        <span class="text-slate-600 dark:text-navy-300">Total Profit:</span>
                        <span class="font-semibold">UGX {{ number_format($dividend->total_profit) }}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-200 dark:border-navy-700">
                        <span class="text-slate-600 dark:text-navy-300">Distribution %:</span>
                        <span class="font-semibold text-blue-600">{{ $dividend->distribution_percentage }}%</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-200 dark:border-navy-700">
                        <span class="text-slate-600 dark:text-navy-300">Distributable:</span>
                        <span class="font-semibold text-green-600">UGX {{ number_format($dividend->distributable_amount) }}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-200 dark:border-navy-700">
                        <span class="text-slate-600 dark:text-navy-300">Total Shares:</span>
                        <span class="font-semibold">{{ number_format($dividend->total_shares) }}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b border-slate-200 dark:border-navy-700">
                        <span class="text-slate-600 dark:text-navy-300">Rate/Share:</span>
                        <span class="font-semibold text-purple-600">UGX {{ number_format($dividend->rate_per_share, 2) }}</span>
                    </div>
                    <div class="flex justify-between py-2">
                        <span class="text-slate-600 dark:text-navy-300">WHT %:</span>
                        <span class="font-semibold text-red-600">{{ $dividend->withholding_tax_percentage }}%</span>
                    </div>
                </div>
            </div>

            <!-- Timeline -->
            <div class="card">
                <div class="card-header">
                    <h3 class="text-lg font-bold">Timeline</h3>
                </div>
                <div class="card-body">
                    <div class="space-y-4">
                        @if($dividend->calculated_at)
                        <div class="flex gap-3">
                            <div class="size-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                <svg class="size-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium">Calculated</div>
                                <div class="text-sm text-slate-500">{{ $dividend->calculated_at->format('M j, Y H:i') }}</div>
                                <div class="text-xs text-slate-400">By {{ $dividend->calculatedBy->display_name ?? $dividend->calculatedBy->username ?? 'System' ?? 'N/A' }}</div>
                            </div>
                        </div>
                        @endif

                        @if($dividend->approved_at)
                        <div class="flex gap-3">
                            <div class="size-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                                <svg class="size-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium">Approved</div>
                                <div class="text-sm text-slate-500">{{ $dividend->approved_at->format('M j, Y H:i') }}</div>
                                <div class="text-xs text-slate-400">By {{ $dividend->approvedBy->display_name ?? $dividend->approvedBy->username ?? 'System' ?? 'N/A' }}</div>
                            </div>
                        </div>
                        @endif

                        @if($dividend->distributed_at)
                        <div class="flex gap-3">
                            <div class="size-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                                <svg class="size-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium">Distributed</div>
                                <div class="text-sm text-slate-500">{{ $dividend->distributed_at->format('M j, Y H:i') }}</div>
                            </div>
                        </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function approveDividend() {
    if (confirm('Are you sure you want to approve this dividend? Once approved, it can be distributed to members.')) {
        fetch(`/admin/sacco/dividends/{{ $dividend->id }}/approve`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        });
    }
}

function distributeDividend() {
    if (confirm('Are you sure you want to distribute this dividend? This will credit all eligible members accounts.')) {
        fetch(`/admin/sacco/dividends/{{ $dividend->id }}/distribute`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        });
    }
}

function exportDividend() {
    window.location.href = `/admin/sacco/dividends/{{ $dividend->id }}/export`;
}

function filterMembers() {
    const input = document.getElementById('searchMember');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('distributionsTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length - 1; i++) { // Skip header and footer
        const td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
        }
    }
}

function filterDistributionStatus(status) {
    window.location.href = `{{ route('admin.sacco.dividends.show', $dividend) }}?status=${status}`;
}
</script>
@endpush
@endsection
