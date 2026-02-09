@extends('layouts.admin')

@section('title', 'Ticket Management - ' . $event->title)

@section('page-header')
    <div class="flex items-center justify-between py-6">
        <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-navy-50">Ticket Management</h1>
            <p class="text-slate-500 dark:text-navy-300">Manage tickets for {{ $event->title }}</p>
        </div>
        <div class="flex items-center space-x-2">
            <a href="{{ route('admin.events.tickets.create', $event) }}" class="btn bg-primary text-white hover:bg-primary/90">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Ticket Type
            </a>
            <a href="{{ route('admin.events.show', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Event
            </a>
        </div>
    </div>
@endsection

@section('content')
    <!-- Sales Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Ticket Types</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $salesStats['total_ticket_types'] ?? 0 }}</p>
                </div>
                <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Sold</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $salesStats['total_tickets_sold'] ?? 0 }}</p>
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
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Remaining</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">{{ $salesStats['tickets_remaining'] ?? 0 }}</p>
                </div>
                <div class="size-11 rounded-full bg-warning/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="card px-4 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">Total Revenue</p>
                    <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">UGX {{ number_format($salesStats['total_revenue'] ?? 0) }}</p>
                </div>
                <div class="size-11 rounded-full bg-info/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Tickets Table -->
    <div class="card">
        <div class="flex items-center justify-between p-4 sm:p-5">
            <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Ticket Types</h3>

            <!-- Actions -->
            <div class="flex items-center space-x-2">
                <a href="{{ route('admin.events.tickets.analytics', $event) }}" class="btn bg-info text-white hover:bg-info/90">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analytics
                </a>
                <a href="{{ route('admin.events.tickets.export', $event) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-navy-500 dark:text-navy-100 dark:hover:bg-navy-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                </a>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-y border-slate-200 dark:border-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Ticket Type
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Price
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Availability
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Sales Progress
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
                    @forelse($tickets as $ticket)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- Ticket Type -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="font-medium text-slate-700 dark:text-navy-100">{{ $ticket->ticket_type }}</p>
                                    @if($ticket->description)
                                        <p class="text-xs text-slate-400 dark:text-navy-300">{{ Str::limit($ticket->description, 50) }}</p>
                                    @endif
                                </div>
                            </td>

                            <!-- Price -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <p class="font-medium text-slate-700 dark:text-navy-100">
                                    @if($ticket->price == 0)
                                        <span class="text-success">Free</span>
                                    @else
                                        UGX {{ number_format($ticket->price) }}
                                    @endif
                                </p>
                            </td>

                            <!-- Availability -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="text-sm text-slate-700 dark:text-navy-100">
                                        {{ $ticket->quantity_sold }} / {{ $ticket->quantity_available ?: '∞' }} sold
                                    </p>
                                    @if($ticket->quantity_available)
                                        <p class="text-xs text-slate-400 dark:text-navy-300">
                                            {{ $ticket->quantity_remaining }} remaining
                                        </p>
                                    @endif
                                </div>
                            </td>

                            <!-- Sales Progress -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="w-full">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs text-slate-600 dark:text-navy-300">{{ round($ticket->sales_progress) }}%</span>
                                    </div>
                                    <div class="h-2 bg-slate-200 rounded-full dark:bg-navy-500">
                                        <div class="h-2 bg-primary rounded-full" style="width: {{ $ticket->sales_progress }}%"></div>
                                    </div>
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex flex-col space-y-1">
                                    <span class="badge rounded-full {{ $ticket->is_active ? 'bg-success/10 text-success' : 'bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100' }}">
                                        {{ $ticket->is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                    @if($ticket->is_sold_out)
                                        <span class="badge bg-error/10 text-error rounded-full">Sold Out</span>
                                    @elseif(!$ticket->is_on_sale && $ticket->is_active)
                                        <span class="badge bg-warning/10 text-warning rounded-full">Not On Sale</span>
                                    @endif
                                </div>
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-2">
                                    <a href="{{ route('admin.events.tickets.show', [$event, $ticket]) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20" title="View Details">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>
                                    <a href="{{ route('admin.events.tickets.edit', [$event, $ticket]) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20" title="Edit">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>
                                    <a href="{{ route('admin.events.tickets.duplicate', [$event, $ticket]) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20" title="Duplicate">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </a>

                                    @if($ticket->is_active)
                                        <form action="{{ route('admin.events.tickets.deactivate', [$event, $ticket]) }}" method="POST" class="inline">
                                            @csrf
                                            @method('PATCH')
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-warning/20 text-warning" title="Deactivate">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9V6a4 4 0 118 0v3M5 12h14l-1 7H6l-1-7z" />
                                                </svg>
                                            </button>
                                        </form>
                                    @else
                                        <form action="{{ route('admin.events.tickets.activate', [$event, $ticket]) }}" method="POST" class="inline">
                                            @csrf
                                            @method('PATCH')
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-success/20 text-success" title="Activate">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </form>
                                    @endif

                                    @if($ticket->quantity_sold == 0)
                                        <button class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error" title="Delete"
                                                onclick="if(confirm('Are you sure you want to delete this ticket type?')) {
                                                    document.getElementById('delete-form-{{ $ticket->id }}').submit();
                                                }">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <form id="delete-form-{{ $ticket->id }}" action="{{ route('admin.events.tickets.destroy', [$event, $ticket]) }}" method="POST" class="hidden">
                                            @csrf
                                            @method('DELETE')
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
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <div>
                                        <p class="text-lg font-medium text-slate-700 dark:text-navy-100">No ticket types found</p>
                                        <p class="text-slate-400 dark:text-navy-300">Create your first ticket type to start selling tickets</p>
                                    </div>
                                    <a href="{{ route('admin.events.tickets.create', $event) }}" class="btn bg-primary text-white">
                                        Create Ticket Type
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
@endsection