@extends('layouts.admin')

@section('title', 'Subscriptions Management')

@section('page-header')
    {{-- Page header content --}}
@endsection

@section('content')

    <!-- Header with Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Active Subscriptions</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($activeSubscriptions) }}</p>
                </div>
                <div class="size-11 rounded-full bg-success/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div class="mt-1">
                <span class="text-xs+ text-success">+8.2%</span>
                <span class="text-xs text-slate-400">from last month</span>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Monthly Revenue</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">${{ number_format($monthlyRevenue, 2) }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Expiring Soon</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($expiringSoon) }}</p>
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
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Churned This Month</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($churnedSubscriptions) }}</p>
                </div>
                <div class="size-11 rounded-full bg-error/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Subscription Plans Stats -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
        @foreach($subscriptionPlansStats as $planStat)
            <div class="card px-4 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-600 dark:text-navy-100">{{ $planStat['name'] }}</p>
                        <p class="text-xl font-semibold text-slate-700 dark:text-navy-100">{{ number_format($planStat['subscribers']) }}</p>
                        <p class="text-xs text-slate-400">${{ number_format($planStat['revenue'], 2) }} revenue</p>
                    </div>
                    <div class="size-10 rounded-full bg-{{ $planStat['color'] }}/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-{{ $planStat['color'] }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- Subscription Growth Chart -->
    <div class="card mb-6">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Subscription Growth</h3>
        </div>
        <div class="p-4">
            <canvas id="subscriptionChart" width="400" height="100"></canvas>
        </div>
    </div>

    <!-- Filters & Search -->
    <div class="card mb-6">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Subscriptions Management</h3>
                <div class="flex space-x-2">
                    <a href="{{ route('admin.payments.subscriptions') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                        Manage Plans
                    </a>
                    <a href="{{ route('admin.payments.subscriptions') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Subscription
                    </a>
                </div>
            </div>
        </div>

        <form method="GET" class="p-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <!-- Search -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Search</label>
                    <input name="search" type="text" placeholder="User name, email..."
                           value="{{ request('search') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Status Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Status</label>
                    <select name="status" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Status</option>
                        <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                        <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                        <option value="expired" {{ request('status') === 'expired' ? 'selected' : '' }}>Expired</option>
                        <option value="trial" {{ request('status') === 'trial' ? 'selected' : '' }}>Trial</option>
                    </select>
                </div>

                <!-- Plan Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Plan</label>
                    <select name="plan" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Plans</option>
                        @foreach($subscriptionPlans as $plan)
                            <option value="{{ $plan->id }}" {{ request('plan') == $plan->id ? 'selected' : '' }}>
                                {{ $plan->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Expiry Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Expiry</label>
                    <select name="expiry" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All</option>
                        <option value="expired" {{ request('expiry') === 'expired' ? 'selected' : '' }}>Already Expired</option>
                        <option value="week" {{ request('expiry') === 'week' ? 'selected' : '' }}>Expiring This Week</option>
                        <option value="month" {{ request('expiry') === 'month' ? 'selected' : '' }}>Expiring This Month</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                <a href="{{ route('admin.payments.subscriptions') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Clear
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Apply Filters
                </button>
                <a href="{{ route('admin.payments.analytics') }}" class="btn bg-success text-white hover:bg-success-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                </a>
            </div>
        </form>
    </div>

    <!-- Subscriptions Table -->
    <div class="card">
        <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
            <table class="is-hoverable w-full text-left">
                <thead>
                    <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            User
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Plan
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Period
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Payment
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Next Payment
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($subscriptions as $subscription)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- User -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-3">
                                    <div class="avatar size-10">
                                        <img class="rounded-full" src="{{ $subscription->user->avatar ? Storage::url($subscription->user->avatar) : asset('images/200x200.png') }}" alt="{{ $subscription->user->name }}" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-navy-100">{{ $subscription->user->name }}</p>
                                        <p class="text-xs text-slate-400">{{ $subscription->user->email }}</p>
                                        @if($subscription->user->country)
                                            <p class="text-xs text-slate-400">{{ $subscription->user->country }}</p>
                                        @endif
                                    </div>
                                </div>
                            </td>

                            <!-- Plan -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $subscription->subscriptionPlan->name }}</p>
                                    <p class="text-xs text-slate-400">
                                        ${{ number_format($subscription->subscriptionPlan->price, 2) }} / {{ $subscription->subscriptionPlan->billing_period }}
                                    </p>
                                    <div class="mt-1">
                                        @foreach($subscription->subscriptionPlan->features as $feature)
                                            <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100 text-xs mr-1">{{ $feature }}</span>
                                        @endforeach
                                    </div>
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex flex-col space-y-1">
                                    <span class="badge rounded-full
                                        {{ $subscription->status === 'active' ? 'bg-success/10 text-success' :
                                           ($subscription->status === 'trial' ? 'bg-info/10 text-info' :
                                           ($subscription->status === 'cancelled' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error')) }}">
                                        {{ ucfirst($subscription->status) }}
                                    </span>
                                    @if($subscription->trial_ends_at && $subscription->trial_ends_at->isFuture())
                                        <span class="badge rounded-full bg-info/10 text-info text-xs">Trial</span>
                                    @endif
                                    @if($subscription->auto_renewal)
                                        <span class="badge rounded-full bg-primary/10 text-primary text-xs">Auto-renew</span>
                                    @endif
                                </div>
                            </td>

                            <!-- Period -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="text-sm">
                                    <p class="text-slate-700 dark:text-navy-100">
                                        {{ $subscription->starts_at->format('M j, Y') }}
                                    </p>
                                    <p class="text-xs text-slate-400">
                                        to {{ $subscription->ends_at->format('M j, Y') }}
                                    </p>
                                    @if($subscription->ends_at->isPast())
                                        <p class="text-xs text-error">Expired</p>
                                    @elseif($subscription->ends_at->isToday())
                                        <p class="text-xs text-warning">Expires today</p>
                                    @elseif($subscription->ends_at->diffInDays() <= 7)
                                        <p class="text-xs text-warning">Expires in {{ $subscription->ends_at->diffInDays() }} days</p>
                                    @endif
                                </div>
                            </td>

                            <!-- Payment -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="text-sm">
                                    <p class="font-medium text-slate-700 dark:text-navy-100">
                                        ${{ number_format($subscription->amount, 2) }}
                                    </p>
                                    <p class="text-xs text-slate-400">{{ strtoupper($subscription->currency) }}</p>
                                    @if($subscription->lastPayment)
                                        <p class="text-xs text-slate-400">
                                            Last: {{ $subscription->lastPayment->created_at->format('M j') }}
                                        </p>
                                    @endif
                                </div>
                            </td>

                            <!-- Next Payment -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                @if($subscription->status === 'active' && $subscription->auto_renewal)
                                    <div class="text-sm">
                                        <p class="text-slate-700 dark:text-navy-100">
                                            {{ $subscription->next_billing_date->format('M j, Y') }}
                                        </p>
                                        <p class="text-xs text-slate-400">
                                            {{ $subscription->next_billing_date->diffForHumans() }}
                                        </p>
                                    </div>
                                @else
                                    <span class="text-xs text-slate-400">No auto-renewal</span>
                                @endif
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-2">
                                    <a href="{{ route('admin.payments.subscriptions') }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>

                                    @if($subscription->status === 'active')
                                        <form method="POST" action="{{ route('admin.payments.subscriptions') }}" class="inline">
                                            @csrf
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                    onclick="return confirm('Are you sure you want to extend this subscription by 1 month?')">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </button>
                                        </form>

                                        <form method="POST" action="{{ route('admin.payments.subscriptions') }}" class="inline">
                                            @csrf
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                    onclick="return confirm('Are you sure you want to cancel this subscription?')">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </form>
                                    @endif

                                    @if($subscription->status === 'cancelled')
                                        <form method="POST" action="{{ route('admin.payments.subscriptions') }}" class="inline">
                                            @csrf
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                    onclick="return confirm('Are you sure you want to reactivate this subscription?')">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                        </form>
                                    @endif

                                    <a href="{{ route('admin.payments.subscriptions') }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                                No subscriptions found matching your criteria.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($subscriptions->hasPages())
            <div class="flex items-center justify-between px-4 py-4">
                <div class="text-sm text-slate-400">
                    Showing {{ $subscriptions->firstItem() }}-{{ $subscriptions->lastItem() }} of {{ $subscriptions->total() }} subscriptions
                </div>
                {{ $subscriptions->links() }}
            </div>
        @endif
    </div>

    <script>
        // Subscription Growth Chart
        const subscriptionCtx = document.getElementById('subscriptionChart').getContext('2d');
        new Chart(subscriptionCtx, {
            type: 'line',
            data: {
                labels: {!! json_encode($subscriptionChartLabels ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']) !!},
                datasets: [{
                    label: 'New Subscriptions',
                    data: {!! json_encode($newSubscriptionsData ?? [10, 15, 12, 18, 20, 25]) !!},
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Cancelled Subscriptions',
                    data: {!! json_encode($cancelledSubscriptionsData ?? [2, 3, 1, 4, 3, 5]) !!},
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
@endsection