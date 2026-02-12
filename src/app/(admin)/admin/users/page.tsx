'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { 
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role?: 'user' | 'artist' | 'admin' | 'super_admin' | string;
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | string;
  created_at: string;
  last_login_at: string | null;
}

interface UsersResponse {
    data: User[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface UsersStats {
  total: number;
  active: number;
  artists: number;
  admins: number;
  new_this_week: number;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', { page: currentPage, role: roleFilter, status: statusFilter, search: searchQuery }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('per_page', '20');
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      return apiGet<UsersResponse>(`/api/admin/users?${params.toString()}`);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'users', 'statistics'],
    queryFn: () => apiGet<{ data: UsersStats }>('/api/admin/users/statistics'),
  });

  const banMutation = useMutation({
    mutationFn: (userId: number) => apiPost(`/api/admin/users/${userId}/ban`, {}),
    onSuccess: () => {
      toast.success('User banned');
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to ban user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => apiDelete(`/api/admin/users/${userId}`),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to delete user'),
  });

  // Handle different possible API response shapes
  const rawUsersData = usersData as Record<string, unknown> | undefined;
  const users: User[] = Array.isArray(usersData?.data)
    ? usersData.data
    : Array.isArray((rawUsersData?.data as Record<string, unknown>)?.data) 
      ? ((rawUsersData?.data as Record<string, unknown>).data as User[])
      : [];
  const meta = usersData?.meta 
    || (rawUsersData?.data as Record<string, unknown>)?.meta as UsersResponse['meta'] | undefined;
  const stats = statsData?.data;
  
  const roleStyles: Record<string, string> = {
    user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    artist: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    super_admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    banned: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };
  
  const toggleSelect = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(u => u !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Failed to load users</p>
        <p className="text-muted-foreground text-sm mt-2">Please check your connection and try again</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage platform users</p>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="artist">Artists</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
      
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedUsers.length} selected</span>
          <button className="flex items-center gap-1 px-3 py-1 text-sm bg-background border rounded hover:bg-muted">
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-sm bg-background border rounded hover:bg-muted">
            <UserX className="h-4 w-4" />
            Suspend
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
      
      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium">User</th>
                <th className="p-4 text-left text-sm font-medium">Role</th>
                <th className="p-4 text-left text-sm font-medium">Status</th>
                <th className="p-4 text-left text-sm font-medium">Created</th>
                <th className="p-4 text-left text-sm font-medium">Last Login</th>
                <th className="p-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('') : user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : user.username?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || user.name || user.username}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium capitalize',
                      roleStyles[user.role as keyof typeof roleStyles] || roleStyles.user
                    )}>
                      {(user.role || 'user').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium capitalize',
                      statusStyles[(user.status || (user.is_active ? 'active' : 'inactive')) as keyof typeof statusStyles] || statusStyles.active
                    )}>
                      {user.status || (user.is_active ? 'active' : 'inactive')}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="p-2 hover:bg-muted rounded-lg"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="p-2 hover:bg-muted rounded-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteMutation.mutate(user.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-muted rounded-lg text-red-500 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((meta.current_page - 1) * (meta.per_page || 20)) + 1}-{Math.min(meta.current_page * (meta.per_page || 20), meta.total || 0)} of {(meta.total ?? 0).toLocaleString()} users
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'px-3 py-1 rounded-lg',
                      page === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                  >
                    {page}
                  </button>
                );
              })}
              {meta.last_page > 5 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    onClick={() => setCurrentPage(meta.last_page)}
                    className={cn(
                      'px-3 py-1 rounded-lg',
                      meta.last_page === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    )}
                  >
                    {meta.last_page}
                  </button>
                </>
              )}
              <button 
                onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                disabled={currentPage === meta.last_page}
                className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
