@extends('layouts.admin')

@section('title', 'Edit Role')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Edit Role</h1>
                <p class="text-slate-600 dark:text-navy-300">Update role permissions and settings</p>
            </div>
            <div class="flex gap-3">
                <a href="{{ route('admin.roles.show', $role) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Role
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

    <form action="{{ route('admin.roles.update', $role) }}" method="POST" class="space-y-6">
        @csrf
        @method('PUT')

        <!-- Basic Information -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Basic Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="name" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Role Name <span class="text-red-500">*</span>
                    </label>
                    @if(in_array($role->name, ['super_admin', 'admin']))
                        <input type="text" value="{{ $role->name }}" disabled
                               class="form-input w-full bg-slate-100 dark:bg-navy-600 cursor-not-allowed">
                        <input type="hidden" name="name" value="{{ $role->name }}">
                        <p class="mt-1 text-xs text-slate-500">System roles cannot be renamed</p>
                    @else
                        <input type="text" id="name" name="name" value="{{ old('name', $role->name) }}" required
                               class="form-input w-full @error('name') border-red-500 @enderror"
                               placeholder="e.g., content_moderator">
                        @error('name')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                        <p class="mt-1 text-xs text-slate-500">Lowercase, underscore-separated identifier</p>
                    @endif
                </div>

                <div>
                    <label for="display_name" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Display Name <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="display_name" name="display_name" value="{{ old('display_name', $role->display_name) }}" required
                           class="form-input w-full @error('display_name') border-red-500 @enderror"
                           placeholder="e.g., Content Moderator">
                    @error('display_name')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="md:col-span-2">
                    <label for="description" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Description
                    </label>
                    <textarea id="description" name="description" rows="3"
                              class="form-input w-full @error('description') border-red-500 @enderror"
                              placeholder="Describe what this role is for and its responsibilities...">{{ old('description', $role->description) }}</textarea>
                    @error('description')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="priority" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Priority
                    </label>
                    <input type="number" id="priority" name="priority" value="{{ old('priority', $role->priority) }}" min="0" max="100"
                           class="form-input w-full @error('priority') border-red-500 @enderror">
                    @error('priority')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-xs text-slate-500">Higher priority roles take precedence (0-100)</p>
                </div>

                <div>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" name="is_active" value="1" {{ old('is_active', $role->is_active) ? 'checked' : '' }}
                               class="form-checkbox text-primary"
                               {{ in_array($role->name, ['super_admin', 'admin']) ? 'disabled' : '' }}>
                        <span class="text-sm font-medium text-slate-700 dark:text-navy-300">Active Role</span>
                    </label>
                    @if(in_array($role->name, ['super_admin', 'admin']))
                        <input type="hidden" name="is_active" value="1">
                        <p class="mt-1 text-xs text-slate-500">System roles cannot be deactivated</p>
                    @else
                        <p class="mt-1 text-xs text-slate-500">Only active roles can be assigned to users</p>
                    @endif
                </div>
            </div>
        </div>

        <!-- Permission Selection -->
        <div class="admin-card">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50">Permissions</h3>
                <div class="flex gap-2">
                    <button type="button" onclick="selectAllPermissions()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Select All
                    </button>
                    <button type="button" onclick="clearAllPermissions()" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Clear All
                    </button>
                </div>
            </div>

            @if(in_array($role->name, ['super_admin']))
                <div class="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                    <div class="flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.586-4.586L16 8l-4.586 4.586a2 2 0 001.414 3.414L16 12l4.586 4.586A2 2 0 0023.414 15L20 12l3.414-3.414a2 2 0 00-1.414-3.414L16 8z" />
                        </svg>
                        <div>
                            <h4 class="font-medium text-primary">Super Administrator</h4>
                            <p class="text-sm text-primary/80">This role has all permissions by default and cannot be modified.</p>
                        </div>
                    </div>
                </div>
            @else
                <!-- Permission Groups -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach($permissionGroups as $group => $permissions)
                        <div class="border border-slate-200 dark:border-navy-500 rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="font-medium text-slate-800 dark:text-navy-50 capitalize">{{ str_replace('_', ' ', $group) }}</h4>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" onchange="toggleGroup('{{ $group }}')"
                                           class="form-checkbox text-primary group-checkbox" data-group="{{ $group }}">
                                    <span class="text-xs text-slate-500">All</span>
                                </label>
                            </div>

                            <div class="space-y-2">
                                @foreach($permissions as $permission)
                                    <label class="flex items-center space-x-3">
                                        <input type="checkbox" name="permissions[]" value="{{ $permission }}"
                                               {{ in_array($permission, old('permissions', $role->permissions ?? [])) ? 'checked' : '' }}
                                               class="form-checkbox text-primary permission-checkbox" data-group="{{ $group }}">
                                        <span class="text-sm text-slate-700 dark:text-navy-300">{{ $permission }}</span>
                                    </label>
                                @endforeach
                            </div>
                        </div>
                    @endforeach
                </div>

                @error('permissions')
                    <p class="mt-3 text-sm text-red-600">{{ $message }}</p>
                @enderror
            @endif
        </div>

        <!-- Users with this Role -->
        @if($role->users->count() > 0)
            <div class="admin-card">
                <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">
                    Users Affected by Changes ({{ $role->users->count() }})
                </h3>

                <div class="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                    <div class="flex items-start space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-warning mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h4 class="font-medium text-warning">Permission Changes Will Affect Active Users</h4>
                            <p class="text-sm text-warning/80 mt-1">The following users currently have this role and will be affected by any permission changes you make.</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach($role->users->take(9) as $user)
                        <div class="flex items-center space-x-3 p-3 border border-slate-200 dark:border-navy-500 rounded-lg">
                            <div class="avatar size-8">
                                <img class="rounded-full" src="{{ $user->avatar ? Storage::url($user->avatar) : asset('images/200x200.png') }}" alt="{{ $user->name }}" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-slate-800 dark:text-navy-50 truncate">{{ $user->name }}</p>
                                <p class="text-xs text-slate-500 truncate">{{ $user->email }}</p>
                            </div>
                        </div>
                    @endforeach

                    @if($role->users->count() > 9)
                        <div class="flex items-center justify-center p-3 border border-slate-200 dark:border-navy-500 rounded-lg bg-slate-50 dark:bg-navy-600">
                            <span class="text-sm text-slate-600 dark:text-navy-300">
                                +{{ $role->users->count() - 9 }} more users
                            </span>
                        </div>
                    @endif
                </div>
            </div>
        @endif

        <!-- Submit Buttons -->
        <div class="flex gap-4">
            <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Update Role
            </button>

            <a href="{{ route('admin.roles.show', $role) }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                Cancel
            </a>

            @if(!in_array($role->name, ['super_admin', 'admin']))
                <button type="button" onclick="deleteRole()" class="btn bg-error text-white hover:bg-error-focus ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Role
                </button>
            @endif
        </div>
    </form>
