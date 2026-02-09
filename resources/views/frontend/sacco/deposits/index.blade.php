@extends('frontend.layouts.sacco')

@section('title', 'Deposit History')

@section('content')
<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-3xl font-bold text-white">Deposit History</h2>
            <p class="text-gray-400">Track all your deposits and contributions</p>
        </div>
        <a href="{{ route('sacco.deposits.create') }}" class="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            <span class="material-icons-round">add_circle</span>
            Make New Deposit
        </a>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p class="text-gray-400 text-sm mb-1">Total Deposits</p>
            <h4 class="text-2xl font-bold text-white">UGX {{ number_format($stats['total_deposits']) }}</h4>
            <p class="text-green-500 text-xs mt-1">{{ $stats['deposit_count'] }} transactions</p>
        </div>
        
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p class="text-gray-400 text-sm mb-1">This Month</p>
            <h4 class="text-2xl font-bold text-white">UGX {{ number_format($stats['month_deposits']) }}</h4>
            <p class="text-gray-500 text-xs mt-1">{{ $stats['month_count'] }} deposits</p>
        </div>
        
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p class="text-gray-400 text-sm mb-1">Pending</p>
            <h4 class="text-2xl font-bold text-yellow-500">{{ $stats['pending_count'] }}</h4>
            <p class="text-gray-500 text-xs mt-1">Awaiting approval</p>
        </div>
        
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <p class="text-gray-400 text-sm mb-1">Average Deposit</p>
            <h4 class="text-2xl font-bold text-white">UGX {{ number_format($stats['average_deposit']) }}</h4>
            <p class="text-gray-500 text-xs mt-1">Per transaction</p>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <form method="GET" action="{{ route('sacco.deposits.index') }}" class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search by reference..." class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
            </div>
            <select name="status" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500">
                <option value="">All Status</option>
                <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="approved" {{ request('status') === 'approved' ? 'selected' : '' }}>Approved</option>
                <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>Rejected</option>
            </select>
            <select name="payment_method" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500">
                <option value="">All Methods</option>
                <option value="mobile_money" {{ request('payment_method') === 'mobile_money' ? 'selected' : '' }}>Mobile Money</option>
                <option value="bank_transfer" {{ request('payment_method') === 'bank_transfer' ? 'selected' : '' }}>Bank Transfer</option>
                <option value="cash" {{ request('payment_method') === 'cash' ? 'selected' : '' }}>Cash</option>
            </select>
            <input type="date" name="from_date" value="{{ request('from_date') }}" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500">
            <input type="date" name="to_date" value="{{ request('to_date') }}" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500">
            <button type="submit" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">search</span>
                Filter
            </button>
            @if(request()->hasAny(['search', 'status', 'payment_method', 'from_date', 'to_date']))
            <a href="{{ route('sacco.deposits.index') }}" class="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <span class="material-icons-round text-sm">clear</span>
            </a>
            @endif
        </form>
    </div>

    <!-- Deposits Table -->
    <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div class="p-6 border-b border-gray-700">
            <h5 class="text-xl font-semibold text-white">All Deposits</h5>
        </div>

        @if($deposits->isNotEmpty())
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-100 dark:bg-gray-900">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Account</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment Method</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                    @foreach($deposits as $deposit)
                    <tr class="hover:bg-gray-900">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {{ $deposit->created_at->format('M d, Y') }}<br>
                            <span class="text-xs text-gray-500">{{ $deposit->created_at->format('h:i A') }}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                            <div>
                                <p class="font-medium">{{ $deposit->account->type_name }}</p>
                                <p class="text-xs text-gray-500">{{ $deposit->account->account_number }}</p>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-lg font-bold text-green-500">UGX {{ number_format($deposit->amount) }}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center gap-2">
                                <span class="material-icons-round text-{{ $deposit->payment_method === 'mobile_money' ? 'green' : ($deposit->payment_method === 'bank_transfer' ? 'blue' : 'yellow') }}-500 text-sm">
                                    {{ $deposit->payment_method === 'mobile_money' ? 'phone_android' : ($deposit->payment_method === 'bank_transfer' ? 'account_balance' : 'payments') }}
                                </span>
                                <span class="text-sm text-white">{{ ucfirst(str_replace('_', ' ', $deposit->payment_method)) }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm">
                                <p class="text-white font-medium">{{ $deposit->reference }}</p>
                                @if($deposit->payment_reference)
                                <p class="text-xs text-gray-500">{{ $deposit->payment_reference }}</p>
                                @endif
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                {{ $deposit->status === 'approved' ? 'bg-green-600 text-white' : '' }}
                                {{ $deposit->status === 'pending' ? 'bg-yellow-600 text-white' : '' }}
                                {{ $deposit->status === 'rejected' ? 'bg-red-600 text-white' : '' }}">
                                {{ ucfirst($deposit->status) }}
                            </span>
                            @if($deposit->approved_at)
                            <p class="text-xs text-gray-500 mt-1">{{ $deposit->approved_at->format('M d') }}</p>
                            @endif
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            <button onclick="showDepositDetails({{ $deposit->id }})" class="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                                <span class="material-icons-round text-sm">visibility</span>
                                View
                            </button>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 border-t border-gray-700">
            {{ $deposits->links() }}
        </div>
        @else
        <div class="p-12 text-center">
            <span class="material-icons-round text-6xl text-gray-700 mb-3">account_balance_wallet</span>
            <p class="text-gray-500 mb-4">No deposits found</p>
            @if(!request()->hasAny(['search', 'status', 'payment_method', 'from_date', 'to_date']))
            <a href="{{ route('sacco.deposits.create') }}" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                <span class="material-icons-round">add_circle</span>
                Make Your First Deposit
            </a>
            @else
            <p class="text-gray-600 text-sm">Try adjusting your filters</p>
            @endif
        </div>
        @endif
    </div>
</div>

<!-- Deposit Details Modal -->
<div id="depositModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-700 flex items-center justify-between">
            <h5 class="text-xl font-semibold text-white">Deposit Details</h5>
            <button onclick="closeDepositModal()" class="text-gray-400 hover:text-white">
                <span class="material-icons-round">close</span>
            </button>
        </div>
        <div id="modalContent" class="p-6">
            <!-- Content loaded via JavaScript -->
        </div>
    </div>
</div>

@push('scripts')
<script>
    function showDepositDetails(depositId) {
        const modal = document.getElementById('depositModal');
        const modalContent = document.getElementById('modalContent');
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Load content
        modalContent.innerHTML = '<div class="text-center py-8"><svg class="animate-spin h-8 w-8 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>';
        
        // Fetch deposit details (you'll need to create this endpoint)
        fetch(`/sacco/deposits/${depositId}`)
            .then(response => response.json())
            .then(data => {
                modalContent.innerHTML = `
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-gray-400 text-sm mb-1">Deposit Amount</p>
                                <p class="text-2xl font-bold text-green-500">UGX ${data.formatted_amount}</p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-sm mb-1">Status</p>
                                <span class="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-${data.status_color}-600 text-white">
                                    ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        
                        <div class="border-t border-gray-700 pt-4 space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Account:</span>
                                <span class="text-white font-medium">${data.account.type_name} - ${data.account.account_number}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Payment Method:</span>
                                <span class="text-white">${data.payment_method_display}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Reference:</span>
                                <span class="text-white font-mono">${data.reference}</span>
                            </div>
                            ${data.payment_reference ? `
                            <div class="flex justify-between">
                                <span class="text-gray-400">Payment Ref:</span>
                                <span class="text-white">${data.payment_reference}</span>
                            </div>
                            ` : ''}
                            <div class="flex justify-between">
                                <span class="text-gray-400">Date:</span>
                                <span class="text-white">${data.created_at_display}</span>
                            </div>
                            ${data.approved_at ? `
                            <div class="flex justify-between">
                                <span class="text-gray-400">Approved:</span>
                                <span class="text-green-500">${data.approved_at_display}</span>
                            </div>
                            ` : ''}
                            ${data.notes ? `
                            <div>
                                <span class="text-gray-400 block mb-1">Notes:</span>
                                <p class="text-white text-sm">${data.notes}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            })
            .catch(error => {
                modalContent.innerHTML = '<div class="text-center py-8 text-red-500">Error loading details</div>';
            });
    }
    
    function closeDepositModal() {
        document.getElementById('depositModal').classList.add('hidden');
    }
    
    // Close modal on outside click
    document.getElementById('depositModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDepositModal();
        }
    });
</script>
@endpush
@endsection
