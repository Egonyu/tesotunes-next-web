@extends('layouts.admin')

@section('title', 'Roles Management')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Roles Management</h1>
                <p class="text-slate-600 dark:text-navy-300">Manage user roles and permissions</p>
            </div>
            <div>
                <a href="{{ route('admin.roles.create') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Role
                </a>
            </div>
        </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Roles</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['total_roles'] ?? 0 }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Active Roles</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['active_roles'] ?? 0 }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-success/10 text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Total Users</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['total_users'] ?? 0 }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-info/10 text-info">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div class="admin-card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-navy-300">Role Assignments</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-navy-50">{{ $stats['role_assignments'] ?? 0 }}</p>
                </div>
                <div class="flex size-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div class="admin-card mb-6">
        <form method="GET" class="flex gap-4 items-end">
            <div class="flex-1">
                <label for="search" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                    Search Roles
                </label>
                <input type="text" id="search" name="search" value="{{ request('search') }}"
                       placeholder="Search by name or description..."
                       class="form-input w-full">
            </div>

            <div class="w-48">
                <label for="status" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                    Status
                </label>
                <select id="status" name="status" class="form-select">
                    <option value="">All Statuses</option>
                    <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                    <option value="inactive" {{ request('status') === 'inactive' ? 'selected' : '' }}>Inactive</option>
                </select>
            </div>

            <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                Apply Filters
            </button>

            @if(request()->hasAny(['search', 'status']))
                <a href="{{ route('admin.roles.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    Clear
                </a>
            @endif
        </form>
    </div>

    <!-- Roles Table -->
    <div class="admin-card">
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-b border-slate-200 dark:border-navy-500">
                        <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Role</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Description</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Users</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Permissions</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Status</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Priority</th>
                        <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($roles ?? [] as $role)
                        <tr class="border-b border-slate-100 dark:border-navy-600">
                            <td class="px-4 py-3">
                                <div>
                                    <div class="font-medium text-slate-800 dark:text-navy-50">{{ $role->display_name ?? $role->name }}</div>
                                    <div class="text-sm text-slate-500">{{ $role->name }}</div>
                                </div>
                            </td>
                            <td class="px-4 py-3">
                                <div class="text-sm text-slate-800 dark:text-navy-50 max-w-xs truncate">
                                    {{ $role->description ?? 'No description provided' }}
                                </div>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium text-slate-800 dark:text-navy-50">{{ $role->users_count ?? 0 }}</span>
                                    <span class="text-sm text-slate-500">users</span>
                                </div>
                            </td>
                            <td class="px-4 py-3">
                                <div class="text-sm text-slate-800 dark:text-navy-50">
                                    {{ count($role->permissions ?? []) }} permissions
                                </div>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 text-xs font-medium rounded-full
                                    {{ $role->is_active ? 'bg-success-light text-success' : 'bg-error-light text-error' }}">
                                    {{ $role->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="text-sm font-medium text-slate-800 dark:text-navy-50">{{ $role->priority ?? 0 }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex gap-2">
                                    <a href="{{ route('admin.roles.show', $role) }}"
                                       class="btn size-8 rounded-full p-0 hover:bg-info/20 text-info"
                                       title="View Details">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </a>

                                    <a href="{{ route('admin.roles.edit', $role) }}"
                                       class="btn size-8 rounded-full p-0 hover:bg-warning/20 text-warning"
                                       title="Edit Role">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </a>

                                    @if(!in_array($role->name, ['super_admin', 'admin']))
                                        <button onclick="toggleRoleStatus({{ $role->id }}, {{ $role->is_active ? 'false' : 'true' }})"
                                                class="btn size-8 rounded-full p-0 hover:bg-{{ $role->is_active ? 'error' : 'success' }}/20 text-{{ $role->is_active ? 'error' : 'success' }}"
                                                title="{{ $role->is_active ? 'Deactivate' : 'Activate' }} Role">
                                            @if($role->is_active)
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                                </svg>
                                            @else
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            @endif
                                        </button>

                                        <button onclick="deleteRole({{ $role->id }}, '{{ $role->display_name ?? $role->name }}')"
                                                class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error"
                                                title="Delete Role">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-4 py-12 text-center">
                                <div class="flex flex-col items-center space-y-4">
                                    <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-500">
                                        <svg class="size-8 text-slate-400 dark:text-navy-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <div class="text-center">
                                        <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100">No Roles Found</h3>
                                        <p class="mt-1 text-sm text-slate-400 dark:text-navy-300">
                                            @if(request()->hasAny(['search', 'status']))
                                                No roles match your current search criteria. Try adjusting your filters.
                                            @else
                                                Get started by creating your first role.
                                            @endif
                                        </p>
                                    </div>
                                    <div class="flex space-x-3">
                                        @if(request()->hasAny(['search', 'status']))
                                            <a href="{{ route('admin.roles.index') }}" class="btn border border-slate-300 font-medium text-slate-700 hover:bg-slate-150">
                                                Clear Filters
                                            </a>
                                        @endif
                                        <a href="{{ route('admin.roles.create') }}" class="btn bg-primary text-white hover:bg-primary-focus">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Create First Role
                                        </a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if(isset($roles) && $roles->hasPages())
            <div class="flex items-center justify-between px-4 py-4">
                <div class="text-sm text-slate-400">
                    Showing {{ $roles->firstItem() }}-{{ $roles->lastItem() }} of {{ $roles->total() }} roles
                </div>
                {{ $roles->links() }}
            </div>
        @endif
    </div>
</div>

<!-- Role Status Toggle Modal -->
<div id="statusModal" class="fixed inset-0 z-50 hidden bg-slate-900/50">
    <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Confirm Action</h3>
            <p class="text-slate-600 dark:text-navy-300 mb-6" id="statusMessage"></p>
            <div class="flex gap-3">
                <button type="button" onclick="confirmStatusToggle()" class="btn bg-primary text-white hover:bg-primary-focus">
                    Confirm
                </button>
                <button type="button" onclick="closeStatusModal()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Delete Role Modal -->
<div id="deleteModal" class="fixed inset-0 z-50 hidden bg-slate-900/50">
    <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Delete Role</h3>
            <p class="text-slate-600 dark:text-navy-300 mb-6" id="deleteMessage"></p>
            <div class="flex gap-3">
                <button type="button" onclick="confirmDelete()" class="btn bg-error text-white hover:bg-error-focus">
                    Delete
                </button>
                <button type="button" onclick="closeDeleteModal()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</div>

<script>
let currentRoleId = null;
let currentStatus = null;

function toggleRoleStatus(roleId, newStatus) {
    currentRoleId = roleId;
    currentStatus = newStatus;

    const action = newStatus === 'true' ? 'activate' : 'deactivate';
    document.getElementById('statusMessage').textContent =
        `Are you sure you want to ${action} this role? This will affect all users assigned to this role.`;

    document.getElementById('statusModal').classList.remove('hidden');
}

function confirmStatusToggle() {
    fetch(`{{ url('admin/roles') }}/${currentRoleId}/toggle-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            is_active: currentStatus === 'true'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });

    closeStatusModal();
}

function closeStatusModal() {
    document.getElementById('statusModal').classList.add('hidden');
    currentRoleId = null;
    currentStatus = null;
}

function deleteRole(roleId, roleName) {
    currentRoleId = roleId;
    document.getElementById('deleteMessage').textContent =
        `Are you sure you want to delete the role "${roleName}"? This action cannot be undone and will remove the role from all users.`;

    document.getElementById('deleteModal').classList.remove('hidden');
}

function confirmDelete() {
    fetch(`{{ url('admin/roles') }}/${currentRoleId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred');
    });

    closeDeleteModal();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    currentRoleId = null;
}
</script>

@endsection