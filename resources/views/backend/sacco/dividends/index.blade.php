@extends('layouts.admin')

@section('title', 'SACCO Dividends')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Dividend Management</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Manage profit distributions to members</p>
        </div>
        <button onclick="openCalculateDividendModal()" class="btn btn-primary">
            <svg class="size-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Calculate New Dividend
        </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div class="text-sm opacity-90 mb-1">Total Distributed (All Time)</div>
            <div class="text-2xl font-bold">UGX {{ number_format($dividends->sum('distributable_amount')) }}</div>
        </div>
        <div class="card p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div class="text-sm opacity-90 mb-1">Current Year</div>
            <div class="text-2xl font-bold">{{ now()->year }}</div>
        </div>
        <div class="card p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div class="text-sm opacity-90 mb-1">Pending Distributions</div>
            <div class="text-2xl font-bold">{{ $dividends->where('status', 'pending')->count() }}</div>
        </div>
        <div class="card p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div class="text-sm opacity-90 mb-1">Members Eligible</div>
            <div class="text-2xl font-bold">{{ \App\Modules\Sacco\Models\SaccoMember::where('status', 'active')->count() }}</div>
        </div>
    </div>

    <!-- Dividends Table -->
    <div class="card">
        <div class="card-header flex items-center justify-between">
            <h2 class="text-xl font-bold">Dividend History</h2>
            <div class="flex items-center gap-2">
                <select class="form-select form-select-sm" onchange="filterByStatus(this.value)">
                    <option value="">All Status</option>
                    <option value="calculated">Calculated</option>
                    <option value="approved">Approved</option>
                    <option value="distributed">Distributed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>
        <div class="card-body p-0">
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr class="bg-slate-100 dark:bg-navy-800">
                            <th class="px-4 py-3 text-left">Year</th>
                            <th class="px-4 py-3 text-right">Total Profit</th>
                            <th class="px-4 py-3 text-right">Distributable Amount</th>
                            <th class="px-4 py-3 text-center">Distribution %</th>
                            <th class="px-4 py-3 text-right">Rate/Share</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-center">Calculated By</th>
                            <th class="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($dividends as $dividend)
                        <tr class="border-b border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-900">
                            <td class="px-4 py-3 font-semibold">{{ $dividend->year }}</td>
                            <td class="px-4 py-3 text-right font-medium">UGX {{ number_format($dividend->total_profit) }}</td>
                            <td class="px-4 py-3 text-right font-bold text-green-600">UGX {{ number_format($dividend->distributable_amount) }}</td>
                            <td class="px-4 py-3 text-center">{{ $dividend->distribution_percentage }}%</td>
                            <td class="px-4 py-3 text-right">UGX {{ number_format($dividend->rate_per_share, 2) }}</td>
                            <td class="px-4 py-3 text-center">
                                @if($dividend->status === 'calculated')
                                    <span class="badge badge-info">Calculated</span>
                                @elseif($dividend->status === 'approved')
                                    <span class="badge badge-warning">Approved</span>
                                @elseif($dividend->status === 'distributed')
                                    <span class="badge badge-success">Distributed</span>
                                @else
                                    <span class="badge badge-danger">Cancelled</span>
                                @endif
                            </td>
                            <td class="px-4 py-3 text-center text-sm">
                                {{ $dividend->calculatedBy->display_name ?? $dividend->calculatedBy->username ?? 'System' ?? 'N/A' }}<br>
                                <span class="text-xs text-slate-500">{{ $dividend->calculated_at?->format('M j, Y') }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center justify-center gap-2">
                                    <a href="{{ route('admin.sacco.dividends.show', $dividend) }}" class="btn btn-sm btn-info" title="View Details">
                                        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>
                                    
                                    @if($dividend->status === 'calculated')
                                        <button onclick="approveDividend({{ $dividend->id }})" class="btn btn-sm btn-success" title="Approve">
                                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    @endif

                                    @if($dividend->status === 'approved')
                                        <button onclick="distributeDividend({{ $dividend->id }})" class="btn btn-sm btn-primary" title="Distribute">
                                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    @endif

                                    @if(in_array($dividend->status, ['calculated', 'approved']))
                                        <button onclick="cancelDividend({{ $dividend->id }})" class="btn btn-sm btn-danger" title="Cancel">
                                            <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    @endif
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="px-4 py-8 text-center text-slate-500">
                                <div class="flex flex-col items-center gap-3">
                                    <svg class="size-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p class="text-lg font-medium">No dividends calculated yet</p>
                                    <button onclick="openCalculateDividendModal()" class="btn btn-primary btn-sm">
                                        Calculate First Dividend
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
        @if($dividends->hasPages())
        <div class="card-footer">
            {{ $dividends->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Calculate Dividend Modal -->
<div id="calculateDividendModal" class="modal hidden">
    <div class="modal-overlay"></div>
    <div class="modal-content max-w-2xl">
        <div class="modal-header">
            <h3 class="text-xl font-bold">Calculate New Dividend</h3>
            <button onclick="closeCalculateDividendModal()" class="btn-close">&times;</button>
        </div>
        <form action="{{ route('admin.sacco.dividends.calculate') }}" method="POST">
            @csrf
            <div class="modal-body space-y-4">
                <div class="alert alert-info">
                    <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Dividend will be calculated based on shares held by active members.</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Year <span class="text-danger">*</span></label>
                        <input type="number" name="year" class="form-input" value="{{ now()->year }}" min="2000" max="2100" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Total Profit (UGX) <span class="text-danger">*</span></label>
                        <input type="number" name="total_profit" class="form-input" step="0.01" min="0" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Distribution Percentage <span class="text-danger">*</span></label>
                        <input type="number" name="distribution_percentage" class="form-input" value="70" min="1" max="100" required>
                        <small class="text-slate-500">Percentage of profit to distribute (typically 60-80%)</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Withholding Tax % <span class="text-danger">*</span></label>
                        <input type="number" name="withholding_tax_percentage" class="form-input" value="15" min="0" max="100" required>
                        <small class="text-slate-500">Tax percentage as per URA regulations</small>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Notes (Optional)</label>
                    <textarea name="notes" class="form-textarea" rows="3" placeholder="Add any additional notes about this dividend calculation"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" onclick="closeCalculateDividendModal()" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Calculate Dividend</button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function openCalculateDividendModal() {
    document.getElementById('calculateDividendModal').classList.remove('hidden');
}

function closeCalculateDividendModal() {
    document.getElementById('calculateDividendModal').classList.add('hidden');
}

function approveDividend(id) {
    if (confirm('Are you sure you want to approve this dividend? Once approved, it can be distributed to members.')) {
        fetch(`/admin/sacco/dividends/${id}/approve`, {
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

function distributeDividend(id) {
    if (confirm('Are you sure you want to distribute this dividend? This will credit all eligible members accounts.')) {
        fetch(`/admin/sacco/dividends/${id}/distribute`, {
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

function cancelDividend(id) {
    const reason = prompt('Enter reason for cancellation:');
    if (reason) {
        fetch(`/admin/sacco/dividends/${id}/cancel`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
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

function filterByStatus(status) {
    window.location.href = `{{ route('admin.sacco.dividends.index') }}?status=${status}`;
}
</script>
@endpush
@endsection
