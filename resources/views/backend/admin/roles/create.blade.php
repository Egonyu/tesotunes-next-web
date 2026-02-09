@extends('layouts.admin')

@section('title', 'Create Role')

@section('content')
<div class="dashboard-content">
    <!-- Page Header -->
    <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-800 dark:text-navy-50">Create Role</h1>
                <p class="text-slate-600 dark:text-navy-300">Create a new user role with specific permissions</p>
            </div>
            <div>
                <a href="{{ route('admin.roles.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Roles
                </a>
            </div>
        </div>
    </div>

    <form action="{{ route('admin.roles.store') }}" method="POST" class="space-y-6">
        @csrf

        <!-- Basic Information -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Basic Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="name" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Role Name <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="name" name="name" value="{{ old('name') }}" required
                           class="form-input w-full @error('name') border-red-500 @enderror"
                           placeholder="e.g., content_moderator">
                    @error('name')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-xs text-slate-500">Lowercase, underscore-separated identifier</p>
                </div>

                <div>
                    <label for="display_name" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Display Name <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="display_name" name="display_name" value="{{ old('display_name') }}" required
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
                              placeholder="Describe what this role is for and its responsibilities...">{{ old('description') }}</textarea>
                    @error('description')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="priority" class="block text-sm font-medium text-slate-700 dark:text-navy-300 mb-2">
                        Priority
                    </label>
                    <input type="number" id="priority" name="priority" value="{{ old('priority', 0) }}" min="0" max="100"
                           class="form-input w-full @error('priority') border-red-500 @enderror">
                    @error('priority')
                        <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-xs text-slate-500">Higher priority roles take precedence (0-100)</p>
                </div>

                <div>
                    <label class="flex items-center space-x-3">
                        <input type="checkbox" name="is_active" value="1" {{ old('is_active', true) ? 'checked' : '' }}
                               class="form-checkbox text-primary">
                        <span class="text-sm font-medium text-slate-700 dark:text-navy-300">Active Role</span>
                    </label>
                    <p class="mt-1 text-xs text-slate-500">Only active roles can be assigned to users</p>
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
                                           {{ in_array($permission, old('permissions', [])) ? 'checked' : '' }}
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
        </div>

        <!-- Predefined Role Templates -->
        <div class="admin-card">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-navy-50 mb-6">Quick Templates</h3>
            <p class="text-sm text-slate-600 dark:text-navy-300 mb-4">Click a template to auto-fill permissions for common roles:</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                @foreach($roleTemplates as $template => $data)
                    <button type="button" onclick="applyTemplate('{{ $template }}')"
                            class="template-btn p-4 border border-slate-200 dark:border-navy-500 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-navy-600 transition-colors">
                        <div class="font-medium text-slate-800 dark:text-navy-50 mb-1">{{ $data['display_name'] }}</div>
                        <div class="text-sm text-slate-600 dark:text-navy-300 mb-2">{{ $data['description'] }}</div>
                        <div class="text-xs text-slate-500">{{ count($data['permissions']) }} permissions</div>
                    </button>
                @endforeach
            </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-4">
            <button type="submit" class="btn bg-primary text-white hover:bg-primary-focus">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Create Role
            </button>

            <a href="{{ route('admin.roles.index') }}" class="btn border border-slate-300 text-slate-700 hover:bg-slate-50">
                Cancel
            </a>
        </div>
    </form>
</div>

<script>
// Role templates data
const templates = @json($roleTemplates);

function applyTemplate(templateName) {
    if (!templates[templateName]) return;

    const template = templates[templateName];

    // Fill basic information
    document.getElementById('name').value = templateName;
    document.getElementById('display_name').value = template.display_name;
    document.getElementById('description').value = template.description;
    document.getElementById('priority').value = template.priority || 0;

    // Clear all current selections
    clearAllPermissions();

    // Select template permissions
    template.permissions.forEach(permission => {
        const checkbox = document.querySelector(`input[name="permissions[]"][value="${permission}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });

    // Update group checkboxes
    updateGroupCheckboxes();
}

function selectAllPermissions() {
    document.querySelectorAll('input[name="permissions[]"]').forEach(checkbox => {
        checkbox.checked = true;
    });
    updateGroupCheckboxes();
}

function clearAllPermissions() {
    document.querySelectorAll('input[name="permissions[]"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.group-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
}

function toggleGroup(groupName) {
    const groupCheckbox = document.querySelector(`.group-checkbox[data-group="${groupName}"]`);
    const permissionCheckboxes = document.querySelectorAll(`.permission-checkbox[data-group="${groupName}"]`);

    permissionCheckboxes.forEach(checkbox => {
        checkbox.checked = groupCheckbox.checked;
    });
}

function updateGroupCheckboxes() {
    document.querySelectorAll('.group-checkbox').forEach(groupCheckbox => {
        const groupName = groupCheckbox.dataset.group;
        const permissionCheckboxes = document.querySelectorAll(`.permission-checkbox[data-group="${groupName}"]`);
        const checkedCount = Array.from(permissionCheckboxes).filter(cb => cb.checked).length;

        groupCheckbox.checked = checkedCount === permissionCheckboxes.length;
        groupCheckbox.indeterminate = checkedCount > 0 && checkedCount < permissionCheckboxes.length;
    });
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