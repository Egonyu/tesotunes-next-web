'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiPostForm } from '@/lib/api';
import { Upload, X, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import { toast } from 'sonner';

interface Genre {
  id: string;
  name: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  status: string;
}

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string;
  short_bio: string;
  country: string;
  city: string;
  website: string;
  spotify_url: string;
  apple_music_url: string;
  youtube_url: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  tiktok_url: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  profile_url: string;
  cover_url: string;
  genres: { id: string; name: string }[];
  meta_title: string;
  meta_description: string;
  user_id?: number;
  user?: UserProfile;
}

interface ArtistFormData {
  name: string;
  slug: string;
  bio: string;
  short_bio: string;
  genre_ids: string[];
  country: string;
  city: string;
  website: string;
  spotify_url: string;
  apple_music_url: string;
  youtube_url: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  tiktok_url: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  profile_image: File | null;
  cover_image: File | null;
  meta_title: string;
  meta_description: string;
}

interface UserFormData {
  email: string;
  username: string;
  phone: string;
  name: string;
  new_password: string;
  new_password_confirmation: string;
}

export default function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ArtistFormData>({
    name: '',
    slug: '',
    bio: '',
    short_bio: '',
    genre_ids: [],
    country: '',
    city: '',
    website: '',
    spotify_url: '',
    apple_music_url: '',
    youtube_url: '',
    instagram_url: '',
    twitter_url: '',
    facebook_url: '',
    tiktok_url: '',
    status: 'active',
    is_verified: false,
    is_featured: false,
    profile_image: null,
    cover_image: null,
    meta_title: '',
    meta_description: '',
  });
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: '',
    username: '',
    phone: '',
    name: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});

  const { data: artist, isLoading: artistLoading } = useQuery({
    queryKey: ['admin', 'artist', id],
    queryFn: () => apiGet<{ data: Artist }>(`/api/admin/artists/${id}`),
  });

  const { data: genres } = useQuery({
    queryKey: ['admin', 'genres', 'list'],
    queryFn: () => apiGet<{ data: Genre[] }>('/api/admin/genres'),
  });

  // Populate form when artist data loads
  useEffect(() => {
    if (artist?.data) {
      const a = artist.data;
      setFormData({
        name: a.name || '',
        slug: a.slug || '',
        bio: a.bio || '',
        short_bio: a.short_bio || '',
        genre_ids: a.genres?.map(g => g.id) || [],
        country: a.country || '',
        city: a.city || '',
        website: a.website || '',
        spotify_url: a.spotify_url || '',
        apple_music_url: a.apple_music_url || '',
        youtube_url: a.youtube_url || '',
        instagram_url: a.instagram_url || '',
        twitter_url: a.twitter_url || '',
        facebook_url: a.facebook_url || '',
        tiktok_url: a.tiktok_url || '',
        status: a.status || 'active',
        is_verified: !!a.is_verified,
        is_featured: !!a.is_featured,
        profile_image: null,
        cover_image: null,
        meta_title: a.meta_title || '',
        meta_description: a.meta_description || '',
      });
      if (a.profile_url) setProfilePreview(a.profile_url);
      if (a.cover_url) setCoverPreview(a.cover_url);

      // Populate user profile data if available
      if (a.user) {
        setUserFormData({
          email: a.user.email || '',
          username: a.user.username || '',
          phone: a.user.phone || '',
          name: a.user.name || '',
          new_password: '',
          new_password_confirmation: '',
        });
      }
    }
  }, [artist]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiPostForm(`/api/admin/artists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
      router.push(`/admin/artists/${id}`);
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

  const userUpdateMutation = useMutation({
    mutationFn: async (data: Partial<UserFormData>) => {
      const userId = artist?.data?.user_id || artist?.data?.user?.id;
      if (!userId) throw new Error('No linked user account found');
      
      // Build payload — only include password fields if a new password was entered
      const payload: Record<string, string> = {
        name: data.name || '',
        email: data.email || '',
        username: data.username || '',
        phone: data.phone || '',
      };
      if (data.new_password) {
        payload.password = data.new_password;
        payload.password_confirmation = data.new_password_confirmation || '';
      }
      return apiPut(`/api/admin/users/${userId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      toast.success('User account updated successfully');
      setUserFormData(prev => ({ ...prev, new_password: '', new_password_confirmation: '' }));
      setUserErrors({});
    },
    onError: (error: { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }) => {
      if (error.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          newErrors[key] = messages[0];
        });
        setUserErrors(newErrors);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update user account');
      }
    },
  });

  const handleUserProfileSave = () => {
    // Client-side validation
    const errs: Record<string, string> = {};
    if (!userFormData.email) errs.email = 'Email is required';
    if (userFormData.new_password && userFormData.new_password.length < 8) {
      errs.new_password = 'Password must be at least 8 characters';
    }
    if (userFormData.new_password && userFormData.new_password !== userFormData.new_password_confirmation) {
      errs.new_password_confirmation = 'Passwords do not match';
    }
    if (Object.keys(errs).length > 0) {
      setUserErrors(errs);
      return;
    }
    userUpdateMutation.mutate(userFormData);
  };

  const updateUserField = (field: keyof UserFormData, value: string) => {
    setUserFormData(prev => ({ ...prev, [field]: value }));
    setUserErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateField = (field: keyof ArtistFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_image: file }));
      const reader = new FileReader();
      reader.onload = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, cover_image: file }));
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('_method', 'PUT');
    data.append('name', formData.name);
    data.append('slug', formData.slug);
    data.append('bio', formData.bio);
    data.append('short_bio', formData.short_bio);
    data.append('country', formData.country);
    data.append('city', formData.city);
    data.append('website', formData.website);
    data.append('spotify_url', formData.spotify_url);
    data.append('apple_music_url', formData.apple_music_url);
    data.append('youtube_url', formData.youtube_url);
    data.append('instagram_url', formData.instagram_url);
    data.append('twitter_url', formData.twitter_url);
    data.append('facebook_url', formData.facebook_url);
    data.append('tiktok_url', formData.tiktok_url);
    data.append('status', formData.status);
    data.append('is_verified', formData.is_verified ? '1' : '0');
    data.append('is_featured', formData.is_featured ? '1' : '0');
    data.append('meta_title', formData.meta_title);
    data.append('meta_description', formData.meta_description);
    
    formData.genre_ids.forEach(gid => data.append('genre_ids[]', gid));
    
    if (formData.profile_image) data.append('profile_image', formData.profile_image);
    if (formData.cover_image) data.append('cover_image', formData.cover_image);
    
    updateMutation.mutate(data);
  };

  if (artistLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artist?.data) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Artist not found</h2>
        <Link href="/admin/artists" className="text-primary hover:underline mt-2 inline-block">
          Back to artists
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${artist.data.name}`}
        description="Update artist profile"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Artists', href: '/admin/artists' },
          { label: artist.data.name, href: `/admin/artists/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/admin/artists/${id}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Artist Name"
                  required
                  error={errors.name}
                  className="col-span-2"
                >
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="Enter artist name"
                  />
                </FormField>

                <FormField label="Slug" error={errors.slug}>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="artist-url-slug"
                  />
                </FormField>

                <FormField label="Website" error={errors.website}>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://artistwebsite.com"
                  />
                </FormField>
              </div>

              <FormField label="Short Bio" error={errors.short_bio}>
                <input
                  type="text"
                  value={formData.short_bio}
                  onChange={(e) => updateField('short_bio', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  placeholder="One-line description (max 160 chars)"
                  maxLength={160}
                />
              </FormField>

              <FormField label="Full Bio" error={errors.bio}>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={6}
                  placeholder="Full artist biography..."
                />
              </FormField>
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

            <FormSection title="Social Links">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Spotify" error={errors.spotify_url}>
                  <input
                    type="url"
                    value={formData.spotify_url}
                    onChange={(e) => updateField('spotify_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </FormField>
                <FormField label="Apple Music" error={errors.apple_music_url}>
                  <input
                    type="url"
                    value={formData.apple_music_url}
                    onChange={(e) => updateField('apple_music_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://music.apple.com/artist/..."
                  />
                </FormField>
                <FormField label="YouTube" error={errors.youtube_url}>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => updateField('youtube_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://youtube.com/@artist"
                  />
                </FormField>
                <FormField label="Instagram" error={errors.instagram_url}>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => updateField('instagram_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://instagram.com/artist"
                  />
                </FormField>
                <FormField label="Twitter/X" error={errors.twitter_url}>
                  <input
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => updateField('twitter_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://twitter.com/artist"
                  />
                </FormField>
                <FormField label="Facebook" error={errors.facebook_url}>
                  <input
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => updateField('facebook_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://facebook.com/artist"
                  />
                </FormField>
                <FormField label="TikTok" error={errors.tiktok_url} className="col-span-2">
                  <input
                    type="url"
                    value={formData.tiktok_url}
                    onChange={(e) => updateField('tiktok_url', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                    placeholder="https://tiktok.com/@artist"
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="SEO">
              <FormField label="Meta Title" error={errors.meta_title}>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => updateField('meta_title', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  placeholder="SEO title"
                />
              </FormField>
              <FormField label="Meta Description" error={errors.meta_description}>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => updateField('meta_description', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="SEO description"
                />
              </FormField>
            </FormSection>

            {/* User Account Section */}
            <FormSection title="User Account">
              {(artist?.data?.user || artist?.data?.user_id) ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Edit the linked user account details. Password fields are optional — leave blank to keep the current password.
                  </p>

                  <FormField label="Display Name" error={userErrors.name}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={userFormData.name}
                        onChange={(e) => updateUserField('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        placeholder="User display name"
                      />
                    </div>
                  </FormField>

                  <FormField label="Email Address" error={userErrors.email}>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => updateUserField('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        placeholder="user@example.com"
                      />
                    </div>
                  </FormField>

                  <FormField label="Username" error={userErrors.username}>
                    <input
                      type="text"
                      value={userFormData.username}
                      onChange={(e) => updateUserField('username', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                      placeholder="username"
                    />
                  </FormField>

                  <FormField label="Phone" error={userErrors.phone}>
                    <input
                      type="tel"
                      value={userFormData.phone}
                      onChange={(e) => updateUserField('phone', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                      placeholder="+256..."
                    />
                  </FormField>

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-3">Change Password</p>
                    <div className="space-y-3">
                      <FormField label="New Password" error={userErrors.new_password}>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={userFormData.new_password}
                            onChange={(e) => updateUserField('new_password', e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                            placeholder="Leave blank to keep current"
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

                      <FormField label="Confirm Password" error={userErrors.new_password_confirmation}>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={userFormData.new_password_confirmation}
                            onChange={(e) => updateUserField('new_password_confirmation', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </FormField>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUserProfileSave}
                    disabled={userUpdateMutation.isPending}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {userUpdateMutation.isPending ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save User Account'
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No linked user account found for this artist.
                  </p>
                </div>
              )}
            </FormSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FormSection title="Profile Image">
              <div className="border-2 border-dashed rounded-xl overflow-hidden aspect-square">
                {profilePreview ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={profilePreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="p-2 bg-white text-black rounded-full hover:bg-gray-200 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, profile_image: null }));
                          setProfilePreview(null);
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
                      Upload artist photo
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </FormSection>

            <FormSection title="Cover Image">
              <div className="border-2 border-dashed rounded-xl overflow-hidden aspect-[16/9]">
                {coverPreview ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="p-2 bg-white text-black rounded-full hover:bg-gray-200 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, cover_image: null }));
                          setCoverPreview(null);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer p-6">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Upload cover image
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </FormSection>

            <FormSection title="Genres">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {genres?.data?.map(genre => (
                  <label key={genre.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.genre_ids.includes(genre.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField('genre_ids', [...formData.genre_ids, genre.id]);
                        } else {
                          updateField('genre_ids', formData.genre_ids.filter(gid => gid !== genre.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{genre.name}</span>
                  </label>
                ))}
              </div>
            </FormSection>

            <FormSection title="Status & Visibility">
              <FormField label="Status" error={errors.status}>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </FormField>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => updateField('is_verified', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Verified Artist</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => updateField('is_featured', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Featured Artist</span>
                </label>
              </div>
            </FormSection>
          </div>
        </div>

        <FormActions
          cancelHref={`/admin/artists/${id}`}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save Changes"
        />
      </form>
    </div>
  );
}
