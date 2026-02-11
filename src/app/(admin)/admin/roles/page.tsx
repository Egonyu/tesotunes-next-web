'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Check,
  X,
  Loader2,
  Search,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────
interface Permission {
  id: string;
  name: string;
  description: string;
  group: string;
}

interface Role {
  id: number;
  name: string;
  slug: string;
  description: string;
  users_count: number;
  permissions: string[];
  is_system: boolean;
  created_at: string;
}

interface RolesResponse {
  data: Role[];
}

interface PermissionsResponse {
  data: Permission[];
}

// ── Component ────────────────────────────────────────────────────────
export default function RolesPage() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [] as string[] });

  // ── Queries ──────────────────────────────────────────────────────
  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => apiGet<RolesResponse>('/api/admin/roles'),
  });

  const { data: permissionsData, isLoading: loadingPermissions } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => apiGet<PermissionsResponse>('/api/admin/permissions'),
  });

  // ── Mutations ────────────────────────────────────────────────────
  const createRole = useMutation({
    mutationFn: (data: { name: string; description: string; permissions: string[] }) =>
      apiPost('/api/admin/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role created successfully');
      setShowCreateModal(false);
      resetForm();
    },
    onError: () => toast.error('Failed to create role'),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; description: string; permissions: string[] }) =>
      apiPut(`/admin/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role updated successfully');
      setEditingRole(null);
      resetForm();
    },
    onError: () => toast.error('Failed to update role'),
  });

  const deleteRole = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role deleted');
      setSelectedRole(null);
    },
    onError: () => toast.error('Failed to delete role'),
  });

  const updateRolePermissions = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) =>
      apiPut(`/admin/roles/${roleId}/permissions`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Permissions updated');
    },
    onError: () => toast.error('Failed to update permissions'),
  });

  // ── Helpers ──────────────────────────────────────────────────────
  const roles = rolesData?.data ?? [];
  const permissions = permissionsData?.data ?? [];
  const currentRole = roles.find((r) => r.id === selectedRole);

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const permissionGroups = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const group = p.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  function resetForm() {
    setFormData({ name: '', description: '', permissions: [] });
  }

  function openEditModal(role: Role) {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description, permissions: [...role.permissions] });
  }

  function togglePermission(roleId: number, permId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role || role.is_system) return;
    const perms = role.permissions.includes(permId)
      ? role.permissions.filter((p) => p !== permId)
      : [...role.permissions, permId];
    updateRolePermissions.mutate({ roleId, permissions: perms });
  }

  function handleSave() {
    if (editingRole) {
      updateRole.mutate({ id: editingRole.id, ...formData });
    } else {
      createRole.mutate(formData);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loadingRoles || loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage access control for {roles.length} roles</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="space-y-4">
          <h2 className="font-semibold">Roles ({filteredRoles.length})</h2>
          {filteredRoles.length === 0 ? (
            <div className="p-6 rounded-xl border bg-card text-center">
              <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No roles found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left transition-colors',
                    selectedRole === role.id
                      ? 'border-primary bg-primary/5'
                      : 'bg-card hover:border-primary/50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        role.is_system ? 'bg-primary/10 text-primary' : 'bg-muted'
                      )}>
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {(role.users_count ?? 0).toLocaleString()} users
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {role.permissions.length} permissions
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2">
          {currentRole ? (
            <div className="p-6 rounded-xl border bg-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">{currentRole.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentRole.description}</p>
                </div>
                {!currentRole.is_system && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(currentRole)} className="p-2 hover:bg-muted rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete role "${currentRole.name}"?`)) {
                          deleteRole.mutate(currentRole.id);
                        }
                      }}
                      className="p-2 hover:bg-muted rounded-lg text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="font-medium">Permissions</h3>

                {Object.keys(permissionGroups).length > 0 ? (
                  Object.entries(permissionGroups).map(([group, groupPerms]) => (
                    <div key={group}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">{group}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {groupPerms.map((perm) => {
                          const hasPerm = currentRole.permissions.includes(perm.id);
                          return (
                            <button
                              key={perm.id}
                              onClick={() => togglePermission(currentRole.id, perm.id)}
                              disabled={currentRole.is_system || updateRolePermissions.isPending}
                              className={cn(
                                'flex items-center justify-between p-3 rounded-lg border text-left transition-colors',
                                hasPerm
                                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                  : 'bg-muted/50 hover:bg-muted',
                                currentRole.is_system && 'cursor-not-allowed opacity-60'
                              )}
                            >
                              <div>
                                <p className="font-medium text-sm">{perm.name}</p>
                                <p className="text-xs text-muted-foreground">{perm.description}</p>
                              </div>
                              {hasPerm ? (
                                <Check className="h-5 w-5 text-green-600 shrink-0" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((perm) => {
                      const hasPerm = currentRole.permissions.includes(perm.id);
                      return (
                        <button
                          key={perm.id}
                          onClick={() => togglePermission(currentRole.id, perm.id)}
                          disabled={currentRole.is_system || updateRolePermissions.isPending}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border text-left transition-colors',
                            hasPerm
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                              : 'bg-muted/50 hover:bg-muted',
                            currentRole.is_system && 'cursor-not-allowed opacity-60'
                          )}
                        >
                          <div>
                            <p className="font-medium text-sm">{perm.name}</p>
                            <p className="text-xs text-muted-foreground">{perm.description}</p>
                          </div>
                          {hasPerm ? (
                            <Check className="h-5 w-5 text-green-600 shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentRole.is_system && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    This is a system role and cannot be modified.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border bg-card flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a role to view permissions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(showCreateModal || editingRole) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowCreateModal(false); setEditingRole(null); }}>
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editingRole ? 'Edit Role' : 'Create New Role'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg bg-background"
                placeholder="e.g. Content Moderator"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg bg-background resize-none"
                rows={2}
                placeholder="Role description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-3">
                {permissions.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.id)}
                      onChange={() =>
                        setFormData((f) => ({
                          ...f,
                          permissions: f.permissions.includes(perm.id)
                            ? f.permissions.filter((p) => p !== perm.id)
                            : [...f.permissions, perm.id],
                        }))
                      }
                      className="rounded"
                    />
                    <span className="text-sm">{perm.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowCreateModal(false); setEditingRole(null); }}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || createRole.isPending || updateRole.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {(createRole.isPending || updateRole.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                {editingRole ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
