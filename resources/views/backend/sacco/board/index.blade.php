@extends('layouts.admin')

@section('title', 'SACCO Board Members')

@section('content')
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-2xl font-semibold text-slate-700 dark:text-navy-100">Board Management</h2>
            <p class="text-sm text-slate-400 dark:text-navy-300">Manage SACCO board members and their roles</p>
        </div>
        <div class="flex space-x-2">
            <button type="button" 
                    onclick="openAddBoardMemberModal()"
                    class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
                <svg class="size-4.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Board Member
            </button>
            <a href="{{ route('admin.sacco.dashboard') }}" 
               class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 focus:bg-slate-150 active:bg-slate-150/80 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500 dark:focus:bg-navy-500 dark:active:bg-navy-500/90">
                <svg class="size-4.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back
            </a>
        </div>
    </div>

    <!-- Board Structure Overview -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="card px-4 py-5 sm:px-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">
                        Chairperson
                    </p>
                    <div class="mt-1">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                            {{ $board->where('position', 'chairperson')->count() }}
                        </p>
                    </div>
                </div>
                <div class="mask is-squircle flex size-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                </div>
            </div>
        </div>
        <div class="card px-4 py-5 sm:px-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">
                        Secretary
                    </p>
                    <div class="mt-1">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                            {{ $board->where('position', 'secretary')->count() }}
                        </p>
                    </div>
                </div>
                <div class="mask is-squircle flex size-12 shrink-0 items-center justify-center bg-success/10 text-success">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
            </div>
        </div>
        <div class="card px-4 py-5 sm:px-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">
                        Treasurer
                    </p>
                    <div class="mt-1">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                            {{ $board->where('position', 'treasurer')->count() }}
                        </p>
                    </div>
                </div>
                <div class="mask is-squircle flex size-12 shrink-0 items-center justify-center bg-warning/10 text-warning">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                </div>
            </div>
        </div>
        <div class="card px-4 py-5 sm:px-5">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs+ font-medium uppercase tracking-wide text-slate-400 dark:text-navy-300">
                        Other Members
                    </p>
                    <div class="mt-1">
                        <p class="text-2xl font-semibold text-slate-700 dark:text-navy-100">
                            {{ $board->whereIn('position', ['member', 'vice_chairperson'])->count() }}
                        </p>
                    </div>
                </div>
                <div class="mask is-squircle flex size-12 shrink-0 items-center justify-center bg-info/10 text-info">
                    <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Board Members List -->
    <div class="card">
        <div class="flex items-center justify-between p-4 sm:px-5">
            <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">
                <svg class="inline-block size-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Current Board Members ({{ $board->count() }})
            </h3>
        </div>
        <div class="p-4 sm:px-5">
            @if($board->isEmpty())
            <div class="flex flex-col items-center justify-center py-12 text-center">
                <svg class="size-20 text-slate-300 dark:text-navy-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h5 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-2">No Board Members</h5>
                <p class="text-slate-400 dark:text-navy-300 mb-4">Add board members to manage SACCO governance</p>
                <button type="button" 
                        onclick="openAddBoardMemberModal()"
                        class="btn bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
                    <svg class="size-4.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add First Board Member
                </button>
            </div>
            @else
            <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
                <table class="is-hoverable w-full text-left">
                    <thead>
                        <tr>
                            <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                                Member
                            </th>
                            <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                                Position
                            </th>
                            <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                                Term Start
                            </th>
                            <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                                Term End
                            </th>
                            <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                                Status
                            </th>
                            <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                                Appointed By
                            </th>
                            <th class="whitespace-nowrap bg-slate-200 px-4 py-3 font-semibold uppercase text-slate-800 dark:bg-navy-800 dark:text-navy-100 lg:px-5">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($board as $boardMember)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                                <div class="flex items-center space-x-3">
                                    <div class="avatar size-10">
                                        <img src="{{ $boardMember->member->user->avatar_url ?? asset('images/200x200.png') }}" 
                                             alt="{{ $boardMember->member->user->display_name ?? $boardMember->member->user->username }}" 
                                             class="rounded-full" />
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-navy-100">{{ $boardMember->member->user->display_name ?? $boardMember->member->user->username }}</p>
                                        <p class="text-xs text-slate-400 dark:text-navy-300">{{ $boardMember->member->membership_number }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                                <span class="badge {{ 
                                    $boardMember->position === 'chairperson' ? 'bg-primary/10 text-primary' : 
                                    ($boardMember->position === 'secretary' ? 'bg-success/10 text-success' : 
                                    ($boardMember->position === 'treasurer' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'))
                                }} capitalize">
                                    {{ str_replace('_', ' ', $boardMember->position) }}
                                </span>
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-200 sm:px-5">
                                {{ $boardMember->term_start->format('M d, Y') }}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm sm:px-5">
                                @if($boardMember->term_end)
                                    <span class="{{ $boardMember->term_end->isPast() ? 'text-error' : 'text-success' }}">
                                        {{ $boardMember->term_end->format('M d, Y') }}
                                    </span>
                                @else
                                    <span class="text-slate-400">-</span>
                                @endif
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                                @if($boardMember->is_active)
                                    <span class="badge bg-success/10 text-success">Active</span>
                                @else
                                    <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">Inactive</span>
                                @endif
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-200 sm:px-5">
                                @if($boardMember->appointedBy)
                                    {{ $boardMember->appointedBy->display_name ?? $boardMember->appointedBy->username ?? 'System' }}
                                @else
                                    <span class="text-slate-400">-</span>
                                @endif
                            </td>
                            <td class="whitespace-nowrap px-4 py-3 sm:px-5">
                                <div class="flex space-x-2">
                                    <button type="button" 
                                        onclick="viewBoardMember({{ $boardMember->id }})" 
                                        class="btn size-8 p-0 text-info hover:bg-info/20 focus:bg-info/20 active:bg-info/25"
                                        title="View Details">
                                        <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    <button type="button" 
                                        onclick="editBoardMember({{ $boardMember->id }})" 
                                        class="btn size-8 p-0 text-primary hover:bg-primary/20 focus:bg-primary/20 active:bg-primary/25"
                                        title="Edit">
                                        <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <form action="{{ route('admin.sacco.board.remove', $boardMember->id) }}" 
                                          method="POST" 
                                          class="inline"
                                          onsubmit="return confirm('Are you sure you want to remove this board member?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" 
                                            class="btn size-8 p-0 text-error hover:bg-error/20 focus:bg-error/20 active:bg-error/25"
                                            title="Remove">
                                            <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @endif
        </div>
    </div>

<!-- Add Board Member Modal -->
<div x-data="{ showModal: false }" 
     @open-add-board-member.window="showModal = true"
     x-show="showModal"
     x-cloak
     class="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
     role="dialog">
    <div class="absolute inset-0 bg-slate-900/60 transition-opacity duration-300"
         @click="showModal = false"
         x-show="showModal"
         x-transition:enter="ease-out"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="ease-in"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"></div>
    <div class="relative max-w-2xl w-full origin-top rounded-lg bg-white transition-all duration-300 dark:bg-navy-700"
         x-show="showModal"
         x-transition:enter="easy-out"
         x-transition:enter-start="opacity-0 scale-95"
         x-transition:enter-end="opacity-100 scale-100"
         x-transition:leave="easy-in"
         x-transition:leave-start="opacity-100 scale-100"
         x-transition:leave-end="opacity-0 scale-95">
        
        <div class="flex justify-between items-center rounded-t-lg bg-slate-200 px-4 py-3 dark:bg-navy-800 sm:px-5">
            <h3 class="text-base font-medium text-slate-700 dark:text-navy-100">
                <svg class="inline-block size-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Add Board Member
            </h3>
            <button @click="showModal = false"
                    class="btn -mr-1.5 size-7 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:hover:bg-navy-300/20 dark:focus:bg-navy-300/20 dark:active:bg-navy-300/25">
                <svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <form action="{{ route('admin.sacco.board.add') }}" method="POST">
            @csrf
            <div class="px-4 py-4 sm:px-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                
                <!-- Member Selection -->
                <label class="block">
                    <span class="text-sm font-medium text-slate-600 dark:text-navy-100">
                        Select Member <span class="text-error">*</span>
                    </span>
                    <select class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent" 
                            name="member_id" required>
                        <option value="">Choose a SACCO member...</option>
                        @foreach(\App\Modules\Sacco\Models\SaccoMember::where('status', 'active')->with('user')->get() as $member)
                        <option value="{{ $member->id }}">
                            {{ $member->user->display_name ?? $member->user->username }} ({{ $member->membership_number }})
                        </option>
                        @endforeach
                    </select>
                </label>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <!-- Position -->
                    <label class="block">
                        <span class="text-sm font-medium text-slate-600 dark:text-navy-100">
                            Position <span class="text-error">*</span>
                        </span>
                        <select class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent" 
                                name="position" required>
                            <option value="">Select position...</option>
                            <option value="chairperson">Chairperson</option>
                            <option value="vice_chairperson">Vice Chairperson</option>
                            <option value="secretary">Secretary</option>
                            <option value="treasurer">Treasurer</option>
                            <option value="member">Board Member</option>
                        </select>
                    </label>

                    <!-- Status -->
                    <label class="block">
                        <span class="text-sm font-medium text-slate-600 dark:text-navy-100">Status</span>
                        <select class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent" 
                                name="is_active">
                            <option value="1" selected>Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </label>

                    <!-- Term Start Date -->
                    <label class="block">
                        <span class="text-sm font-medium text-slate-600 dark:text-navy-100">
                            Term Start Date <span class="text-error">*</span>
                        </span>
                        <input type="date" 
                               class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent" 
                               name="term_start" 
                               value="{{ date('Y-m-d') }}" 
                               required>
                    </label>

                    <!-- Term End Date -->
                    <label class="block">
                        <span class="text-sm font-medium text-slate-600 dark:text-navy-100">Term End Date</span>
                        <input type="date" 
                               class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent" 
                               name="term_end">
                        <span class="text-xs text-slate-400 dark:text-navy-300">Leave blank for indefinite term</span>
                    </label>
                </div>

                <!-- Responsibilities -->
                <label class="block">
                    <span class="text-sm font-medium text-slate-600 dark:text-navy-100">Responsibilities</span>
                    <textarea rows="3"
                              placeholder="Describe the responsibilities for this position..."
                              class="form-textarea mt-1.5 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:placeholder:text-navy-300 dark:hover:border-navy-400 dark:focus:border-accent"
                              name="responsibilities"></textarea>
                </label>

                <!-- Notes -->
                <label class="block">
                    <span class="text-sm font-medium text-slate-600 dark:text-navy-100">Notes</span>
                    <textarea rows="2"
                              placeholder="Additional notes..."
                              class="form-textarea mt-1.5 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:placeholder:text-navy-300 dark:hover:border-navy-400 dark:focus:border-accent"
                              name="notes"></textarea>
                </label>
            </div>

            <div class="flex justify-end space-x-2 px-4 py-3 sm:px-5">
                <button @click="showModal = false"
                        type="button"
                        class="btn min-w-[7rem] border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 focus:bg-slate-150 active:bg-slate-150/80 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500 dark:focus:bg-navy-500 dark:active:bg-navy-500/90">
                    Cancel
                </button>
                <button type="submit"
                        class="btn min-w-[7rem] bg-primary font-medium text-white hover:bg-primary-focus focus:bg-primary-focus active:bg-primary-focus/90">
                    <svg class="size-4.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                    Add Board Member
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
function openAddBoardMemberModal() {
    window.dispatchEvent(new CustomEvent('open-add-board-member'));
}

function viewBoardMember(id) {
    // Implement view board member details
    alert('View board member: ' + id);
}

function editBoardMember(id) {
    // Implement edit board member
    alert('Edit board member: ' + id);
}
</script>
@endpush
@endsection
