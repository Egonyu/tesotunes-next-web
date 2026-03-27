'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';
import { normalizeCountryCode } from '@/lib/country';
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
  event_organizer?: {
    enabled: boolean;
    business_name?: string | null;
    support_email?: string | null;
    support_phone?: string | null;
    notes?: string | null;
    ready_for_events?: boolean;
    payout_method?: string | null;
    mobile_money_provider?: string | null;
    mobile_money_number?: string | null;
    bank_name?: string | null;
    bank_account?: string | null;
  } | null;
};

type UserFormData = {
  name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  country: string;
  city: string;
  bio: string;
  is_active: boolean;
  password: string;
  is_event_organizer: boolean;
  organizer_business_name: string;
  organizer_support_email: string;
  organizer_support_phone: string;
  organizer_notes: string;
  organizer_payout_method: string;
  organizer_mobile_money_provider: string;
  organizer_mobile_money_number: string;
  organizer_bank_name: string;
  organizer_bank_account: string;
};

type RoleOption = {
  id: number;
  name: string;
};

const ALLOWED_ADMIN_USER_ROLES = ['user', 'artist', 'moderator', 'admin'] as const;

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
    is_event_organizer: false,
    organizer_business_name: '',
    organizer_support_email: '',
    organizer_support_phone: '',
    organizer_notes: '',
    organizer_payout_method: 'mobile_money',
    organizer_mobile_money_provider: 'mtn',
    organizer_mobile_money_number: '',
    organizer_bank_name: '',
    organizer_bank_account: '',
  });

  const { data: userRes, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => apiGet<{ data: UserDetail }>(`/admin/users/${id}`),
  });

  const { data: rolesRes } = useQuery({
    queryKey: ['admin', 'roles', 'assignable'],
    queryFn: () => apiGet<{ data: RoleOption[] }>('/admin/roles'),
  });

  const user = userRes?.data;

  const roleOptions = (rolesRes?.data ?? [])
    .map((role) => role.name)
    .filter((role, index, arr) => arr.indexOf(role) === index)
    .filter((role): role is (typeof ALLOWED_ADMIN_USER_ROLES)[number] =>
      (ALLOWED_ADMIN_USER_ROLES as readonly string[]).includes(role)
    );

  const resolvedRoleOptions = roleOptions.length > 0
    ? roleOptions
    : [...ALLOWED_ADMIN_USER_ROLES];

  useEffect(() => {
    if (!user) return;
    setFormData({
      name: user.name || user.full_name || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      role: user.role || 'user',
      country: normalizeCountryCode(user.country),
      city: user.city || '',
      bio: user.bio || '',
      is_active: user.is_active ?? true,
      password: '',
      is_event_organizer: Boolean(user.event_organizer?.enabled),
      organizer_business_name: user.event_organizer?.business_name || '',
      organizer_support_email: user.event_organizer?.support_email || '',
      organizer_support_phone: user.event_organizer?.support_phone || '',
      organizer_notes: user.event_organizer?.notes || '',
      organizer_payout_method: user.event_organizer?.payout_method || 'mobile_money',
      organizer_mobile_money_provider: user.event_organizer?.mobile_money_provider || 'mtn',
      organizer_mobile_money_number: user.event_organizer?.mobile_money_number || '',
      organizer_bank_name: user.event_organizer?.bank_name || '',
      organizer_bank_account: user.event_organizer?.bank_account || '',
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
        country: normalizeCountryCode(payload.country) || null,
        city: payload.city.trim() || null,
        bio: payload.bio.trim() || null,
        is_active: payload.is_active,
        is_event_organizer: payload.is_event_organizer,
      };

      if (payload.is_event_organizer) {
        body.organizer_business_name = payload.organizer_business_name.trim() || null;
        body.organizer_support_email = payload.organizer_support_email.trim() || null;
        body.organizer_support_phone = payload.organizer_support_phone.trim() || null;
        body.organizer_notes = payload.organizer_notes.trim() || null;
        body.organizer_payout_method = payload.organizer_payout_method;
        body.organizer_mobile_money_provider = payload.organizer_mobile_money_provider || null;
        body.organizer_mobile_money_number = payload.organizer_mobile_money_number.trim() || null;
        body.organizer_bank_name = payload.organizer_bank_name.trim() || null;
        body.organizer_bank_account = payload.organizer_bank_account.trim() || null;
      }

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
                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                onBlur={(e) => setFormData((prev) => ({ ...prev, country: normalizeCountryCode(e.target.value) }))}
                className="w-full rounded-lg border px-4 py-2 bg-background"
                placeholder="UG or Uganda"
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2 bg-background"
                >
                  {resolvedRoleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
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

        <FormSection title="Event Organizer Setup" description="Manage event ownership readiness, support contacts, and payout details">
          <div className="flex items-center gap-2">
            <input
              id="is_event_organizer"
              type="checkbox"
              checked={formData.is_event_organizer}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_event_organizer: e.target.checked }))}
            />
            <label htmlFor="is_event_organizer" className="text-sm font-medium">Organizer-ready account</label>
          </div>

          {formData.is_event_organizer && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Business / Organizer Name" error={errors.organizer_business_name}>
                  <input
                    value={formData.organizer_business_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, organizer_business_name: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>
                <FormField label="Support Email" error={errors.organizer_support_email}>
                  <input
                    type="email"
                    value={formData.organizer_support_email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, organizer_support_email: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>
                <FormField label="Support Phone" error={errors.organizer_support_phone}>
                  <input
                    value={formData.organizer_support_phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, organizer_support_phone: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  />
                </FormField>
                <FormField label="Payout Method" error={errors.organizer_payout_method}>
                  <select
                    value={formData.organizer_payout_method}
                    onChange={(e) => setFormData((prev) => ({ ...prev, organizer_payout_method: e.target.value }))}
                    className="w-full rounded-lg border px-4 py-2 bg-background"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="zengapay">ZengaPay</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </FormField>
              </div>

              {formData.organizer_payout_method === 'bank' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Bank Name" error={errors.organizer_bank_name}>
                    <input
                      value={formData.organizer_bank_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, organizer_bank_name: e.target.value }))}
                      className="w-full rounded-lg border px-4 py-2 bg-background"
                    />
                  </FormField>
                  <FormField label="Bank Account" error={errors.organizer_bank_account}>
                    <input
                      value={formData.organizer_bank_account}
                      onChange={(e) => setFormData((prev) => ({ ...prev, organizer_bank_account: e.target.value }))}
                      className="w-full rounded-lg border px-4 py-2 bg-background"
                    />
                  </FormField>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Mobile Money Provider" error={errors.organizer_mobile_money_provider}>
                    <select
                      value={formData.organizer_mobile_money_provider}
                      onChange={(e) => setFormData((prev) => ({ ...prev, organizer_mobile_money_provider: e.target.value }))}
                      disabled={formData.organizer_payout_method === 'zengapay'}
                      className="w-full rounded-lg border px-4 py-2 bg-background disabled:opacity-60"
                    >
                      <option value="mtn">MTN</option>
                      <option value="airtel">Airtel</option>
                      <option value="zengapay">ZengaPay</option>
                    </select>
                  </FormField>
                  <FormField label="Mobile Money Number" error={errors.organizer_mobile_money_number}>
                    <input
                      value={formData.organizer_mobile_money_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, organizer_mobile_money_number: e.target.value }))}
                      className="w-full rounded-lg border px-4 py-2 bg-background"
                    />
                  </FormField>
                </div>
              )}

              <FormField label="Organizer Notes" error={errors.organizer_notes}>
                <textarea
                  rows={3}
                  value={formData.organizer_notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, organizer_notes: e.target.value }))}
                  className="w-full rounded-lg border px-4 py-2 bg-background"
                />
              </FormField>
            </>
          )}
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