</div>

<!-- Delete Confirmation Modal -->
<div id="deleteModal" class="fixed inset-0 z-50 hidden bg-slate-900/50">
    <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-navy-700">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-4">Delete Role</h3>
            <p class="text-slate-600 dark:text-navy-300 mb-6">
                Are you sure you want to delete the role "{{ $role->display_name ?? $role->name }}"?
                This action cannot be undone and will remove the role from all users.
            </p>
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
function selectAllPermissions() {
    document.querySelectorAll('input[name="permissions[]"]').forEach(checkbox => {
        if (!checkbox.disabled) {
            checkbox.checked = true;
        }
    });
    updateGroupCheckboxes();
}

function clearAllPermissions() {
    document.querySelectorAll('input[name="permissions[]"]').forEach(checkbox => {
        if (!checkbox.disabled) {
            checkbox.checked = false;
        }
    });
    document.querySelectorAll('.group-checkbox').forEach(checkbox => {
        if (!checkbox.disabled) {
            checkbox.checked = false;
        }
    });
}

function toggleGroup(groupName) {
    const groupCheckbox = document.querySelector(`.group-checkbox[data-group="${groupName}"]`);
    const permissionCheckboxes = document.querySelectorAll(`.permission-checkbox[data-group="${groupName}"]`);

    permissionCheckboxes.forEach(checkbox => {
        if (!checkbox.disabled) {
            checkbox.checked = groupCheckbox.checked;
        }
    });
}

function updateGroupCheckboxes() {
    document.querySelectorAll('.group-checkbox').forEach(groupCheckbox => {
        const groupName = groupCheckbox.dataset.group;
        const permissionCheckboxes = document.querySelectorAll(`.permission-checkbox[data-group="${groupName}"]`);
        const enabledCheckboxes = Array.from(permissionCheckboxes).filter(cb => !cb.disabled);
        const checkedCount = enabledCheckboxes.filter(cb => cb.checked).length;

        groupCheckbox.checked = checkedCount === enabledCheckboxes.length;
        groupCheckbox.indeterminate = checkedCount > 0 && checkedCount < enabledCheckboxes.length;
    });
}

function deleteRole() {
    document.getElementById('deleteModal').classList.remove('hidden');
}

function confirmDelete() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '{{ route("admin.roles.destroy", $role) }}';

    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = '_token';
    csrfInput.value = '{{ csrf_token() }}';
    form.appendChild(csrfInput);

    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'DELETE';
    form.appendChild(methodInput);

    document.body.appendChild(form);
    form.submit();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// Update group checkboxes when individual permissions change
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.permission-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateGroupCheckboxes);
    });

    // Initialize group checkboxes
    updateGroupCheckboxes();
});
</script>

@endsection