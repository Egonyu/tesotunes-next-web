'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import { Eye, EyeOff, Upload, X } from 'lucide-react';
import Image from 'next/image';

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

const initialFormData: UserFormData = {
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
};

interface Role {
  id: string;
  name: string;
  label: string;
}

interface Artist {
  id: string;
  name: string;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => apiGet<{ data: any }>(`/api/admin/users/${id}`),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: () => apiGet<{ data: Role[] }>('/api/admin/roles'),
  });

  const { data: artistsData } = useQuery({
    queryKey: ['admin', 'artists-select'],
    queryFn: () => apiGet<{ data: Artist[] }>('/api/admin/artists?select=true'),
  });

  useEffect(() => {
    if (userData?.data) {
      const u = userData.data;
      setFormData({
        name: u.name || '',
        email: u.email || '',
        username: u.username || '',
        password: '',
        password_confirmation: '',
        phone: u.phone || '',
        country: u.country || '',
        city: u.city || '',
        bio: u.bio || '',
        role: u.role || 'user',
        status: u.status || 'active',
        email_verified: !!u.email_verified_at,
        is_artist: u.is_artist || false,
        artist_id: u.artist_id || '',
        avatar: null,
      });
      if (u.avatar_url) {
        setAvatarPreview(u.avatar_url);
      }
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPost(`/api/admin/users/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      router.push(`/admin/users/${id}`);
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('_method', 'PUT');
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('username', formData.username);
    if (formData.password) {
      data.append('password', formData.password);
      data.append('password_confirmation', formData.password_confirmation);
    }
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
    if (formData.avatar) {
      data.append('avatar', formData.avatar);
    }
    
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit User"
        description={`Editing ${formData.name}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: formData.name || 'User', href: `/admin/users/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/admin/users/${id}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Account Information" description="Basic user account details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              name="name"
              value={formData.name}
              onChangeEvent={handleChange}
              error={errors.name}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChangeEvent={handleChange}
              error={errors.email}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Username"
              name="username"
              value={formData.username}
              onChangeEvent={handleChange}
              error={errors.username}
              placeholder="unique_username"
              required
            />
            <FormField
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChangeEvent={handleChange}
              error={errors.phone}
              placeholder="+1 234 567 8900"
            />
          </div>
        </FormSection>

        <FormSection title="Change Password" description="Leave blank to keep current password">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FormField
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChangeEvent={handleChange}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FormField
              label="Confirm Password"
              name="password_confirmation"
              type={showPassword ? 'text' : 'password'}
              value={formData.password_confirmation}
              onChangeEvent={handleChange}
              error={errors.password_confirmation}
            />
          </div>
        </FormSection>

        <FormSection title="Profile" description="User profile information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Country"
              name="country"
              value={formData.country}
              onChangeEvent={handleChange}
              error={errors.country}
            />
            <FormField
              label="City"
              name="city"
              value={formData.city}
              onChangeEvent={handleChange}
              error={errors.city}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="User bio..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <div className="flex items-start gap-4">
              {avatarPreview && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview(null);
                      setFormData(prev => ({ ...prev, avatar: null }));
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted">
                <Upload className="h-4 w-4" />
                <span>Choose Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </FormSection>

        <FormSection title="Role & Status" description="User permissions and account status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="user">User</option>
                <option value="artist">Artist</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="email_verified"
                checked={formData.email_verified}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Email Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_artist"
                checked={formData.is_artist}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Is Artist</span>
            </label>
          </div>

          {formData.is_artist && (
            <div>
              <label className="block text-sm font-medium mb-2">Link to Artist Profile</label>
              <select
                name="artist_id"
                value={formData.artist_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select artist...</option>
                {artistsData?.data?.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </FormSection>

        <FormActions
          cancelHref={`/admin/users/${id}`}
          isLoading={updateMutation.isPending}
          submitLabel="Update User"
        />
      </form>
    </div>
  );
}
