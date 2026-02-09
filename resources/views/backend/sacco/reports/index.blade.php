@extends('layouts.admin')

@section('title', 'SACCO Reports')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Reports & Analytics</h1>
            <p class="text-slate-600 dark:text-navy-300 mt-1">Comprehensive SACCO financial and operational reports</p>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="openGenerateReportModal()" class="btn btn-primary">
                <svg class="size-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Custom Report
            </button>
        </div>
    </div>

    <!-- Quick Report Categories -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <a href="{{ route('admin.sacco.reports.financial') }}" class="card p-5 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-2 border-blue-200 dark:border-blue-700">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-blue-500 text-white rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-slate-800 dark:text-navy-50">Financial Report</h3>
                    <p class="text-sm text-slate-600 dark:text-navy-300">Income, expenses, assets</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.sacco.reports.loans') }}" class="card p-5 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-2 border-green-200 dark:border-green-700">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-green-500 text-white rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-slate-800 dark:text-navy-50">Loans Report</h3>
                    <p class="text-sm text-slate-600 dark:text-navy-300">Disbursements, repayments</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.sacco.reports.members') }}" class="card p-5 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-2 border-purple-200 dark:border-purple-700">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-purple-500 text-white rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-slate-800 dark:text-navy-50">Members Report</h3>
                    <p class="text-sm text-slate-600 dark:text-navy-300">Growth, status, activity</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.sacco.reports.transactions') }}" class="card p-5 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-2 border-orange-200 dark:border-orange-700">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-orange-500 text-white rounded-xl">
                    <svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-slate-800 dark:text-navy-50">Transactions</h3>
                    <p class="text-sm text-slate-600 dark:text-navy-300">All financial transactions</p>
                </div>
            </div>
        </a>
    </div>

    <!-- Additional Report Types -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <a href="{{ route('admin.sacco.reports.savings') }}" class="card p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-cyan-100 dark:bg-cyan-900 text-cyan-600 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-semibold text-slate-800 dark:text-navy-50">Savings Report</h3>
                    <p class="text-xs text-slate-500">Account balances & trends</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.sacco.reports.shares') }}" class="card p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-pink-100 dark:bg-pink-900 text-pink-600 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-semibold text-slate-800 dark:text-navy-50">Shares Report</h3>
                    <p class="text-xs text-slate-500">Share capital distribution</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.sacco.reports.dividends') }}" class="card p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-semibold text-slate-800 dark:text-navy-50">Dividends Report</h3>
                    <p class="text-xs text-slate-500">Profit distributions history</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.sacco.reports.performance') }}" class="card p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-teal-100 dark:bg-teal-900 text-teal-600 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-semibold text-slate-800 dark:text-navy-50">Performance Report</h3>
                    <p class="text-xs text-slate-500">KPIs & metrics tracking</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.sacco.reports.audit') }}" class="card p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-red-100 dark:bg-red-900 text-red-600 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-semibold text-slate-800 dark:text-navy-50">Audit Trail</h3>
                    <p class="text-xs text-slate-500">System activity logs</p>
                </div>
            </div>
        </a>

        <a href="{{ route('admin.sacco.reports.compliance') }}" class="card p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 rounded-lg">
                    <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <h3 class="font-semibold text-slate-800 dark:text-navy-50">Compliance Report</h3>
                    <p class="text-xs text-slate-500">Regulatory compliance</p>
                </div>
            </div>
        </a>
    </div>

    <!-- Scheduled Reports -->
    <div class="card mb-6">
        <div class="card-header flex items-center justify-between">
            <h2 class="text-xl font-bold">Scheduled Reports</h2>
            <button onclick="openScheduleReportModal()" class="btn btn-sm btn-primary">
                <svg class="size-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Schedule Report
            </button>
        </div>
        <div class="card-body">
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr class="bg-slate-100 dark:bg-navy-800">
                            <th class="px-4 py-3 text-left">Report Type</th>
                            <th class="px-4 py-3 text-left">Frequency</th>
                            <th class="px-4 py-3 text-left">Recipients</th>
                            <th class="px-4 py-3 text-left">Next Run</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-slate-200 dark:border-navy-700">
                            <td class="px-4 py-3">Monthly Financial Statement</td>
                            <td class="px-4 py-3">Monthly (1st of month)</td>
                            <td class="px-4 py-3">Board Members, Finance Team</td>
                            <td class="px-4 py-3">{{ now()->startOfMonth()->addMonth()->format('M j, Y') }}</td>
                            <td class="px-4 py-3 text-center"><span class="badge badge-success">Active</span></td>
                            <td class="px-4 py-3 text-center">
                                <button class="btn btn-sm btn-secondary" title="Edit">Edit</button>
                            </td>
                        </tr>
                        <tr class="border-b border-slate-200 dark:border-navy-700">
                            <td class="px-4 py-3">Weekly Loan Summary</td>
                            <td class="px-4 py-3">Weekly (Every Monday)</td>
                            <td class="px-4 py-3">Loan Officers</td>
                            <td class="px-4 py-3">{{ now()->next('Monday')->format('M j, Y') }}</td>
                            <td class="px-4 py-3 text-center"><span class="badge badge-success">Active</span></td>
                            <td class="px-4 py-3 text-center">
                                <button class="btn btn-sm btn-secondary" title="Edit">Edit</button>
                            </td>
                        </tr>
                        <tr class="border-b border-slate-200 dark:border-navy-700">
                            <td class="px-4 py-3">Quarterly Performance Review</td>
                            <td class="px-4 py-3">Quarterly</td>
                            <td class="px-4 py-3">Board, Management</td>
                            <td class="px-4 py-3">{{ now()->endOfQuarter()->format('M j, Y') }}</td>
                            <td class="px-4 py-3 text-center"><span class="badge badge-success">Active</span></td>
                            <td class="px-4 py-3 text-center">
                                <button class="btn btn-sm btn-secondary" title="Edit">Edit</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Recent Reports -->
    <div class="card">
        <div class="card-header">
            <h2 class="text-xl font-bold">Recently Generated Reports</h2>
        </div>
        <div class="card-body">
            <div class="space-y-3">
                @for($i = 0; $i < 5; $i++)
                <div class="flex items-center justify-between p-3 border border-slate-200 dark:border-navy-700 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-900">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-lg">
                            <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h4 class="font-semibold">Financial Report - {{ now()->subDays($i)->format('F Y') }}</h4>
                            <p class="text-xs text-slate-500">Generated {{ now()->subDays($i)->diffForHumans() }} by Admin</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="btn btn-sm btn-secondary">
                            <svg class="size-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                        </button>
                        <button class="btn btn-sm btn-info">
                            <svg class="size-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </button>
                    </div>
                </div>
                @endfor
            </div>
        </div>
    </div>
