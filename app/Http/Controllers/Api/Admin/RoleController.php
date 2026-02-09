<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'admin']);
    }

    /**
     * Get all roles with their permissions and user counts
     */
    public function index(): JsonResponse
    {
        try {
            $roles = Role::with('permissions')
                        ->withCount('users')
                        ->orderBy('priority', 'desc')
                        ->get()
                        ->map(function ($role) {
                            return [
                                'id' => $role->id,
                                'name' => $role->name,
                                'display_name' => $role->display_name,
                                'description' => $role->description,
                                'priority' => $role->priority,
                                'is_active' => $role->is_active,
                                'users_count' => $role->users_count,
                                'permissions' => $role->permissions->pluck('name')->toArray(),
                                'created_at' => $role->created_at,
                                'updated_at' => $role->updated_at,
                            ];
                        });

            return response()->json([
                'success' => true,
                'roles' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific role with details
     */
    public function show(Role $role): JsonResponse
    {
        try {
            $role->load(['permissions', 'users' => function ($query) {
                $query->select(['id', 'name', 'email', 'role', 'is_active'])
                      ->limit(50);
            }]);

            return response()->json([
                'success' => true,
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'description' => $role->description,
                    'priority' => $role->priority,
                    'is_active' => $role->is_active,
                    'permissions' => $role->permissions,
                    'users' => $role->users,
                    'users_count' => $role->users()->count(),
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch role details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new role
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles',
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|integer|min:0|max:10',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $role = Role::create([
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'priority' => $request->priority,
                'permissions' => $request->permissions,
                'is_active' => $request->is_active ?? true,
            ]);

            // Sync permissions
            $permissions = Permission::whereIn('name', $request->permissions)->pluck('id');
            $role->permissions()->sync($permissions);

            return response()->json([
                'success' => true,
                'message' => 'Role created successfully',
                'role' => $role->load('permissions')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a role
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        // Prevent modification of super_admin role by non-super admins
        if ($role->name === 'super_admin' && !$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot modify super admin role'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'display_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|integer|min:0|max:10',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $role->update([
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'priority' => $request->priority,
                'permissions' => $request->permissions,
                'is_active' => $request->is_active ?? $role->is_active,
            ]);

            // Sync permissions
            $permissions = Permission::whereIn('name', $request->permissions)->pluck('id');
            $role->permissions()->sync($permissions);

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'role' => $role->load('permissions')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a role
     */
    public function destroy(Role $role): JsonResponse
    {
        // Prevent deletion of system roles
        $systemRoles = ['user', 'artist', 'moderator', 'admin', 'super_admin'];
        if (in_array($role->name, $systemRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete system role'
            ], 403);
        }

        // Prevent deletion if role has active users
        if ($role->users()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete role with active users'
            ], 422);
        }

        try {
            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign role to user
     */
    public function assignToUser(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_name' => 'required|exists:roles,name',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($request->user_id);
            $currentUser = $request->user();

            // Check if current user can manage the target user
            if (!$currentUser->canManageUser($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient permissions to manage this user'
                ], 403);
            }

            // Prevent non-super admins from assigning super_admin role
            if ($request->role_name === 'super_admin' && !$currentUser->isSuperAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot assign super admin role'
                ], 403);
            }

            $user->assignRole(
                $request->role_name,
                $currentUser->id,
                $request->expires_at ? \Carbon\Carbon::parse($request->expires_at) : null
            );

            return response()->json([
                'success' => true,
                'message' => 'Role assigned successfully',
                'user' => $user->load('activeRoles')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove role from user
     */
    public function removeFromUser(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_name' => 'required|exists:roles,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($request->user_id);
            $currentUser = $request->user();

            // Check if current user can manage the target user
            if (!$currentUser->canManageUser($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient permissions to manage this user'
                ], 403);
            }

            // Prevent removal of super_admin role by non-super admins
            if ($request->role_name === 'super_admin' && !$currentUser->isSuperAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove super admin role'
                ], 403);
            }

            $user->removeRole($request->role_name);

            return response()->json([
                'success' => true,
                'message' => 'Role removed successfully',
                'user' => $user->load('activeRoles')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available permissions
     */
    public function permissions(): JsonResponse
    {
        try {
            $permissions = Permission::active()
                                   ->orderBy('category')
                                   ->orderBy('name')
                                   ->get()
                                   ->groupBy('category');

            return response()->json([
                'success' => true,
                'permissions' => $permissions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}