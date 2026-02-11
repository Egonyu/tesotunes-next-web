'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { Upload, X, User, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';

interface Role {
  id: string;
  name: string;
  description: string;
}

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
  is_artist: boolean;
  artist_id: string;
  avatar: File | null;
}

export default function CreateUserPage() {
  const router = useRouter();
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
    is_artist: false,
    artist_id: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: roles } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => apiGet<{ data: Role[] }>('/api/admin/roles'),
  });

  const { data: artists } = useQuery({
    queryKey: ['admin', 'artists', 'list'],
    queryFn: () => apiGet<{ data: { id: string; name: string }[] }>('/api/admin/artists?per_page=1000'),
    enabled: formData.is_artist,
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost('/api/admin/users', data, {
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
    data.append('country', formData.country);
    data.append('city', formData.city);
    data.append('bio', formData.bio);
    data.append('role', formData.role);
    data.append('status', formData.status);
    data.append('email_verified', formData.email_verified ? '1' : '0');
    data.append('is_artist', formData.is_artist ? '1' : '0');
    if (formData.is_artist && formData.artist_id) {
      data.append('artist_id', formData.artist_id);
    }
    
    if (formData.avatar) data.append('avatar', formData.avatar);
    
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New User"
        description="Create a new user account"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'New User' },
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
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Uganda"
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
                  <option value="user">User</option>
                  <option value="artist">Artist</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  {roles?.data?.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_artist}
                    onChange={(e) => updateField('is_artist', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Link to Artist Profile</span>
                </label>
              </div>

              {formData.is_artist && (
                <FormField label="Artist Profile" error={errors.artist_id}>
                  <select
                    value={formData.artist_id}
                    onChange={(e) => updateField('artist_id', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select artist or create new</option>
                    {artists?.data?.map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
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
