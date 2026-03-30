'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiDelete, apiGet, apiPost, apiPut, isApiError } from '@/lib/api';
import { hasAnyPermission } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { InitialsAvatar, SafeImage } from '@/components/ui/safe-image';
import { pickMediaUrl } from '@/lib/media';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Copy,
  Edit,
  Eye,
  Loader2,
  ListChecks,
  MinusCircle,
  Plus,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  X,
} from 'lucide-react';

interface PermissionRecord {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  group?: string | null;
}

interface Role {
  id: number;
  name: string;
  display_name?: string | null;
  description?: string | null;
  priority: number;
  is_active: boolean;
  users_count: number;
  permissions: string[];
  permission_details?: PermissionRecord[];
  is_system?: boolean;
  created_at: string;
  updated_at?: string;
}

interface RolesResponse {
  success?: boolean;
  data: Role[];
}

interface PermissionsResponse {
  success?: boolean;
  data: Record<string, PermissionRecord[]> | PermissionRecord[];
}

interface UserRoleSummary {
  id: number;
  name: string;
  display_name?: string | null;
  priority: number;
  permissions: string[];
}

interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  avatar?: string | null;
  profile_image_url?: string | null;
  role?: string | null;
  active_roles?: UserRoleSummary[];
  permissions?: string[];
  is_active?: boolean;
  created_at: string;
  last_login_at?: string | null;
}

