@extends('layouts.admin')

@section('title', 'User Management')

@section('content')
    <!-- Filters & Search -->
    <div class="card mb-6">
        <div class="border-b border-slate-200 p-4 dark:border-navy-500">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">Users</h3>
                <a href="{{ route('admin.users.create') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                </a>
            </div>
        </div>

        <form method="GET" class="p-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <!-- Search -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Search</label>
                    <input name="search" type="text" placeholder="Name, email, phone..."
                           value="{{ request('search') }}"
                           class="form-input mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 placeholder:text-slate-400/70 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:hover:border-navy-400 dark:focus:border-accent">
                </div>

                <!-- Role Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Role</label>
                    <select name="role" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Roles</option>
                        @foreach($roles as $role)
                            <option value="{{ $role }}" {{ request('role') === $role ? 'selected' : '' }}>
                                {{ ucfirst($role) }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Country Filter -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Country</label>
                    <select name="country" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Countries</option>
                        @foreach($countries as $country)
                            <option value="{{ $country }}" {{ request('country') === $country ? 'selected' : '' }}>
                                {{ $country }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <!-- Subscription Status -->
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-navy-100">Subscription</label>
                    <select name="subscription_status" class="form-select mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:hover:border-navy-400 dark:focus:border-accent">
                        <option value="">All Users</option>
                        <option value="active" {{ request('subscription_status') === 'active' ? 'selected' : '' }}>Active Subscribers</option>
                        <option value="inactive" {{ request('subscription_status') === 'inactive' ? 'selected' : '' }}>Free Users</option>
                    </select>
                </div>
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                <a href="{{ route('admin.users.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150 dark:border-navy-450 dark:text-navy-100 dark:hover:bg-navy-500">
                    Clear
                </a>
                <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                    Apply Filters
                </button>
            </div>
        </form>
    </div>

    <!-- Users Table -->
    <div class="card">
        <div class="is-scrollbar-hidden min-w-full overflow-x-auto">
            <table class="is-hoverable w-full text-left">
                <thead>
                    <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            User
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Contact
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Status
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Subscription
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Joined
                        </th>
                        <th class="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 dark:text-navy-100 lg:px-5">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($users as $user)
                        <tr class="border-y border-transparent border-b-slate-200 dark:border-b-navy-500">
                            <!-- User Info -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-3">
                                    <div class="avatar size-10">
                                        @if($user->avatar)
                                            <img class="rounded-full object-cover" src="{{ asset('storage/' . $user->avatar) }}" alt="{{ $user->name }}" onerror="this.src='{{ asset('images/200x200.png') }}'"/>
                                        @else
                                            <img class="rounded-full" src="{{ asset('images/200x200.png') }}" alt="{{ $user->name }}" />
                                        @endif
                                    </div>
                                    <div>
                                        <p class="font-medium text-slate-700 dark:text-navy-100">{{ $user->name }}</p>
                                        <p class="text-xs text-slate-400">
                                            <span class="badge rounded-full {{ $user->role === 'admin' ? 'bg-error/10 text-error' : ($user->role === 'artist' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info') }}">
                                                {{ ucfirst($user->role) }}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <!-- Contact -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div>
                                    <p class="text-sm text-slate-700 dark:text-navy-100">{{ $user->email }}</p>
                                    @if($user->phone)
                                        <p class="text-xs text-slate-400">{{ $user->phone }}</p>
                                    @endif
                                    @if($user->country)
                                        <p class="text-xs text-slate-400">{{ $user->country }}</p>
                                    @endif
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex flex-col space-y-1">
                                    <span class="badge rounded-full {{ $user->is_active ? 'bg-success/10 text-success' : 'bg-error/10 text-error' }}">
                                        {{ $user->is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                    @if($user->email_verified_at)
                                        <span class="badge rounded-full bg-info/10 text-info text-xs">Verified</span>
                                    @else
                                        <span class="badge rounded-full bg-warning/10 text-warning text-xs">Unverified</span>
                                    @endif
                                </div>
                            </td>

                            <!-- Subscription -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                @if($user->subscription && $user->subscription->status === 'active')
                                    <div>
                                        <span class="badge bg-primary/10 text-primary">{{ $user->subscription->subscriptionPlan->name }}</span>
                                        <p class="text-xs text-slate-400 mt-1">
                                            @if($user->subscription->expires_at)
                                                Expires {{ $user->subscription->expires_at->format('M j, Y') }}
                                            @endif
                                        </p>
                                    </div>
                                @else
                                    <span class="badge bg-slate-150 text-slate-800 dark:bg-navy-500 dark:text-navy-100">Free</span>
                                @endif
                            </td>

                            <!-- Joined Date -->
                            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-navy-100 lg:px-5">
                                {{ $user->created_at->format('M j, Y') }}
                            </td>

                            <!-- Actions -->
                            <td class="whitespace-nowrap px-4 py-3 lg:px-5">
                                <div class="flex items-center space-x-2">
                                    <a href="{{ route('admin.users.show', $user) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>

                                    <a href="{{ route('admin.users.edit', $user) }}" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>

                                    @if($user->id !== auth()->id())
                                        <form method="POST" action="{{ route('admin.users.activate', $user) }}" class="inline">
                                            @csrf
                                            <button type="submit" class="btn size-8 rounded-full p-0 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25"
                                                    onclick="return confirm('Are you sure you want to {{ $user->is_active ? 'deactivate' : 'activate' }} this user?')">
                                                @if($user->is_active)
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                                    </svg>
                                                @else
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                @endif
                                            </button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-4 py-8 text-center text-slate-400">
                                No users found matching your criteria.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($users->hasPages())
            <div class="flex items-center justify-between px-4 py-4">
                <div class="text-sm text-slate-400">
                    Showing {{ $users->firstItem() }}-{{ $users->lastItem() }} of {{ $users->total() }} users
                </div>
                {{ $users->links() }}
            </div>
        @endif
    </div>
@endsection