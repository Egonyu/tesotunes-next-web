@extends('layouts.admin')

@section('title', 'Role Details')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">{{ $role->display_name ?? $role->name }}</h1>
                <p class="text-slate-600 dark:text-navy-300">Role details and user assignments</p>
            </div>
            <div class="flex gap-3">
                <a href="{{ route('admin.roles.edit', $role) }}" class="btn bg-warning text-white hover:bg-warning-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Role
                </a>
                <a href="{{ route('admin.roles.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Roles
                </a>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Role Information -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Basic Details -->
            <div class="admin-card">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Role Information</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Role Name</label>
                        <p class="text-slate-800 dark:text-navy-50 font-mono bg-slate-100 dark:bg-navy-600 px-3 py-2 rounded">{{ $role->name }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Display Name</label>
                        <p class="text-slate-800 dark:text-navy-50">{{ $role->display_name ?? 'Not set' }}</p>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Description</label>
                        <p class="text-slate-800 dark:text-navy-50">{{ $role->description ?? 'No description provided' }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Priority</label>
                        <p class="text-slate-800 dark:text-navy-50">{{ $role->priority ?? 0 }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Status</label>
                        <span class="px-2 py-1 text-xs font-medium rounded-full
                            {{ $role->is_active ? 'bg-success-light text-success' : 'bg-error-light text-error' }}">
                            {{ $role->is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Created</label>
                        <p class="text-slate-800 dark:text-navy-50">{{ $role->created_at->format('M j, Y \a\t g:i A') }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-navy-300 mb-1">Last Updated</label>
                        <p class="text-slate-800 dark:text-navy-50">{{ $role->updated_at->format('M j, Y \a\t g:i A') }}</p>
                    </div>
                </div>
            </div>

            <!-- Permissions -->
            <div class="admin-card">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Permissions</h3>
                    <span class="text-sm text-slate-500">{{ count($role->permissions ?? []) }} permissions</span>
                </div>

                @if(!empty($role->permissions))
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @foreach($permissionGroups as $group => $permissions)
                            @php
                                $groupPermissions = array_intersect($permissions, $role->permissions);
                            @endphp
                            @if(!empty($groupPermissions))
                                <div class="border border-slate-200 dark:border-navy-500 rounded-lg p-4">
                                    <h4 class="font-medium text-slate-800 dark:text-navy-50 capitalize mb-3">
                                        {{ str_replace('_', ' ', $group) }}
                                        <span class="text-sm text-slate-500">({{ count($groupPermissions) }})</span>
                                    </h4>
                                    <div class="space-y-2">
                                        @foreach($groupPermissions as $permission)
                                            <div class="flex items-center space-x-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-sm text-slate-700 dark:text-navy-300">{{ $permission }}</span>
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            @endif
                        @endforeach
                    </div>
                @else
                    <div class="text-center py-8">
                        <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-500 mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-2">No Permissions</h3>
                        <p class="text-slate-500">This role has no permissions assigned.</p>
                    </div>
                @endif
            </div>

            <!-- Role Users -->
            <div class="admin-card">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Users with this Role</h3>
                    <div class="flex items-center gap-3">
                        <span class="text-sm text-slate-500">{{ $role->users->count() }} users</span>
                        <button onclick="showAssignUserModal()" class="btn bg-primary text-white hover:bg-primary-focus">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Assign User
                        </button>
                    </div>
                </div>

                @if($role->users->count() > 0)
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="border-b border-slate-200 dark:border-navy-500">
                                    <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">User</th>
                                    <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Email</th>
                                    <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Assigned</th>
                                    <th class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-navy-50">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($role->users as $user)
                                    <tr class="border-b border-slate-100 dark:border-navy-600">
                                        <td class="px-4 py-3">
                                            <div class="flex items-center space-x-3">
                                                <div class="avatar size-8">
                                                    <img class="rounded-full" src="{{ $user->avatar ? Storage::url($user->avatar) : asset('images/200x200.png') }}" alt="{{ $user->name }}" />
                                                </div>
                                                <div>
                                                    <div class="font-medium text-slate-800 dark:text-navy-50">{{ $user->name }}</div>
                                                    @if($user->stage_name)
                                                        <div class="text-xs text-slate-500">{{ $user->stage_name }}</div>
                                                    @endif
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-4 py-3 text-slate-800 dark:text-navy-50">{{ $user->email }}</td>
                                        <td class="px-4 py-3 text-sm text-slate-600 dark:text-navy-300">
                                            {{ $user->pivot->assigned_at ? $user->pivot->assigned_at->diffForHumans() : 'Unknown' }}
                                        </td>
                                        <td class="px-4 py-3">
                                            <button onclick="removeUserFromRole({{ $user->id }}, '{{ $user->name }}')"
                                                    class="btn size-8 rounded-full p-0 hover:bg-error/20 text-error"
                                                    title="Remove Role">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <div class="text-center py-8">
                        <div class="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-500 mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-slate-700 dark:text-navy-100 mb-2">No Users</h3>
                        <p class="text-slate-500 mb-4">No users have been assigned to this role yet.</p>
                        <button onclick="showAssignUserModal()" class="btn bg-primary text-white hover:bg-primary-focus">
                            Assign First User
                        </button>
                    </div>
                @endif
            </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
            <!-- Quick Stats -->
            <div class="admin-card">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Quick Stats</h3>

                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-600 dark:text-navy-300">Total Users</span>
                        <span class="font-medium text-slate-800 dark:text-navy-50">{{ $role->users->count() }}</span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-600 dark:text-navy-300">Active Users</span>
                        <span class="font-medium text-slate-800 dark:text-navy-50">{{ $role->users->where('pivot.is_active', true)->count() }}</span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-600 dark:text-navy-300">Permissions</span>
                        <span class="font-medium text-slate-800 dark:text-navy-50">{{ count($role->permissions ?? []) }}</span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-600 dark:text-navy-300">Priority Level</span>
                        <span class="font-medium text-slate-800 dark:text-navy-50">{{ $role->priority ?? 0 }}</span>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="admin-card">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Quick Actions</h3>

                <div class="space-y-3">
                    <a href="{{ route('admin.roles.edit', $role) }}" class="btn w-full bg-warning text-white hover:bg-warning-focus">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Role
                    </a>

                    <button onclick="showAssignUserModal()" class="btn w-full bg-primary text-white hover:bg-primary-focus">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Assign User
                    </button>

                    @if(!in_array($role->name, ['super_admin', 'admin']))
                        <button onclick="toggleRoleStatus({{ $role->id }}, {{ $role->is_active ? 'false' : 'true' }})"
                                class="btn w-full bg-{{ $role->is_active ? 'error' : 'success' }} text-white hover:bg-{{ $role->is_active ? 'error' : 'success' }}-focus">
                            @if($role->is_active)
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                </svg>
                                Deactivate Role
                            @else
                                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Activate Role
                            @endif
                        </button>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Assign User Modal -->
<div id="assignUserModal" class="fixed inset-0 z-50 hidden bg-slate-900/50">
    <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Assign User to Role</h3>

            <form id="assignUserForm">
                <div class="mb-4">
                    <label for="user_search" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Search User
                    </label>
                    <input type="text" id="user_search" placeholder="Type to search users..."
                           class="form-input w-full">
                    <div id="user_suggestions" class="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded hidden"></div>
                </div>

                <input type="hidden" id="selected_user_id">

                <div class="flex gap-3">
                    <button type="button" onclick="assignUserToRole()" class="btn bg-primary text-white hover:bg-primary-focus">
                        Assign
                    </button>
                    <button type="button" onclick="closeAssignUserModal()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function showAssignUserModal() {
    document.getElementById('assignUserModal').classList.remove('hidden');
    document.getElementById('user_search').focus();
}

function closeAssignUserModal() {
    document.getElementById('assignUserModal').classList.add('hidden');
    document.getElementById('user_search').value = '';
    document.getElementById('selected_user_id').value = '';
    document.getElementById('user_suggestions').classList.add('hidden');
}

function assignUserToRole() {
    const userId = document.getElementById('selected_user_id').value;

    if (!userId) {
        alert('Please select a user');
        return;
    }

    fetch('{{ route("admin.roles.assign") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            user_id: userId,
            role_id: {{ $role->id }}
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
}

function removeUserFromRole(userId, userName) {
    if (!confirm(`Are you sure you want to remove the role from ${userName}?`)) {
        return;
    }

    fetch('{{ route("admin.roles.remove") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': '{{ csrf_token() }}'
        },
        body: JSON.stringify({
            user_id: userId,
            role_id: {{ $role->id }}
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
}

// User search functionality
let searchTimeout;
document.getElementById('user_search').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.trim();

    if (query.length < 2) {
        document.getElementById('user_suggestions').classList.add('hidden');
        return;
    }

    searchTimeout = setTimeout(() => {
        fetch(`{{ url('admin/api/users/search') }}?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(users => {
                const suggestions = document.getElementById('user_suggestions');

                if (users.length === 0) {
                    suggestions.innerHTML = '<div class="p-3 text-sm text-slate-500">No users found</div>';
                    suggestions.classList.remove('hidden');
                    return;
                }

                suggestions.innerHTML = users.map(user => `
                    <div class="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                         onclick="selectUser(${user.id}, '${user.name}')">
                        <div class="font-medium">${user.name}</div>
                        <div class="text-sm text-slate-500">${user.email}</div>
                    </div>
                `).join('');

                suggestions.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Search error:', error);
            });
    }, 300);
});

function selectUser(userId, userName) {
    document.getElementById('selected_user_id').value = userId;
    document.getElementById('user_search').value = userName;
    document.getElementById('user_suggestions').classList.add('hidden');
}
</script>

@endsection