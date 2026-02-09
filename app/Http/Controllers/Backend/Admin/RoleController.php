<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\RoleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    protected RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->get('search'),
            'status' => $request->get('status'),
        ];

        $roles = $this->roleService->getRoles(array_filter($filters), 20);
        $stats = $this->roleService->getRoleStatistics();

        return view('admin.roles.index', compact('roles', 'stats'));
    }

    public function create()
    {
        $permissionGroups = $this->roleService->getAvailablePermissions();
        $roleTemplates = [];

        return view('admin.roles.create', compact('permissionGroups', 'roleTemplates'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name|regex:/^[a-z_]+$/',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'priority' => 'nullable|integer|min:0|max:100',
            'is_active' => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        try {
            $role = $this->roleService->createRole($request->all());

            return redirect()->route('admin.roles.show', $role)
                ->with('success', 'Role created successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function show(Role $role)
    {
        $role->load('users');
        $permissionGroups = $this->getPermissionGroups();

        return view('admin.roles.show', compact('role', 'permissionGroups'));
    }

    public function edit(Role $role)
    {
        $permissionGroups = $this->getPermissionGroups();
        $roleTemplates = $this->getRoleTemplates();

        return view('admin.roles.edit', compact('role', 'permissionGroups', 'roleTemplates'));
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($role->id),
                'regex:/^[a-z_]+$/',
            ],
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'priority' => 'nullable|integer|min:0|max:100',
            'is_active' => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
        ]);

        // Prevent modification of system roles
        if (in_array($role->name, ['super_admin', 'admin']) && $request->name !== $role->name) {
            return back()->withErrors(['name' => 'System roles cannot be renamed.']);
        }

        $updateData = [
            'display_name' => $request->display_name,
            'description' => $request->description,
            'priority' => $request->priority ?? 0,
        ];

        // Only update name if it's not a system role
        if (!in_array($role->name, ['super_admin', 'admin'])) {
            $updateData['name'] = $request->name;
            $updateData['is_active'] = $request->boolean('is_active', true);
        }

        // Handle permissions
        if ($role->name === 'super_admin') {
            $updateData['permissions'] = ['*']; // Super admin always has all permissions
        } else {
            $updateData['permissions'] = $request->permissions ?? [];
        }

        $role->update($updateData);

        return redirect()->route('admin.roles.show', $role)
            ->with('success', 'Role updated successfully!');
    }

    public function destroy(Role $role)
    {
        // Prevent deletion of system roles
        if (in_array($role->name, ['super_admin', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'System roles cannot be deleted.'
            ], 400);
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete role that is assigned to users. Remove all users first.'
            ], 400);
        }

        $role->delete();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully!'
            ]);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role deleted successfully!');
    }

    public function assignRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        try {
            $user = User::findOrFail($request->user_id);
            $role = Role::findOrFail($request->role_id);

            $this->roleService->assignRole($user, $role, auth()->user());

            return response()->json([
                'success' => true,
                'message' => 'Role assigned successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function removeRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        try {
            $user = User::findOrFail($request->user_id);
            $role = Role::findOrFail($request->role_id);

            $this->roleService->removeRole($user, $role, auth()->user());

            return response()->json([
                'success' => true,
                'message' => 'Role removed successfully!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function toggleStatus(Request $request, Role $role)
    {
        // Prevent deactivation of system roles
        if (in_array($role->name, ['super_admin', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'System roles cannot be deactivated.'
            ], 400);
        }

        $role->update([
            'is_active' => $request->boolean('is_active')
        ]);

        $status = $role->is_active ? 'activated' : 'deactivated';

        return response()->json([
            'success' => true,
            'message' => "Role {$status} successfully!"
        ]);
    }

    private function getPermissionGroups(): array
    {
        return [
            'music' => [
                'music.play',
                'music.like',
                'music.share',
                'music.upload',
                'music.edit_own',
                'music.edit_any',
                'music.delete_own',
                'music.delete_any',
                'music.moderate',
                'music.approve',
                'music.feature',
            ],
            'user' => [
                'user.view',
                'user.edit_own',
                'user.edit_any',
                'user.delete_own',
                'user.delete_any',
                'user.moderate',
                'user.ban',
                'user.unban',
                'user.impersonate',
            ],
            'playlist' => [
                'playlist.create',
                'playlist.edit_own',
                'playlist.edit_any',
                'playlist.delete_own',
                'playlist.delete_any',
                'playlist.moderate',
            ],
            'comment' => [
                'comment.create',
                'comment.edit_own',
                'comment.edit_any',
                'comment.delete_own',
                'comment.delete_any',
                'comment.moderate',
            ],
            'admin' => [
                'admin.dashboard',
                'admin.users',
                'admin.music',
                'admin.roles',
                'admin.permissions',
                'admin.settings',
                'admin.reports',
                'admin.analytics',
                'admin.payments',
                'admin.credits',
            ],
            'analytics' => [
                'analytics.view_own',
                'analytics.view_any',
                'analytics.export',
            ],
            'follow' => [
                'follow.users',
                'follow.artists',
            ],
            'system' => [
                'system.settings',
                'system.maintenance',
                'system.backup',
                'system.logs',
            ],
        ];
    }

    private function getRoleTemplates(): array
    {
        return [
            'user' => [
                'display_name' => 'Regular User',
                'description' => 'Standard user with basic music consumption permissions',
                'priority' => 10,
                'permissions' => Role::getDefaultPermissions(Role::USER),
            ],
            'artist' => [
                'display_name' => 'Artist',
                'description' => 'Music creator with upload and management permissions',
                'priority' => 30,
                'permissions' => Role::getDefaultPermissions(Role::ARTIST),
            ],
            'moderator' => [
                'display_name' => 'Moderator',
                'description' => 'Content moderator with review and approval permissions',
                'priority' => 50,
                'permissions' => Role::getDefaultPermissions(Role::MODERATOR),
            ],
            'admin' => [
                'display_name' => 'Administrator',
                'description' => 'System administrator with full platform access',
                'priority' => 80,
                'permissions' => Role::getDefaultPermissions(Role::ADMIN),
            ],
        ];
    }
}