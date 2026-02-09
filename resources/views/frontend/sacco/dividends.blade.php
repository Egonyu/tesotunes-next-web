@extends('frontend.layouts.sacco')

@section('title', 'My Dividends - SACCO')

@section('content')
<div class="container mx-auto px-4 py-8" x-data="dividendsList()">
    <!-- Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dividend History</h1>
        <p class="mt-2 text-gray-600">View your dividend earnings from SACCO membership</p>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <!-- Total Dividends -->
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-purple-100">Total Dividends Earned</p>
                    <p class="mt-2 text-3xl font-bold">{{ number_format($stats['total_earned'] ?? 0) }} UGX</p>
                </div>
                <div class="p-3 bg-white bg-opacity-20 rounded-full">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
            </div>
            <p class="mt-4 text-sm text-purple-100">{{ $stats['distribution_count'] ?? 0 }} distributions received</p>
        </div>

        <!-- This Year -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600">This Year ({{ date('Y') }})</p>
                    <p class="mt-2 text-2xl font-bold text-gray-900">{{ number_format($stats['this_year'] ?? 0) }} UGX</p>
                </div>
                <div class="p-3 bg-blue-100 rounded-full">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">{{ $stats['this_year_count'] ?? 0 }} distributions</p>
        </div>

        <!-- Last Distribution -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600">Last Distribution</p>
                    <p class="mt-2 text-2xl font-bold text-gray-900">{{ number_format($stats['last_amount'] ?? 0) }} UGX</p>
                </div>
                <div class="p-3 bg-green-100 rounded-full">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                    </svg>
                </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">{{ $stats['last_date'] ? \Carbon\Carbon::parse($stats['last_date'])->format('M Y') : 'N/A' }}</p>
        </div>

        <!-- Average Dividend -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600">Average Per Distribution</p>
                    <p class="mt-2 text-2xl font-bold text-gray-900">{{ number_format($stats['average'] ?? 0) }} UGX</p>
                </div>
                <div class="p-3 bg-yellow-100 rounded-full">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">Based on all distributions</p>
        </div>
    </div>

    <!-- Info Card -->
    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">About Dividends</h3>
                <div class="mt-2 text-sm text-blue-700">
                    <p>Dividends are calculated based on your share contributions and the SACCO's performance. 
                       Distributions are typically made {{ $settings['dividend_frequency'] ?? 'quarterly' }}. 
                       Your dividend amount depends on the number of shares you hold and the total surplus available for distribution.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Year Filter -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select x-model="filters.year" @change="filterDividends()" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Years</option>
                    @for($year = date('Y'); $year >= (date('Y') - 10); $year--)
                    <option value="{{ $year }}">{{ $year }}</option>
                    @endfor
                </select>
            </div>

            <!-- Status Filter -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select x-model="filters.status" @change="filterDividends()" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="distributed">Distributed</option>
                </select>
            </div>

            <!-- Period Filter -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select x-model="filters.period" @change="filterDividends()" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Periods</option>
                    <option value="Q1">Q1 (Jan-Mar)</option>
                    <option value="Q2">Q2 (Apr-Jun)</option>
                    <option value="Q3">Q3 (Jul-Sep)</option>
                    <option value="Q4">Q4 (Oct-Dec)</option>
                </select>
            </div>
        </div>

        <div class="mt-4 flex items-center justify-between">
            <button @click="clearFilters()" class="text-sm text-gray-600 hover:text-gray-900">Clear Filters</button>
            <button @click="exportDividends()" class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Export Report
            </button>
        </div>
    </div>

    <!-- Dividends List -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Loading -->
        <div x-show="loading" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p class="mt-4 text-gray-600">Loading dividends...</p>
        </div>

        <!-- Empty State -->
        <div x-show="!loading && dividends.length === 0" class="p-12 text-center">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No dividends yet</h3>
            <p class="mt-2 text-gray-600">You haven't received any dividend distributions yet. Dividends are calculated based on SACCO performance and your share contributions.</p>
        </div>

        <!-- Desktop Table -->
        <div x-show="!loading && dividends.length > 0" class="hidden md:block">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calculation Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distribution Date</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shares Held</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate per Share</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <template x-for="dividend in dividends" :key="dividend.id">
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900" x-text="dividend.period_name"></div>
                                <div class="text-sm text-gray-500" x-text="dividend.year"></div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="formatDate(dividend.calculation_date)"></td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="dividend.distribution_date ? formatDate(dividend.distribution_date) : '-'"></td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900" x-text="dividend.shares_held?.toLocaleString()"></td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900" x-text="formatCurrency(dividend.rate_per_share)"></td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <span class="text-sm font-bold text-purple-600" x-text="formatCurrency(dividend.amount)"></span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(dividend.status)" 
                                      x-text="dividend.status.toUpperCase()"></span>
                            </td>
                        </tr>
                    </template>
                </tbody>
                <tfoot class="bg-gray-50">
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-right text-sm font-medium text-gray-900">Total:</td>
                        <td class="px-6 py-4 text-right text-lg font-bold text-purple-600" x-text="formatCurrency(getTotalAmount())"></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Mobile Cards -->
        <div x-show="!loading && dividends.length > 0" class="md:hidden divide-y divide-gray-200">
            <template x-for="dividend in dividends" :key="dividend.id">
                <div class="p-4 bg-gradient-to-r from-purple-50 to-white">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <p class="text-lg font-bold text-purple-600" x-text="dividend.period_name + ' ' + dividend.year"></p>
                            <p class="text-sm text-gray-500" x-text="formatDate(dividend.calculation_date)"></p>
                        </div>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(dividend.status)" 
                              x-text="dividend.status.toUpperCase()"></span>
                    </div>
                    <div class="space-y-2 text-sm mb-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Amount:</span>
                            <span class="font-bold text-purple-600" x-text="formatCurrency(dividend.amount)"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Shares Held:</span>
                            <span class="text-gray-900" x-text="dividend.shares_held?.toLocaleString()"></span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Rate per Share:</span>
                            <span class="text-gray-900" x-text="formatCurrency(dividend.rate_per_share)"></span>
                        </div>
                        <div x-show="dividend.distribution_date" class="flex justify-between">
                            <span class="text-gray-600">Distributed:</span>
                            <span class="text-gray-900" x-text="formatDate(dividend.distribution_date)"></span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Mobile Total -->
            <div class="p-4 bg-gray-50 font-bold">
                <div class="flex justify-between items-center">
                    <span class="text-gray-900">Total Earned:</span>
                    <span class="text-xl text-purple-600" x-text="formatCurrency(getTotalAmount())"></span>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function dividendsList() {
    return {
        dividends: @json($dividends ?? []),
        filters: { year: '', status: '', period: '' },
        loading: false,

        filterDividends() {
            this.loading = true;
            setTimeout(() => this.loading = false, 500);
        },

        clearFilters() {
            this.filters = { year: '', status: '', period: '' };
            this.filterDividends();
        },

        exportDividends() {
            const params = new URLSearchParams(this.filters);
            window.location.href = `/sacco/dividends/export?${params}`;
        },

        getTotalAmount() {
            return this.dividends.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        },

        formatCurrency(amount) {
            return new Intl.NumberFormat('en-UG', { 
                style: 'currency', 
                currency: 'UGX', 
                minimumFractionDigits: 0 
            }).format(amount || 0);
        },

        formatDate(date) {
            if (!date) return '-';
            return new Date(date).toLocaleDateString('en-UG', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        },

        getStatusClass(status) {
            const classes = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'approved': 'bg-blue-100 text-blue-800',
                'distributed': 'bg-green-100 text-green-800',
                'cancelled': 'bg-red-100 text-red-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
    }
}
</script>
@endpush
@endsection
