'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { normalizeCountryCode } from '@/lib/country';
import { Upload, X, User, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';

interface Role {
  id: string;
  name: string;
}

const ALLOWED_ADMIN_USER_ROLES = ['user', 'artist', 'moderator', 'admin'] as const;

interface UserFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  phone: string;
  country: string;
  city: string;
  bio: string;
  role: string;
  status: string;
  email_verified: boolean;
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
  avatar: File | null;
}

export default function CreateUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizerMode = searchParams.get('mode') === 'organizer';
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    password_confirmation: '',
    phone: '',
    country: '',
    city: '',
    bio: '',
    role: 'user',
    status: 'active',
    email_verified: false,
    is_event_organizer: organizerMode,
    organizer_business_name: '',
    organizer_support_email: '',
    organizer_support_phone: '',
    organizer_notes: '',
    organizer_payout_method: 'mobile_money',
    organizer_mobile_money_provider: 'mtn',
    organizer_mobile_money_number: '',
    organizer_bank_name: '',
    organizer_bank_account: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: roles } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => apiGet<{ data: Role[] }>('/admin/roles'),
  });

  const roleOptions = (roles?.data ?? [])
    .map((role) => role.name)
    .filter((role, index, arr) => arr.indexOf(role) === index)
    .filter((role): role is (typeof ALLOWED_ADMIN_USER_ROLES)[number] =>
      (ALLOWED_ADMIN_USER_ROLES as readonly string[]).includes(role)
    );

  const resolvedRoleOptions = roleOptions.length > 0
    ? roleOptions
    : [...ALLOWED_ADMIN_USER_ROLES];

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost('/admin/users', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      router.push('/admin/users');
    },
    onError: (error: { response?: { data?: { errors?: Record<string, string[]> } } }) => {
      if (error.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          newErrors[key] = messages[0];
        });
        setErrors(newErrors);
      }
    },
  });

  const updateField = (field: keyof UserFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name' && typeof value === 'string' && !formData.username) {
      setFormData(prev => ({
        ...prev,
        username: value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''),
      }));
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('username', formData.username);
    data.append('password', formData.password);
    data.append('password_confirmation', formData.password_confirmation);
    data.append('phone', formData.phone);
    const normalizedCountry = normalizeCountryCode(formData.country);
    data.append('country', normalizedCountry);
    data.append('city', formData.city);
    data.append('bio', formData.bio);
    data.append('role', formData.role);
    data.append('status', formData.status);
    data.append('email_verified', formData.email_verified ? '1' : '0');
    data.append('is_event_organizer', formData.is_event_organizer ? '1' : '0');
    if (formData.is_event_organizer) {
      data.append('organizer_business_name', formData.organizer_business_name);
      data.append('organizer_support_email', formData.organizer_support_email);
      data.append('organizer_support_phone', formData.organizer_support_phone);
      data.append('organizer_notes', formData.organizer_notes);
      data.append('organizer_payout_method', formData.organizer_payout_method);
      data.append('organizer_mobile_money_provider', formData.organizer_mobile_money_provider);
      data.append('organizer_mobile_money_number', formData.organizer_mobile_money_number);
      data.append('organizer_bank_name', formData.organizer_bank_name);
      data.append('organizer_bank_account', formData.organizer_bank_account);
    }

    if (formData.avatar) data.append('avatar', formData.avatar);

    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={organizerMode ? 'Add Organizer' : 'Add New User'}
        description={organizerMode ? 'Create an event organizer-ready account' : 'Create a new user account'}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: organizerMode ? 'New Organizer' : 'New User' },
        ]}
        backHref="/admin/users"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Account Information">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Full Name"
                  required
                  error={errors.name}
                  className="col-span-2"
                >
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </FormField>

                <FormField label="Username" required error={errors.username}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => updateField('username', e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                      placeholder="username"
                    />
                  </div>
                </FormField>

                <FormField label="Email" required error={errors.email}>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="user@example.com"
                  />
                </FormField>

                <FormField label="Phone" error={errors.phone}>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="+256 700 000 000"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Password">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Password" required error={errors.password}>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="w-full px-4 py-2 pr-10 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormField>

                <FormField label="Confirm Password" required error={errors.password_confirmation}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={(e) => updateField('password_confirmation', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Location">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Country" error={errors.country}>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    onBlur={(e) => updateField('country', normalizeCountryCode(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="UG or Uganda"
                  />
                </FormField>
                <FormField label="City" error={errors.city}>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Kampala"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Event Organizer Setup" description="Prepare this account for event ownership, payouts, and organizer support flows">
              <div className="flex items-center gap-2">
                <input
                  id="is_event_organizer"
                  type="checkbox"
                  checked={formData.is_event_organizer}
                  onChange={(e) => updateField('is_event_organizer', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="is_event_organizer" className="text-sm font-medium">
                  This user will manage events as an organizer
                </label>
              </div>

              {formData.is_event_organizer && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Business / Organizer Name" error={errors.organizer_business_name}>
                      <input
                        type="text"
                        value={formData.organizer_business_name}
                        onChange={(e) => updateField('organizer_business_name', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        placeholder="Tesotunes Live UG"
                      />
                    </FormField>

                    <FormField label="Support Email" error={errors.organizer_support_email}>
                      <input
                        type="email"
                        value={formData.organizer_support_email}
                        onChange={(e) => updateField('organizer_support_email', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        placeholder="events@example.com"
                      />
                    </FormField>

                    <FormField label="Support Phone" error={errors.organizer_support_phone}>
                      <input
                        type="tel"
                        value={formData.organizer_support_phone}
                        onChange={(e) => updateField('organizer_support_phone', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        placeholder="+256 700 000 000"
                      />
                    </FormField>

                    <FormField label="Payout Method" error={errors.organizer_payout_method}>
                      <select
                        value={formData.organizer_payout_method}
                        onChange={(e) => updateField('organizer_payout_method', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                      >
                        <option value="mobile_money">Mobile Money</option>
                        <option value="zengapay">ZengaPay</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </FormField>
                  </div>

                  {formData.organizer_payout_method === 'bank' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Bank Name" error={errors.organizer_bank_name}>
                        <input
                          type="text"
                          value={formData.organizer_bank_name}
                          onChange={(e) => updateField('organizer_bank_name', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        />
                      </FormField>
                      <FormField label="Bank Account" error={errors.organizer_bank_account}>
                        <input
                          type="text"
                          value={formData.organizer_bank_account}
                          onChange={(e) => updateField('organizer_bank_account', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        />
                      </FormField>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Mobile Money Provider" error={errors.organizer_mobile_money_provider}>
                        <select
                          value={formData.organizer_mobile_money_provider}
                          onChange={(e) => updateField('organizer_mobile_money_provider', e.target.value)}
                          disabled={formData.organizer_payout_method === 'zengapay'}
                          className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary disabled:opacity-60"
                        >
                          <option value="mtn">MTN</option>
                          <option value="airtel">Airtel</option>
                          <option value="zengapay">ZengaPay</option>
                        </select>
                      </FormField>
                      <FormField label="Mobile Money Number" error={errors.organizer_mobile_money_number}>
                        <input
                          type="tel"
                          value={formData.organizer_mobile_money_number}
                          onChange={(e) => updateField('organizer_mobile_money_number', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                          placeholder="+256 700 000 000"
                        />
                      </FormField>
                    </div>
                  )}

                  <FormField label="Organizer Notes" error={errors.organizer_notes}>
                    <textarea
                      rows={3}
                      value={formData.organizer_notes}
                      onChange={(e) => updateField('organizer_notes', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                      placeholder="Optional internal notes about this organizer account"
                    />
                  </FormField>
                </>
              )}
            </FormSection>

            <FormSection title="Bio">
              <FormField label="About" error={errors.bio}>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Tell us about this user..."
                />
              </FormField>
            </FormSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FormSection title="Avatar">
              <div className="border-2 border-dashed rounded-xl overflow-hidden aspect-square">
                {avatarPreview ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, avatar: null }));
                          setAvatarPreview(null);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer p-6">
                    <User className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Upload avatar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 200x200px
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </FormSection>

            <FormSection title="Role & Permissions">
              <FormField label="Role" required error={errors.role}>
                <select
                  value={formData.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  {resolvedRoleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </FormField>
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Selecting the `artist` role already creates the linked artist account automatically. Manual `artist_id` linking has been removed from this admin user flow.
              </div>
            </FormSection>

            <FormSection title="Status">
              <FormField label="Account Status" error={errors.status}>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </FormField>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.email_verified}
                    onChange={(e) => updateField('email_verified', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Email Verified</span>
                </label>
              </div>
            </FormSection>
          </div>
        </div>

        <FormActions
          cancelHref="/admin/users"
          isSubmitting={createMutation.isPending}
          submitLabel="Create User"
        />
      </form>
    </div>
  );
}
