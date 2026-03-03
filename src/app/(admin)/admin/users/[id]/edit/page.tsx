'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';
import { PageHeader, FormActions, FormField, FormSection } from '@/components/admin';
import { toast } from 'sonner';

type UserDetail = {
  id: number;
  name: string;
  full_name?: string | null;
  username: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  role: 'user' | 'artist' | 'moderator' | 'admin';
  is_active: boolean;
  avatar_url?: string | null;
};

type UserFormData = {
  name: string;
  email: string;
  username: string;
  phone: string;
  role: UserDetail['role'];
  country: string;
  city: string;
  bio: string;
  is_active: boolean;
  password: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  message?: string;
};

function parseError(error: unknown): { message: string; fields: Record<string, string> } {
  const e = error as ApiError;
  const fields: Record<string, string> = {};
  const errs = e.response?.data?.errors;
  if (errs) {
    for (const [key, value] of Object.entries(errs)) {
      fields[key] = value[0];
    }
  }
  return {
    message: e.response?.data?.message || e.message || 'Failed to update user',
    fields,
  };
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    username: '',
    phone: '',
    role: 'user',
    country: '',
    city: '',
    bio: '',
    is_active: true,
    password: '',
  });

  const { data: userRes, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => apiGet<{ data: UserDetail }>(`/admin/users/${id}`),
  });

  const user = userRes?.data;

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || user.full_name || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      role: user.role || 'user',
      country: user.country || '',
      city: user.city || '',
      bio: user.bio || '',
      is_active: user.is_active ?? true,
      password: '',
    });
    setErrors({});
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: async (payload: UserFormData) => {
      const body: Record<string, unknown> = {
        name: payload.name.trim(),
        email: payload.email.trim(),
        username: payload.username.trim(),
        phone: payload.phone.trim(),
        role: payload.role,
        country: payload.country.trim() || null,
        city: payload.city.trim() || null,
        bio: payload.bio.trim() || null,
        is_active: payload.is_active,
      };

      if (payload.password.trim()) {
        body.password = payload.password.trim();
      }

      return apiPut<{ success: boolean; message: string; data?: UserDetail }>(`/admin/users/${id}`, body);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'User updated successfully');
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
    },
    onError: (error) => {
      const parsed = parseError(error);
      setErrors(parsed.fields);
      const firstFieldError = Object.values(parsed.fields)[0];
      toast.error(firstFieldError || parsed.message);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    if (!formData.username.trim()) nextErrors.username = 'Username is required';
    if (formData.password && formData.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    updateUserMutation.mutate(formData);
  };

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-muted rounded animate-pulse" />
        <div className="h-100 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit User"
        description="Update account details and access level"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: user.name || user.username, href: `/admin/users/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/admin/users/${id}`}
        actions={
          user.role === 'artist' ? (
            <Link href="/admin/artists" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted">
              View Artist Records
            </Link>
          ) : undefined
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Account" description="Fields map directly to AdminUsersController::update">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Name" error={errors.name} required>
              <input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border px-4 py-2 bg-background"
              />
            </FormField>

            <FormField label="Email" error={errors.email} required>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border px-4 py-2 bg-background"
              />
            </FormField>

            <FormField label="Username" error={errors.username} required>
              <input
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-lg border px-4 py-2 bg-background"
              />
            </FormField>

            <FormField label="Phone" error={errors.phone}>
              <input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border px-4 py-2 bg-background"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Country (ISO-2)" error={errors.country}>
              <input
                value={formData.country}
                maxLength={2}
                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value.toUpperCase() }))}
                className="w-full rounded-lg border px-4 py-2 bg-background"
                placeholder="UG"
              />
            </FormField>

            <FormField label="City" error={errors.city}>
              <input
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full rounded-lg border px-4 py-2 bg-background"
              />
            </FormField>
          </div>

          <FormField label="Bio" error={errors.bio}>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              className="w-full rounded-lg border px-4 py-2 bg-background"
            />
          </FormField>
        </FormSection>

        <FormSection title="Role & Access">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Role" error={errors.role}>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserDetail['role'] }))}
                className="w-full rounded-lg border px-4 py-2 bg-background"
              >
                <option value="user">User</option>
                <option value="artist">Artist</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>

            <div className="flex items-center gap-2 pt-8">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              <label htmlFor="is_active" className="text-sm font-medium">Active account</label>
            </div>
          </div>
        </FormSection>

        <FormSection title="Reset Password" description="Optional. Leave blank to keep existing password.">
          <div className="relative">
            <FormField label="New Password" error={errors.password}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-lg border px-4 py-2 bg-background pr-10"
                placeholder="At least 8 characters"
              />
            </FormField>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormSection>

        <FormActions
          cancelHref={`/admin/users/${id}`}
          submitLabel={updateUserMutation.isPending ? 'Saving...' : 'Save User Changes'}
          isSubmitting={updateUserMutation.isPending}
        />
      </form>
    </div>
  );
}
