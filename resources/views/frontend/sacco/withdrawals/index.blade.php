@extends('frontend.layouts.sacco')

@section('title', 'My Withdrawals - SACCO')

@section('content')
<div class="container mx-auto px-4 py-8" x-data="withdrawalsList()">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Withdrawal History</h1>
                <p class="mt-2 text-gray-600">View and manage your withdrawal requests</p>
            </div>
            <div class="mt-4 md:mt-0">
                <a href="{{ route('sacco.withdrawals.create') }}" 
                   class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    New Withdrawal
                </a>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Status Filter -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select x-model="filters.status" @change="filterWithdrawals()" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <!-- Account Filter -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Account</label>
                <select x-model="filters.account" @change="filterWithdrawals()" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Accounts</option>
                    @foreach($accounts as $account)
                    <option value="{{ $account->id }}">{{ $account->account_type }} - {{ $account->account_number }}</option>
                    @endforeach
                </select>
            </div>

            <!-- Date From -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input type="date" x-model="filters.date_from" @change="filterWithdrawals()" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <!-- Date To -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input type="date" x-model="filters.date_to" @change="filterWithdrawals()" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-4 flex items-center justify-between">
            <button @click="clearFilters()" class="text-sm text-gray-600 hover:text-gray-900">
                Clear Filters
            </button>
            <div class="text-sm text-gray-600">
                Total: <span class="font-semibold" x-text="stats.total"></span> | 
                Approved: <span class="font-semibold text-green-600" x-text="formatCurrency(stats.approved)"></span>
            </div>
        </div>
    </div>

    <!-- Withdrawals List -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading State -->
        <div x-show="loading" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-600">Loading withdrawals...</p>
        </div>

        <!-- Empty State -->
        <div x-show="!loading && withdrawals.length === 0" class="p-12 text-center">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No withdrawals found</h3>
            <p class="mt-2 text-gray-600">You haven't made any withdrawal requests yet</p>
            <a href="{{ route('sacco.withdrawals.create') }}" 
               class="mt-6 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                Make Withdrawal
            </a>
        </div>

        <!-- Desktop Table -->
        <div x-show="!loading && withdrawals.length > 0" class="hidden md:block">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <template x-for="withdrawal in withdrawals" :key="withdrawal.id">
                        <tr class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="formatDate(withdrawal.created_at)"></td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900" x-text="withdrawal.account.account_type"></div>
                                <div class="text-sm text-gray-500" x-text="withdrawal.account.account_number"></div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" x-text="formatCurrency(withdrawal.amount)"></td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="formatMethod(withdrawal.withdrawal_method)"></td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                      :class="getStatusClass(withdrawal.status)" 
                                      x-text="withdrawal.status.toUpperCase()"></span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button @click="viewDetails(withdrawal)" class="text-blue-600 hover:text-blue-900 mr-3">View</button>
                                <button x-show="withdrawal.status === 'pending'" @click="cancelWithdrawal(withdrawal.id)" 
                                        class="text-red-600 hover:text-red-900">Cancel</button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <!-- Mobile Cards -->
        <div x-show="!loading && withdrawals.length > 0" class="md:hidden divide-y divide-gray-200">
            <template x-for="withdrawal in withdrawals" :key="withdrawal.id">
                <div class="p-4">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <p class="text-sm text-gray-500" x-text="formatDate(withdrawal.created_at)"></p>
                            <p class="mt-1 text-lg font-semibold text-gray-900" x-text="formatCurrency(withdrawal.amount)"></p>
                        </div>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full" 
                              :class="getStatusClass(withdrawal.status)" 
                              x-text="withdrawal.status.toUpperCase()"></span>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-500">Account:</span>
                            <span class="text-gray-900" x-text="withdrawal.account.account_type"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Method:</span>
                            <span class="text-gray-900" x-text="formatMethod(withdrawal.withdrawal_method)"></span>
                        </div>
                    </div>
                    <div class="mt-4 flex gap-2">
                        <button @click="viewDetails(withdrawal)" 
                                class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                            View Details
                        </button>
                        <button x-show="withdrawal.status === 'pending'" @click="cancelWithdrawal(withdrawal.id)" 
                                class="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                            Cancel
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <!-- Pagination -->
        <div x-show="!loading && totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="flex items-center justify-between">
                <button @click="previousPage()" :disabled="currentPage === 1" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                </button>
                <span class="text-sm text-gray-700">
                    Page <span x-text="currentPage"></span> of <span x-text="totalPages"></span>
                </span>
                <button @click="nextPage()" :disabled="currentPage === totalPages" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                </button>
            </div>
        </div>
    </div>

    <!-- Details Modal -->
    <div x-show="showModal" x-cloak class="fixed inset-0 z-50 overflow-y-auto" style="display: none;">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showModal = false"></div>
            
            <div class="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-medium text-gray-900">Withdrawal Details</h3>
                    <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div x-show="selectedWithdrawal" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">Amount</p>
                            <p class="mt-1 text-lg font-semibold text-gray-900" x-text="selectedWithdrawal && formatCurrency(selectedWithdrawal.amount)"></p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Status</p>
                            <span class="mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full" 
                                  :class="selectedWithdrawal && getStatusClass(selectedWithdrawal.status)" 
                                  x-text="selectedWithdrawal && selectedWithdrawal.status.toUpperCase()"></span>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Account</p>
                            <p class="mt-1 text-sm text-gray-900" x-text="selectedWithdrawal && selectedWithdrawal.account.account_type"></p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Method</p>
                            <p class="mt-1 text-sm text-gray-900" x-text="selectedWithdrawal && formatMethod(selectedWithdrawal.withdrawal_method)"></p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Date Requested</p>
                            <p class="mt-1 text-sm text-gray-900" x-text="selectedWithdrawal && formatDate(selectedWithdrawal.created_at)"></p>
                        </div>
                        <div x-show="selectedWithdrawal && selectedWithdrawal.processed_at">
                            <p class="text-sm text-gray-500">Date Processed</p>
                            <p class="mt-1 text-sm text-gray-900" x-text="selectedWithdrawal && formatDate(selectedWithdrawal.processed_at)"></p>
                        </div>
                    </div>

                    <div x-show="selectedWithdrawal && selectedWithdrawal.reason">
                        <p class="text-sm text-gray-500">Reason</p>
                        <p class="mt-1 text-sm text-gray-900" x-text="selectedWithdrawal && selectedWithdrawal.reason"></p>
                    </div>

                    <div x-show="selectedWithdrawal && selectedWithdrawal.rejection_reason">
                        <p class="text-sm text-gray-500">Rejection Reason</p>
                        <p class="mt-1 text-sm text-red-600" x-text="selectedWithdrawal && selectedWithdrawal.rejection_reason"></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function withdrawalsList() {
    return {
        withdrawals: @json($withdrawals ?? []),
        accounts: @json($accounts ?? []),
        filters: {
            status: '',
            account: '',
            date_from: '',
            date_to: ''
        },
        stats: {
            total: {{ count($withdrawals ?? []) }},
            approved: {{ $withdrawals->where('status', 'approved')->sum('amount') ?? 0 }}
        },
        loading: false,
        showModal: false,
        selectedWithdrawal: null,
        currentPage: 1,
        totalPages: 1,

        filterWithdrawals() {
            this.loading = true;
            // Implement AJAX filtering
            setTimeout(() => {
                this.loading = false;
            }, 500);
        },

        clearFilters() {
            this.filters = { status: '', account: '', date_from: '', date_to: '' };
            this.filterWithdrawals();
        },

        viewDetails(withdrawal) {
            this.selectedWithdrawal = withdrawal;
            this.showModal = true;
        },

        cancelWithdrawal(id) {
            if (confirm('Are you sure you want to cancel this withdrawal request?')) {
                // Implement AJAX cancellation
                window.location.href = `/sacco/withdrawals/${id}/cancel`;
            }
        },

        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.filterWithdrawals();
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.filterWithdrawals();
            }
        },

        formatCurrency(amount) {
            return new Intl.NumberFormat('en-UG', {
                style: 'currency',
                currency: 'UGX',
                minimumFractionDigits: 0
            }).format(amount || 0);
        },

        formatDate(date) {
            return new Date(date).toLocaleDateString('en-UG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        formatMethod(method) {
            const methods = {
                'mobile_money': 'Mobile Money',
                'bank_transfer': 'Bank Transfer',
                'cash': 'Cash'
            };
            return methods[method] || method;
        },

        getStatusClass(status) {
            const classes = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'approved': 'bg-blue-100 text-blue-800',
                'completed': 'bg-green-100 text-green-800',
                'rejected': 'bg-red-100 text-red-800',
                'cancelled': 'bg-gray-100 text-gray-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
    }
}
</script>
@endpush
@endsection