</div>

<!-- Generate Report Modal -->
<div id="generateReportModal" class="modal hidden">
    <div class="modal-overlay"></div>
    <div class="modal-content max-w-2xl">
        <div class="modal-header">
            <h3 class="text-xl font-bold">Generate Custom Report</h3>
            <button onclick="closeGenerateReportModal()" class="btn-close">&times;</button>
        </div>
        <form action="{{ route('admin.sacco.reports.generate') }}" method="POST">
            @csrf
            <div class="modal-body space-y-4">
                <div class="form-group">
                    <label class="form-label">Report Type <span class="text-danger">*</span></label>
                    <select name="report_type" class="form-select" required>
                        <option value="">Select report type...</option>
                        <option value="financial">Financial Report</option>
                        <option value="loans">Loans Report</option>
                        <option value="members">Members Report</option>
                        <option value="transactions">Transactions Report</option>
                        <option value="savings">Savings Report</option>
                        <option value="shares">Shares Report</option>
                        <option value="dividends">Dividends Report</option>
                        <option value="performance">Performance Report</option>
                    </select>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Start Date <span class="text-danger">*</span></label>
                        <input type="date" name="start_date" class="form-input" value="{{ now()->startOfMonth()->format('Y-m-d') }}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">End Date <span class="text-danger">*</span></label>
                        <input type="date" name="end_date" class="form-input" value="{{ now()->format('Y-m-d') }}" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Output Format <span class="text-danger">*</span></label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2">
                            <input type="radio" name="format" value="pdf" class="form-radio" checked>
                            <span>PDF</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" name="format" value="excel" class="form-radio">
                            <span>Excel</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" name="format" value="csv" class="form-radio">
                            <span>CSV</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" name="email_report" class="form-checkbox">
                        <span>Email report to board members</span>
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" onclick="closeGenerateReportModal()" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Generate Report</button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function openGenerateReportModal() {
    document.getElementById('generateReportModal').classList.remove('hidden');
}

function closeGenerateReportModal() {
    document.getElementById('generateReportModal').classList.add('hidden');
}

function openScheduleReportModal() {
    alert('Schedule Report feature coming soon!');
}
</script>
@endpush
@endsection