interface UsersResponse {
  success?: boolean;
  data: AdminUser[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface AccessHistoryItem {
  id: number;
  action: string;
  role_name?: string | null;
  actor?: {
    id: number;
    name: string;
    email: string;
  } | null;
  before_roles: string[];
  after_roles: string[];
  expires_at?: string | null;
  ip_address?: string | null;
  created_at?: string | null;
}

interface AccessHistoryResponse {
  success?: boolean;
  data: {
    user: AdminUser;
    history: AccessHistoryItem[];
  };
}

interface RoleTemplatesResponse {
  success?: boolean;
  data: RolePreset[];
}

type RoleFormData = {
  name: string;
  display_name: string;
  description: string;
  priority: number;
  is_active: boolean;
  permissions: string[];
};

type RolePreset = {
  id?: number;
  key: string;
  label: string;
  description: string;
  baseRoleName?: string;
  roleName: string;
  displayName: string;
  roleDescription: string;
  priority?: number;
  isActive?: boolean;
  permissions?: string[];
  isSystem?: boolean;
  createdAt?: string;
};

const SYSTEM_ROLE_NAMES = new Set(['user', 'artist', 'moderator', 'admin', 'super_admin']);

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function roleLabel(role: Pick<Role, 'display_name' | 'name'> | Pick<UserRoleSummary, 'display_name' | 'name'>): string {
  return role.display_name?.trim() || role.name.replace(/_/g, ' ');
}

function emptyRoleForm(): RoleFormData {
  return {
    name: '',
    display_name: '',
    description: '',
    priority: 1,
    is_active: true,
    permissions: [],
  };
}

function buildTemplateForm(role: Role, suffix = 'copy'): RoleFormData {
  const baseDisplayName = roleLabel(role);

  return {
    name: `${role.name}_${suffix}`,
    display_name: `${baseDisplayName} ${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`,
    description: role.description || '',
    priority: role.priority,
    is_active: role.is_active,
    permissions: [...role.permissions],
  };
}

function buildPresetForm(baseRole: Role | null, preset: RolePreset): RoleFormData {
  const permissions = preset.permissions ?? baseRole?.permissions ?? [];

  return {
    name: preset.roleName,
    display_name: preset.displayName,
    description: preset.roleDescription,
    priority: preset.priority ?? baseRole?.priority ?? 1,
    is_active: preset.isActive ?? baseRole?.is_active ?? true,
    permissions,
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isApiError(error)) {
    return fallback;
  }

  const responseData = error.response?.data;
  const fieldErrors = responseData?.errors;

  if (fieldErrors && typeof fieldErrors === 'object') {
    for (const value of Object.values(fieldErrors)) {
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }

      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
  }

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }

  return fallback;
}

export default function RolesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentRoleFilter, setAssignmentRoleFilter] = useState('all');
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [bulkRoleName, setBulkRoleName] = useState('');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [templateModalRole, setTemplateModalRole] = useState<Role | null>(null);
  const [templateForm, setTemplateForm] = useState({
    key: '',
    label: '',
    description: '',
  });
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [assigningUser, setAssigningUser] = useState<AdminUser | null>(null);
  const [accessReviewUser, setAccessReviewUser] = useState<AdminUser | null>(null);
  const [assignRoleName, setAssignRoleName] = useState('');
  const [formData, setFormData] = useState<RoleFormData>(emptyRoleForm());

  const canManageRoles =
    ['super admin', 'super_admin'].includes(normalize(session?.user?.role)) ||
    hasAnyPermission(session?.user?.permissions, [
      'manage-roles',
      'manage-settings',
      'manage-users',
      'admin.settings',
      'admin.users',
    ]);

  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => apiGet<RolesResponse>('/admin/roles'),
  });

  const { data: permissionsData, isLoading: loadingPermissions } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => apiGet<PermissionsResponse>('/admin/permissions'),
  });

  const { data: roleTemplatesData } = useQuery({
    queryKey: ['admin-role-templates'],
    queryFn: async () => {
      const response = await apiGet<{
        success?: boolean;
        data: Array<{
          id?: number;
          key: string;
          label: string;
          description: string;
          base_role_name?: string;
          role_name: string;
          display_name: string;
          role_description: string;
          priority?: number;
          is_active?: boolean;
          permissions?: string[];
          is_system?: boolean;
          created_at?: string;
        }>;
      }>('/admin/role-templates');

      return {
        success: response.success,
        data: response.data.map((template) => ({
          id: template.id,
          key: template.key,
          label: template.label,
          description: template.description,
          baseRoleName: template.base_role_name,
          roleName: template.role_name,
          displayName: template.display_name,
          roleDescription: template.role_description,
          priority: template.priority,
          isActive: template.is_active,
          permissions: template.permissions ?? [],
          isSystem: template.is_system,
          createdAt: template.created_at,
        })),
      } satisfies RoleTemplatesResponse;
    },
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-role-assignments', assignmentPage, assignmentSearch, assignmentRoleFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(assignmentPage));
      params.set('per_page', '12');
      if (assignmentSearch.trim()) {
        params.set('search', assignmentSearch.trim());
      }
      if (assignmentRoleFilter !== 'all') {
        params.set('role', assignmentRoleFilter);
      }
      return apiGet<UsersResponse>(`/admin/users?${params.toString()}`);
    },
  });

  const { data: accessHistoryData, isLoading: loadingAccessHistory } = useQuery({
    queryKey: ['admin-user-access-history', accessReviewUser?.id],
    enabled: Boolean(accessReviewUser?.id),
    queryFn: () => apiGet<AccessHistoryResponse>(`/admin/users/${accessReviewUser?.id}/access-history`),
  });

  const createRole = useMutation({
    mutationFn: (data: RoleFormData) => apiPost('/admin/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role created successfully.');
      closeRoleModal();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create role.')),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & RoleFormData) => apiPut(`/admin/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role updated successfully.');
      closeRoleModal();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update role.')),
  });

  const deleteRole = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role deleted.');
      setSelectedRoleId(null);
    },
    onError: () => toast.error('Failed to delete role.'),
  });

  const updateRolePermissions = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) =>
      apiPut(`/admin/roles/${roleId}/permissions`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role permissions updated.');
    },
    onError: () => toast.error('Failed to update permissions.'),
  });

  const assignRole = useMutation({
    mutationFn: (payload: { user_id: number; role_name: string }) => apiPost('/admin/roles/assign', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role assigned successfully.');
      setAssigningUser(null);
      setAssignRoleName('');
    },
    onError: () => toast.error('Failed to assign role.'),
  });

  const removeRole = useMutation({
    mutationFn: (payload: { user_id: number; role_name: string }) => apiPost('/admin/roles/remove', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role removed successfully.');
    },
    onError: () => toast.error('Failed to remove role.'),
  });

  const bulkAssignRole = useMutation({
    mutationFn: (payload: { user_ids: number[]; role_name: string }) => apiPost('/admin/roles/assign-bulk', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role assigned to selected users.');
      setSelectedUserIds([]);
      setBulkRoleName('');
    },
    onError: () => toast.error('Failed to assign role to selected users.'),
  });

  const bulkRemoveRole = useMutation({
    mutationFn: (payload: { user_ids: number[]; role_name: string }) => apiPost('/admin/roles/remove-bulk', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role removed from selected users.');
      setSelectedUserIds([]);
      setBulkRoleName('');
    },
    onError: () => toast.error('Failed to remove role from selected users.'),
  });

  const createRoleTemplate = useMutation({
    mutationFn: (payload: {
      key: string;
      label: string;
      description: string;
      base_role_name: string;
      role_name: string;
      display_name: string;
      role_description: string;
      priority: number;
      is_active: boolean;
      permissions: string[];
    }) => apiPost('/admin/role-templates', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-templates'] });
      toast.success('Role template saved.');
      setTemplateModalRole(null);
      setTemplateForm({ key: '', label: '', description: '' });
    },
    onError: () => toast.error('Failed to save role template.'),
  });

  const deleteRoleTemplate = useMutation({
    mutationFn: (templateId: number) => apiDelete(`/admin/role-templates/${templateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-templates'] });
      toast.success('Role template deleted.');
    },
    onError: () => toast.error('Failed to delete role template.'),
  });

  const roles = rolesData?.data ?? [];
  const permissionSource = permissionsData?.data ?? {};
  const permissions = Array.isArray(permissionSource) ? permissionSource : Object.values(permissionSource).flat();
  const roleTemplates = roleTemplatesData?.data ?? [];
  const users = usersData?.data ?? [];
  const usersMeta = usersData?.meta;
  const allVisibleUsersSelected = users.length > 0 && users.every((user) => selectedUserIds.includes(user.id));
  const moderatorTemplate = roles.find((role) => role.name === 'moderator') ?? null;
  const adminTemplate = roles.find((role) => role.name === 'admin') ?? null;
  const artistTemplate = roles.find((role) => role.name === 'artist') ?? null;
  const presetBaseRoles: Record<string, Role | null> = {
    moderator: moderatorTemplate,
    admin: adminTemplate,
    artist: artistTemplate,
  };

  const filteredRoles = roles.filter((role) => {
    const haystack = [
      role.name,
      role.display_name,
      role.description,
      ...(role.permissions ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(roleSearch.trim().toLowerCase());
  });

  const selectedRole =
    filteredRoles.find((role) => role.id === selectedRoleId) ??
    roles.find((role) => role.id === selectedRoleId) ??
    filteredRoles[0] ??
    roles[0] ??
    null;

  const permissionGroups = permissions.reduce<Record<string, PermissionRecord[]>>((groups, permission) => {
    const key = permission.group || 'general';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(permission);
    return groups;
  }, {});

  const filteredPermissionGroups = Object.entries(permissionGroups).reduce<Record<string, PermissionRecord[]>>(
    (groups, [group, groupPermissions]) => {
      const matches = groupPermissions.filter((permission) => {
        const haystack = [permission.key, permission.name, permission.description, group]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(permissionSearch.trim().toLowerCase());
      });

      if (matches.length > 0) {
        groups[group] = matches;
      }

      return groups;
    },
    {}
  );

  const totalAssignedUsers = roles.reduce((sum, role) => sum + (role.users_count ?? 0), 0);
  const normalizedRoleKey = normalize(formData.name);
  const duplicateRole = roles.find((role) => normalize(role.name) === normalizedRoleKey && role.id !== editingRole?.id);
  const roleKeyError = !normalizedRoleKey
    ? 'Role key is required.'
    : duplicateRole
      ? `Role key "${duplicateRole.name}" already exists. Use a different key or clone the existing role.`
      : null;

  function isSystemRole(role: Role | null): boolean {
    if (!role) return false;
    return Boolean(role.is_system) || SYSTEM_ROLE_NAMES.has(role.name);
  }

  function closeRoleModal() {
    setRoleModalOpen(false);
    setEditingRole(null);
    setFormData(emptyRoleForm());
  }

  function openCreateRoleModal() {
    setEditingRole(null);
    setFormData(emptyRoleForm());
    setRoleModalOpen(true);
  }

  function openEditRoleModal(role: Role) {
    setEditingRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name || role.name.replace(/_/g, ' '),
      description: role.description || '',
      priority: role.priority,
      is_active: role.is_active,
      permissions: [...role.permissions],
    });
    setRoleModalOpen(true);
  }

  function cloneRole(role: Role) {
    setEditingRole(null);
    setFormData(buildTemplateForm(role));
    setRoleModalOpen(true);
  }

  function applyExistingRoleTemplate(role: Role, suffix = 'template') {
    setEditingRole(null);
    setFormData(buildTemplateForm(role, suffix));
  }

  function applyPreset(preset: RolePreset) {
    const baseRole = preset.baseRoleName ? (presetBaseRoles[preset.baseRoleName] ?? null) : null;
    setEditingRole(null);
    setFormData(buildPresetForm(baseRole, preset));
  }

  function openSaveTemplateModal(role: Role) {
    setTemplateModalRole(role);
    setTemplateForm({
      key: `${role.name}_template_${Date.now()}`.toLowerCase(),
      label: `${roleLabel(role)} Template`,
      description: role.description || '',
    });
  }

  function handleSaveTemplate() {
    if (!templateModalRole) return;

    createRoleTemplate.mutate({
      key: normalize(templateForm.key).replace(/[^a-z0-9_]+/g, '_'),
      label: templateForm.label.trim(),
      description: templateForm.description.trim(),
      base_role_name: templateModalRole.name,
      role_name: `${templateModalRole.name}_template`,
      display_name: `${roleLabel(templateModalRole)} Template`,
      role_description: templateModalRole.description || `${roleLabel(templateModalRole)} based reusable template.`,
      priority: templateModalRole.priority,
      is_active: templateModalRole.is_active,
      permissions: templateModalRole.permissions,
    });
  }

  function toggleFormPermission(permissionKey: string) {
    setFormData((current) => ({
      ...current,
      permissions: current.permissions.includes(permissionKey)
        ? current.permissions.filter((item) => item !== permissionKey)
        : [...current.permissions, permissionKey],
    }));
  }

  function toggleRolePermission(role: Role, permissionKey: string) {
    if (!canManageRoles || isSystemRole(role) || updateRolePermissions.isPending) {
      return;
    }

    const nextPermissions = role.permissions.includes(permissionKey)
      ? role.permissions.filter((item) => item !== permissionKey)
      : [...role.permissions, permissionKey];

    updateRolePermissions.mutate({ roleId: role.id, permissions: nextPermissions });
  }

  function saveRole() {
    if (!canManageRoles) return;
    if (roleKeyError) {
      toast.error(roleKeyError);
      return;
    }

    if (editingRole) {
      updateRole.mutate({ id: editingRole.id, ...formData });
      return;
    }

    createRole.mutate(formData);
  }

  function handleDeleteRole(role: Role) {
    if (!canManageRoles || isSystemRole(role)) return;

    if (confirm(`Delete role "${roleLabel(role)}"? This cannot be undone.`)) {
      deleteRole.mutate(role.id);
    }
  }

  function handleAssignRole() {
    if (!assigningUser || !assignRoleName) return;

    assignRole.mutate({
      user_id: assigningUser.id,
      role_name: assignRoleName,
    });
  }

  function handleRemoveRole(user: AdminUser, roleName: string) {
    if (!canManageRoles) return;

    if (confirm(`Remove "${roleName.replace(/_/g, ' ')}" from ${user.name || user.username}?`)) {
      removeRole.mutate({ user_id: user.id, role_name: roleName });
    }
  }

  function toggleUserSelection(userId: number) {
    setSelectedUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  }

  function toggleAllVisibleUsers() {
    setSelectedUserIds((current) => {
      if (allVisibleUsersSelected) {
        return current.filter((id) => !users.some((user) => user.id === id));
      }

      return Array.from(new Set([...current, ...users.map((user) => user.id)]));
    });
  }

  function handleBulkAssign() {
    if (selectedUserIds.length === 0 || !bulkRoleName) return;

    bulkAssignRole.mutate({
      user_ids: selectedUserIds,
      role_name: bulkRoleName,
    });
  }

  function handleBulkRemove() {
    if (selectedUserIds.length === 0 || !bulkRoleName) return;

    if (confirm(`Remove "${bulkRoleName.replace(/_/g, ' ')}" from ${selectedUserIds.length} selected users?`)) {
      bulkRemoveRole.mutate({
        user_ids: selectedUserIds,
        role_name: bulkRoleName,
      });
    }
  }

  if (loadingRoles || loadingPermissions) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">
            Build access control from the admin panel, manage permission bundles, and assign roles to people in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Roles</span>
            <div className="font-semibold">{roles.length}</div>
          </div>
          <div className="rounded-xl border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Permissions</span>
            <div className="font-semibold">{permissions.length}</div>
          </div>
          <div className="rounded-xl border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Assignments</span>
            <div className="font-semibold">{totalAssignedUsers}</div>
          </div>
          <button
            onClick={openCreateRoleModal}
            disabled={!canManageRoles}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New Role
          </button>
        </div>
      </div>

      {!canManageRoles && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          You can review roles and user assignments, but your account does not currently have permission to change them.
        </div>
      )}

      <Tabs defaultValue="roles" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Role Builder
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <UserCog className="h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <section className="space-y-4">
              <div className="rounded-2xl border bg-card p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={roleSearch}
                    onChange={(event) => setRoleSearch(event.target.value)}
                    placeholder="Search roles or permission keys..."
                    className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-colors',
                      selectedRole?.id === role.id ? 'border-primary bg-primary/5' : 'bg-card hover:border-primary/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{roleLabel(role)}</p>
                          {isSystemRole(role) && <Badge variant="outline">System</Badge>}
                          {!role.is_active && <Badge variant="warning">Inactive</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{role.description || 'No description yet.'}</p>
                      </div>
                      <Shield className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{role.permissions.length} permissions</span>
                      <span>{role.users_count} users</span>
                    </div>
                  </button>
                ))}

                {filteredRoles.length === 0 && (
                  <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
                    No roles match your search.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              {selectedRole ? (
                <>
                  <div className="rounded-2xl border bg-card p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold">{roleLabel(selectedRole)}</h2>
                          <Badge variant={selectedRole.is_active ? 'success' : 'warning'}>
                            {selectedRole.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {isSystemRole(selectedRole) && <Badge variant="outline">Protected</Badge>}
                        </div>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                          {selectedRole.description || 'This role does not have a description yet.'}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Priority {selectedRole.priority}</span>
                          <span>{selectedRole.permissions.length} permissions</span>
                          <span>{selectedRole.users_count} assigned users</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openSaveTemplateModal(selectedRole)}
                          disabled={!canManageRoles}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                          Save Template
                        </button>
                        <button
                          onClick={() => cloneRole(selectedRole)}
                          disabled={!canManageRoles}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Copy className="h-4 w-4" />
                          Clone
                        </button>
                        <button
                          onClick={() => openEditRoleModal(selectedRole)}
                          disabled={!canManageRoles || isSystemRole(selectedRole)}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRole(selectedRole)}
                          disabled={!canManageRoles || isSystemRole(selectedRole)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-card p-6">
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="font-semibold">Permission Matrix</h3>
                        <p className="text-sm text-muted-foreground">
                          Toggle the exact permission keys this role should grant.
                        </p>
                      </div>
                      <div className="relative w-full lg:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={permissionSearch}
                          onChange={(event) => setPermissionSearch(event.target.value)}
                          placeholder="Filter permissions..."
                          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      {Object.entries(filteredPermissionGroups).map(([group, groupPermissions]) => (
                        <div key={group} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium capitalize">{group.replace(/_/g, ' ')}</h4>
                              <p className="text-xs text-muted-foreground">{groupPermissions.length} permissions</p>
                            </div>
                            <Badge variant="outline">
                              {groupPermissions.filter((permission) => selectedRole.permissions.includes(permission.key)).length}/{groupPermissions.length}
                            </Badge>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {groupPermissions.map((permission) => {
                              const enabled = selectedRole.permissions.includes(permission.key);
                              return (
                                <button
                                  key={permission.id}
                                  onClick={() => toggleRolePermission(selectedRole, permission.key)}
                                  disabled={!canManageRoles || isSystemRole(selectedRole) || updateRolePermissions.isPending}
                                  className={cn(
                                    'flex items-start justify-between gap-4 rounded-xl border p-4 text-left transition-colors',
                                    enabled
                                      ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
                                      : 'bg-background hover:border-primary/40',
                                    (!canManageRoles || isSystemRole(selectedRole)) && 'cursor-not-allowed opacity-60'
                                  )}
                                >
                                  <div className="space-y-1">
                                    <p className="font-medium">{permission.name}</p>
                                    <p className="text-xs text-muted-foreground">{permission.key}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {permission.description || 'No description available.'}
                                    </p>
                                  </div>
                                  {enabled ? (
                                    <Check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                                  ) : (
                                    <X className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {Object.keys(filteredPermissionGroups).length === 0 && (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          No permissions match the current filter.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center rounded-2xl border bg-card">
                  <div className="space-y-2 text-center">
                    <Settings2 className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h2 className="font-semibold">Select a role</h2>
                    <p className="text-sm text-muted-foreground">Choose a role from the left to manage its permissions.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={assignmentSearch}
                  onChange={(event) => {
                    setAssignmentSearch(event.target.value);
                    setAssignmentPage(1);
                  }}
                  placeholder="Search by user, username, or email..."
                  className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm"
                />
              </div>

              <div className="w-full lg:w-56">
                <Select
                  value={assignmentRoleFilter}
                  onChange={(event) => {
                    setAssignmentRoleFilter(event.target.value);
                    setAssignmentPage(1);
                  }}
                >
                  <option value="all">All primary roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {selectedUserIds.length > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm">
                <span className="font-semibold">{selectedUserIds.length}</span>{' '}
                <span className="text-muted-foreground">users selected for bulk role changes</span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select value={bulkRoleName} onChange={(event) => setBulkRoleName(event.target.value)} className="min-w-[220px]">
                  <option value="">Choose role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </Select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkAssign}
                    disabled={!canManageRoles || !bulkRoleName || bulkAssignRole.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bulkAssignRole.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
                    Assign Selected
                  </button>
                  <button
                    onClick={handleBulkRemove}
                    disabled={!canManageRoles || !bulkRoleName || bulkRemoveRole.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bulkRemoveRole.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MinusCircle className="h-4 w-4" />}
                    Remove Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead className="bg-muted/40">
                  <tr className="text-left text-sm">
                    <th className="px-6 py-4 font-medium">
                      <input
                        type="checkbox"
                        checked={allVisibleUsersSelected}
                        onChange={toggleAllVisibleUsers}
                        className="h-4 w-4 rounded border-input"
                      />
                    </th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Primary Role</th>
                    <th className="px-6 py-4 font-medium">Assigned Roles</th>
                    <th className="px-6 py-4 font-medium">Permissions</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Last Login</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-sm text-muted-foreground">
                        No users match the current filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const avatarUrl = pickMediaUrl(user.avatar_url, user.profile_image_url, user.avatar);
                      const activeRoles = user.active_roles ?? [];
                      const primaryRole = activeRoles[0]?.display_name || activeRoles[0]?.name || user.role || 'user';
                      return (
                        <tr key={user.id} className="align-top hover:bg-muted/20">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="mt-2 h-4 w-4 rounded border-input"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 overflow-hidden rounded-full bg-muted">
                                {avatarUrl ? (
                                  <SafeImage
                                    src={avatarUrl}
                                    alt={user.name || user.username}
                                    width={44}
                                    height={44}
                                    className="h-full w-full object-cover"
                                    fallback={<InitialsAvatar name={user.name || user.username} textClassName="text-sm" />}
                                  />
                                ) : (
                                  <InitialsAvatar name={user.name || user.username} textClassName="text-sm" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-medium">{user.name || user.username}</p>
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="capitalize">
                              {String(primaryRole).replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {activeRoles.length > 0 ? (
                                activeRoles.map((role) => (
                                  <div
                                    key={`${user.id}-${role.name}`}
                                    className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs"
                                  >
                                    <span>{roleLabel(role)}</span>
                                    {canManageRoles && role.name !== 'super_admin' && (
                                      <button
                                        onClick={() => handleRemoveRole(user, role.name)}
                                        className="text-muted-foreground hover:text-red-600"
                                        title={`Remove ${roleLabel(role)}`}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">No active roles</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {(user.permissions ?? []).length} granted
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={user.is_active ? 'success' : 'warning'}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                              <button
                                onClick={() => setAccessReviewUser(user)}
                                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                              >
                                <ListChecks className="h-4 w-4" />
                                Access
                              </button>
                              <button
                                onClick={() => {
                                  setAssigningUser(user);
                                  setAssignRoleName(activeRoles[0]?.name ?? '');
                                }}
                                disabled={!canManageRoles}
                                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <UserCog className="h-4 w-4" />
                                Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {usersMeta && usersMeta.last_page > 1 && (
              <div className="flex flex-col gap-3 border-t px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between">
                <p className="text-muted-foreground">
                  Showing {((usersMeta.current_page - 1) * usersMeta.per_page) + 1}-
                  {Math.min(usersMeta.current_page * usersMeta.per_page, usersMeta.total)} of {usersMeta.total} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAssignmentPage((page) => Math.max(1, page - 1))}
                    disabled={usersMeta.current_page === 1}
                    className="rounded-lg border p-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="rounded-lg border px-3 py-2">
                    Page {usersMeta.current_page} of {usersMeta.last_page}
                  </span>
                  <button
                    onClick={() => setAssignmentPage((page) => Math.min(usersMeta.last_page, page + 1))}
                    disabled={usersMeta.current_page === usersMeta.last_page}
                    className="rounded-lg border p-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {roleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 md:p-6">
          <div className="flex min-h-full items-start justify-center">
            <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-background shadow-xl md:max-h-[calc(100vh-3rem)]">
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{editingRole ? 'Edit Role' : 'Create Role'}</h2>
                <p className="text-sm text-muted-foreground">
                  Define the role metadata and choose the permission keys it should grant.
                </p>
              </div>
              <button onClick={closeRoleModal} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid gap-6 p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                {!editingRole && (
                  <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                    <div>
                      <h3 className="font-medium">Quick Templates</h3>
                      <p className="text-xs text-muted-foreground">
                        Start from an existing role instead of building permissions from scratch.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(emptyRoleForm())}
                        className="rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        <div className="font-medium">Blank Role</div>
                        <div className="text-xs text-muted-foreground">Create a role from scratch with no preloaded permissions.</div>
                      </button>

                      {roleTemplates.filter((preset) => {
                        if (!preset.baseRoleName) return true;
                        return Boolean(presetBaseRoles[preset.baseRoleName]);
                      }).map((preset) => (
                        <div key={preset.key} className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className="flex-1 rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-muted"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{preset.label}</span>
                              <Badge variant={preset.isSystem ? 'outline' : 'secondary'}>
                                {preset.isSystem ? 'System' : 'Custom'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{preset.description}</div>
                          </button>
                          {!preset.isSystem && preset.id && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete template "${preset.label}"?`)) {
                                  deleteRoleTemplate.mutate(preset.id!);
                                }
                              }}
                              className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                              title={`Delete ${preset.label}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role Key</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: normalize(event.target.value).replace(/\s+/g, '_') }))}
                    placeholder="content_manager"
                    className={cn(
                      'w-full rounded-lg border bg-background px-3 py-2 text-sm',
                      roleKeyError && 'border-destructive focus-visible:ring-destructive'
                    )}
                  />
                  {roleKeyError ? (
                    <p className="text-xs text-destructive">{roleKeyError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Use lowercase letters, numbers, and underscores.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(event) => setFormData((current) => ({ ...current, display_name: event.target.value }))}
                    placeholder="Content Manager"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                    rows={4}
                    placeholder="What this role is responsible for..."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={formData.priority}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          priority: Number.isNaN(Number(event.target.value)) ? 0 : Number(event.target.value),
                        }))
                      }
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <label className="mt-8 inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(event) => setFormData((current) => ({ ...current, is_active: event.target.checked }))}
                    />
                    Active
                  </label>
                </div>
                <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  {formData.permissions.length} permissions selected
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={permissionSearch}
                    onChange={(event) => setPermissionSearch(event.target.value)}
                    placeholder="Search permission keys..."
                    className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm"
                  />
                </div>

                <div className="max-h-[40vh] space-y-5 overflow-y-auto pr-1 md:max-h-[48vh] lg:max-h-[56vh]">
                  {Object.entries(filteredPermissionGroups).map(([group, groupPermissions]) => (
                    <div key={group} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium capitalize">{group.replace(/_/g, ' ')}</h3>
                          <p className="text-xs text-muted-foreground">{groupPermissions.length} available</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const groupKeys = groupPermissions.map((permission) => permission.key);
                            const allSelected = groupKeys.every((key) => formData.permissions.includes(key));
                            setFormData((current) => ({
                              ...current,
                              permissions: allSelected
                                ? current.permissions.filter((permission) => !groupKeys.includes(permission))
                                : Array.from(new Set([...current.permissions, ...groupKeys])),
                            }));
                          }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Toggle group
                        </button>
                      </div>

                      <div className="grid gap-3">
                        {groupPermissions.map((permission) => {
                          const checked = formData.permissions.includes(permission.key);
                          return (
                            <label
                              key={permission.id}
                              className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                                checked ? 'border-primary bg-primary/5' : 'hover:border-primary/30'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleFormPermission(permission.key)}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <p className="font-medium">{permission.name}</p>
                                <p className="text-xs text-muted-foreground">{permission.key}</p>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description || 'No description available.'}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button onClick={closeRoleModal} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={saveRole}
                disabled={
                  Boolean(roleKeyError) ||
                  !formData.display_name.trim() ||
                  createRole.isPending ||
                  updateRole.isPending
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {(createRole.isPending || updateRole.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {templateModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-background shadow-xl">
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Save Role as Template</h2>
                <p className="text-sm text-muted-foreground">
                  Turn {roleLabel(templateModalRole)} into a reusable custom template for future roles.
                </p>
              </div>
              <button
                onClick={() => {
                  setTemplateModalRole(null);
                  setTemplateForm({ key: '', label: '', description: '' });
                }}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Key</label>
                <input
                  type="text"
                  value={templateForm.key}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, key: event.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="moderator_night_shift"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <input
                  type="text"
                  value={templateForm.label}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, label: event.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Night Shift Moderator"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={(event) => setTemplateForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Reusable moderation bundle for after-hours review coverage."
                />
              </div>
              <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                This template will save {templateModalRole.permissions.length} permission keys from the current role.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setTemplateModalRole(null);
                  setTemplateForm({ key: '', label: '', description: '' });
                }}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateForm.key.trim() || !templateForm.label.trim() || createRoleTemplate.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createRoleTemplate.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {assigningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-background shadow-xl">
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Assign Role</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a role for {assigningUser.name || assigningUser.username}. Existing active roles stay in place unless you remove them.
                </p>
              </div>
              <button
                onClick={() => {
                  setAssigningUser(null);
                  setAssignRoleName('');
                }}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="font-medium">{assigningUser.name || assigningUser.username}</p>
                <p className="text-sm text-muted-foreground">@{assigningUser.username}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(assigningUser.active_roles ?? []).map((role) => (
                    <Badge key={role.name} variant="outline">
                      {roleLabel(role)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={assignRoleName} onChange={(event) => setAssignRoleName(event.target.value)}>
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setAssigningUser(null);
                  setAssignRoleName('');
                }}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={!assignRoleName || assignRole.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assignRole.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Assign Role
              </button>
            </div>
          </div>
        </div>
      )}

      {accessReviewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-xl">
            {(() => {
              const reviewedUser = accessHistoryData?.data.user ?? accessReviewUser;
              const historyItems = accessHistoryData?.data.history ?? [];
              const reviewedAvatar = pickMediaUrl(reviewedUser.avatar_url, reviewedUser.profile_image_url, reviewedUser.avatar);

              return (
                <>
            <div className="flex items-start justify-between border-b px-6 py-5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Access Review</h2>
                <p className="text-sm text-muted-foreground">
                  Review effective roles and permissions for {reviewedUser.name || reviewedUser.username}.
                </p>
              </div>
              <button onClick={() => setAccessReviewUser(null)} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto p-6">
              <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-muted">
                  {reviewedAvatar ? (
                    <SafeImage
                      src={reviewedAvatar}
                      alt={reviewedUser.name || reviewedUser.username}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      fallback={<InitialsAvatar name={reviewedUser.name || reviewedUser.username} textClassName="text-base" />}
                    />
                  ) : (
                    <InitialsAvatar name={reviewedUser.name || reviewedUser.username} textClassName="text-base" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">{reviewedUser.name || reviewedUser.username}</p>
                  <p className="text-sm text-muted-foreground">@{reviewedUser.username}</p>
                  <p className="text-sm text-muted-foreground">{reviewedUser.email}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-medium">Active Roles</h3>
                  <div className="rounded-2xl border p-4">
                    <div className="flex flex-wrap gap-2">
                      {(reviewedUser.active_roles ?? []).length > 0 ? (
                        reviewedUser.active_roles?.map((role) => (
                          <Badge key={role.name} variant="outline">
                            {roleLabel(role)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No active roles found.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Account Status</h3>
                  <div className="rounded-2xl border p-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={reviewedUser.is_active ? 'success' : 'warning'}>
                        {reviewedUser.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        Primary: {(reviewedUser.role || 'user').replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Last login: {reviewedUser.last_login_at ? new Date(reviewedUser.last_login_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Effective Permissions</h3>
                  <Badge variant="outline">{(reviewedUser.permissions ?? []).length} total</Badge>
                </div>
                <div className="max-h-[320px] overflow-y-auto rounded-2xl border p-4">
                  {(reviewedUser.permissions ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {reviewedUser.permissions?.slice().sort().map((permission) => (
                        <Badge key={permission} variant="secondary" className="font-mono text-[11px]">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No effective permissions returned for this user.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Role History</h3>
                  <Badge variant="outline">{historyItems.length} events</Badge>
                </div>
                <div className="max-h-[280px] space-y-3 overflow-y-auto rounded-2xl border p-4">
                  {loadingAccessHistory ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : historyItems.length > 0 ? (
                    historyItems.map((item) => (
                      <div key={item.id} className="rounded-xl border bg-card p-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {item.action === 'role_assigned' ? 'Assigned' : 'Removed'}{' '}
                              <span className="font-mono text-sm">{item.role_name || 'unknown_role'}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              By {item.actor?.name || item.actor?.email || 'System'}
                              {item.ip_address ? ` from ${item.ip_address}` : ''}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown time'}
                          </p>
                        </div>
                        <div className="mt-3 grid gap-3 text-xs text-muted-foreground lg:grid-cols-2">
                          <div>
                            <p className="mb-1 font-medium text-foreground">Before</p>
                            <div className="flex flex-wrap gap-2">
                              {item.before_roles.length > 0 ? item.before_roles.map((role) => (
                                <Badge key={`${item.id}-before-${role}`} variant="outline">{role.replace(/_/g, ' ')}</Badge>
                              )) : <span>No roles</span>}
                            </div>
                          </div>
                          <div>
                            <p className="mb-1 font-medium text-foreground">After</p>
                            <div className="flex flex-wrap gap-2">
                              {item.after_roles.length > 0 ? item.after_roles.map((role) => (
                                <Badge key={`${item.id}-after-${role}`} variant="outline">{role.replace(/_/g, ' ')}</Badge>
                              )) : <span>No roles</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No role change history found for this user yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <Link
                href={`/admin/users/${reviewedUser.id}`}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Open User
              </Link>
              <button
                onClick={() => setAccessReviewUser(null)}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                Close
              </button>
            </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
