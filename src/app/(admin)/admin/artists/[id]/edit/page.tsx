'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPostForm, apiPut } from '@/lib/api';
import { Upload, X, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types — aligned with AdminArtistsController::show() response
// ---------------------------------------------------------------------------

interface Genre {
  id: number;
  name: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
}

interface Artist {
  id: number;
  uuid: string;
  user_id: number | null;
  name: string; // stage_name on backend
  slug: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  profile_url: string | null;
  website: string | null;
  website_url: string | null;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  is_trusted: boolean;
  primary_genre_id: number | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  genres: { id: string; name: string }[];
  user?: UserData | null;
}

// ---------------------------------------------------------------------------
// Form state types
// ---------------------------------------------------------------------------

interface ArtistFormData {
  name: string;
  slug: string;
  bio: string;
  genre_ids: string[];
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
}

interface UserFormData {
  name: string;
  email: string;
  username: string;
  phone: string;
  new_password: string;
  new_password_confirmation: string;
}

// ---------------------------------------------------------------------------
// Error extraction helper
// ---------------------------------------------------------------------------

type ApiError = {
  response?: {
    data?: {
      errors?: Record<string, string[]>;
      message?: string;
    };
    status?: number;
  };
  message?: string;
};

function extractErrors(error: unknown): {
  fieldErrors: Record<string, string>;
  message: string;
} {
  const axiosError = error as ApiError;
  const fieldErrors: Record<string, string> = {};
  if (axiosError.response?.data?.errors) {
    for (const [key, messages] of Object.entries(
      axiosError.response.data.errors,
    )) {
      fieldErrors[key] = messages[0];
    }
  }
  const status = axiosError.response?.status;
  const message =
    axiosError.response?.data?.message ||
    axiosError.message ||
    (status === 401
      ? 'Unauthorized — please log in again'
      : status === 403
        ? 'Forbidden — insufficient permissions'
        : status === 422
          ? 'Validation failed — check the fields below'
          : 'An unexpected error occurred');
  return { fieldErrors, message };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  // ---- Artist form state ----
  const [formData, setFormData] = useState<ArtistFormData>({
    name: '',
    slug: '',
    bio: '',
    genre_ids: [],
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
  });
  // File uploads are kept in SEPARATE state to avoid serialization issues
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---- User account form state ----
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    username: '',
    phone: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // ---- Queries ----
  const {
    data: artistResponse,
    isLoading: artistLoading,
    isError: artistError,
    error: artistFetchError,
  } = useQuery({
    queryKey: ['admin', 'artist', id],
    queryFn: () => apiGet<{ data: Artist }>(`/admin/artists/${id}`),
  });
  const artist = artistResponse?.data;

  const { data: genresResponse } = useQuery({
    queryKey: ['genres', 'list'],
    queryFn: () => apiGet<{ data: Genre[] }>('/genres'),
  });

  // ---- Populate form when artist data loads ----
  useEffect(() => {
    if (!artist) return;
    setFormData({
      name: artist.name || '',
      slug: artist.slug || '',
      bio: artist.bio || '',
      genre_ids: artist.genres?.map((g) => String(g.id)) || [],
      website: artist.website || artist.website_url || '',
      spotify_url: artist.spotify_url || '',
      apple_music_url: artist.apple_music_url || '',
      youtube_url: artist.youtube_url || '',
      instagram_url: artist.instagram_url || '',
      twitter_url: artist.twitter_url || '',
      facebook_url: artist.facebook_url || '',
      tiktok_url: artist.tiktok_url || '',
      status: artist.status || 'active',
      is_verified: !!artist.is_verified,
    });
    setProfileFile(null);
    setCoverFile(null);
    if (artist.profile_url || artist.avatar_url) {
      setProfilePreview(artist.profile_url || artist.avatar_url || null);
    } else {
      setProfilePreview(null);
    }
    if (artist.cover_url) {
      setCoverPreview(artist.cover_url);
    } else {
      setCoverPreview(null);
    }
    if (artist.user) {
      setUserFormData({
        name: artist.user.name || '',
        email: artist.user.email || '',
        username: artist.user.username || '',
        phone: artist.user.phone || '',
        new_password: '',
        new_password_confirmation: '',
      });
    }
  }, [artist]);

  // ===========================================================================
  // ARTIST UPDATE MUTATION
  // Route: POST /admin/artists/{id}  (AdminArtistsController::update)
  // Backend field map:
  //   name       -> stage_name
  //   website    -> website_url
  //   *_url      -> social_links.*
  //   genre_ids  -> primary_genre_id (first element)
  //
  // When files are selected, sends multipart/form-data via apiPostForm.
  // Otherwise, sends JSON via apiPost.
  // ===========================================================================
  const updateArtistMutation = useMutation({
    mutationFn: async (fd: ArtistFormData) => {
      const formData = new FormData();
      formData.append('name', fd.name);
      formData.append('slug', fd.slug);
      formData.append('status', fd.status);
      formData.append('is_verified', fd.is_verified ? '1' : '0');

      if (fd.bio.trim()) {
        formData.append('bio', fd.bio.trim());
      }

      if (fd.website.trim()) {
        formData.append('website', fd.website.trim());
      }

      const socialFields = [
        'spotify_url',
        'apple_music_url',
        'youtube_url',
        'instagram_url',
        'twitter_url',
        'facebook_url',
        'tiktok_url',
      ] as const;

      for (const key of socialFields) {
        const value = fd[key].trim();
        if (value) {
          formData.append(key, value);
        }
      }

      fd.genre_ids.forEach((genreId, index) => {
        formData.append(`genre_ids[${index}]`, String(genreId));
      });

      if (profileFile instanceof File) {
        formData.append('profile_image', profileFile);
      }

      if (coverFile instanceof File) {
        formData.append('cover_image', coverFile);
      }

      return apiPostForm<{ success: boolean; message: string; data?: Artist }>(
        `/admin/artists/${id}`,
        formData,
      );
    },
    onSuccess: (response) => {
      toast.success(response?.message || 'Artist updated successfully');
      setProfileFile(null);
      setCoverFile(null);

      // If the backend returned the updated artist data, populate the query
      // cache immediately so the show page (and this page) reflect changes
      // without waiting for a background refetch.
      if (response?.data) {
        queryClient.setQueryData(['admin', 'artist', id], { data: response.data });

        // Also update image previews immediately from the fresh URLs
        const d = response.data;
        if (d.profile_url || d.avatar_url) {
          setProfilePreview(d.profile_url || d.avatar_url || null);
        }
        if (d.cover_url) {
          setCoverPreview(d.cover_url);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: (error: unknown) => {
      const { fieldErrors, message } = extractErrors(error);
      setErrors(fieldErrors);
      // Show field-specific errors in toast if present so user sees exactly
      // which fields failed validation (e.g., "website: not a valid URL")
      const fieldSummary = Object.entries(fieldErrors)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      toast.error(fieldSummary || message);
    },
  });

  // ===========================================================================
  // USER ACCOUNT UPDATE MUTATION
  // Route: PUT /admin/users/{userId}  (AdminUsersController::update)
  // Accepts: name, email, username, phone, password, password_confirmation
  // ===========================================================================
  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const userId = artist?.user_id || artist?.user?.id;
      if (!userId) throw new Error('No linked user account found');

      const payload: Record<string, string> = {
        name: data.name,
        email: data.email,
        username: data.username,
        phone: data.phone,
      };
      if (data.new_password) {
        payload.password = data.new_password;
        payload.password_confirmation = data.new_password_confirmation;
      }
      return apiPut<{ success: boolean; message: string }>(
        `/admin/users/${userId}`,
        payload,
      );
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      toast.success(
        (response as { message?: string })?.message ||
          'User account updated successfully',
      );
      setUserFormData((prev) => ({
        ...prev,
        new_password: '',
        new_password_confirmation: '',
      }));
      setUserErrors({});
    },
    onError: (error: unknown) => {
      const { fieldErrors, message } = extractErrors(error);
      setUserErrors(fieldErrors);
      toast.error(message);
    },
  });

  // ---- Field update helpers ----
  const updateField = (field: keyof ArtistFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateUserField = (field: keyof UserFormData, value: string) => {
    setUserFormData((prev) => ({ ...prev, [field]: value }));
    if (userErrors[field]) {
      setUserErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = () => setProfilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ---- Submit handlers ----
  const handleArtistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Artist name is required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    updateArtistMutation.mutate(formData);
  };

  const handleUserSave = () => {
    const errs: Record<string, string> = {};
    if (!userFormData.email.trim()) errs.email = 'Email is required';
    if (userFormData.new_password && userFormData.new_password.length < 8) {
      errs.new_password = 'Password must be at least 8 characters';
    }
    if (
      userFormData.new_password &&
      userFormData.new_password !== userFormData.new_password_confirmation
    ) {
      errs.new_password_confirmation = 'Passwords do not match';
    }
    if (Object.keys(errs).length > 0) {
      setUserErrors(errs);
      return;
    }
    setUserErrors({});
    updateUserMutation.mutate(userFormData);
  };

  // ---- Loading / error states ----
  if (artistLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artist || artistError) {
    const errMsg = artistError
      ? (artistFetchError as { message?: string })?.message ||
        'Could not load artist data'
      : 'Artist not found';
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">{errMsg}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Check that you are logged in and the artist ID is valid.
        </p>
        <Link
          href="/admin/artists"
          className="text-primary hover:underline mt-2 inline-block"
        >
          Back to artists
        </Link>
      </div>
    );
  }

  // ===========================================================================
  // RENDER
  // ===========================================================================
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${artist.name}`}
        description="Update artist profile and linked user account"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Artists', href: '/admin/artists' },
          { label: artist.name, href: `/admin/artists/${id}` },
          { label: 'Edit' },
        ]}
        backHref={`/admin/artists/${id}`}
      />

      {/* ================================================================ */}
      {/* ARTIST PROFILE FORM — POST /admin/artists/{id}                   */}
      {/* ================================================================ */}
      <form onSubmit={handleArtistSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---- Main content ---- */}
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Basic Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Artist / Stage Name"
                  required
                  error={errors.name}
                  className="sm:col-span-2"
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

              <FormField label="Bio" error={errors.bio}>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                  rows={5}
                  placeholder="Full artist biography..."
                />
              </FormField>
            </FormSection>

            <FormSection title="Social Links">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    {
                      key: 'spotify_url' as const,
                      label: 'Spotify',
                      placeholder: 'https://open.spotify.com/artist/...',
                    },
                    {
                      key: 'apple_music_url' as const,
                      label: 'Apple Music',
                      placeholder: 'https://music.apple.com/artist/...',
                    },
                    {
                      key: 'youtube_url' as const,
                      label: 'YouTube',
                      placeholder: 'https://youtube.com/@artist',
                    },
                    {
                      key: 'instagram_url' as const,
                      label: 'Instagram',
                      placeholder: 'https://instagram.com/artist',
                    },
                    {
                      key: 'twitter_url' as const,
                      label: 'Twitter / X',
                      placeholder: 'https://twitter.com/artist',
                    },
                    {
                      key: 'facebook_url' as const,
                      label: 'Facebook',
                      placeholder: 'https://facebook.com/artist',
                    },
                    {
                      key: 'tiktok_url' as const,
                      label: 'TikTok',
                      placeholder: 'https://tiktok.com/@artist',
                    },
                  ] as const
                ).map(({ key, label, placeholder }) => (
                  <FormField key={key} label={label} error={errors[key]}>
                    <input
                      type="url"
                      value={formData[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                      placeholder={placeholder}
                    />
                  </FormField>
                ))}
              </div>
            </FormSection>
          </div>

          {/* ---- Sidebar ---- */}
          <div className="space-y-6">
            {/* Profile Image */}
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
                          setProfileFile(null);
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

            {/* Cover Image */}
            <FormSection title="Cover Image">
              <div className="border-2 border-dashed rounded-xl overflow-hidden aspect-video">
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
                          setCoverFile(null);
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

            {/* Genres */}
            <FormSection title="Genres">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {genresResponse?.data?.map((genre) => (
                  <label key={genre.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.genre_ids.includes(String(genre.id))}
                      onChange={(e) => {
                        const gid = String(genre.id);
                        updateField(
                          'genre_ids',
                          e.target.checked
                            ? [...formData.genre_ids, gid]
                            : formData.genre_ids.filter((x) => x !== gid),
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{genre.name}</span>
                  </label>
                ))}
                {(!genresResponse?.data ||
                  genresResponse.data.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    Loading genres...
                  </p>
                )}
              </div>
            </FormSection>

            {/* Status & Visibility */}
            <FormSection title="Status & Visibility">
              <FormField label="Status" error={errors.status}>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
              </FormField>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => updateField('is_verified', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Verified Artist</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Featured status is managed via the artist detail page toggle.
              </p>
            </FormSection>
          </div>
        </div>

        <FormActions
          cancelHref={`/admin/artists/${id}`}
          isSubmitting={updateArtistMutation.isPending}
          submitLabel="Save Artist Profile"
        />
      </form>

      {/* ================================================================ */}
      {/* USER ACCOUNT FORM — PUT /admin/users/{userId}                    */}
      {/* Separate section since it hits a different API endpoint           */}
      {/* ================================================================ */}
      <div className="border-t pt-6">
        <FormSection title="Linked User Account">
          {artist.user || artist.user_id ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Edit the linked user account. Password fields are optional —
                leave blank to keep the current password.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Change Password</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="New Password"
                    error={userErrors.new_password}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userFormData.new_password}
                        onChange={(e) =>
                          updateUserField('new_password', e.target.value)
                        }
                        className="w-full pl-10 pr-10 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        placeholder="Leave blank to keep current"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormField>

                  <FormField
                    label="Confirm Password"
                    error={userErrors.new_password_confirmation}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userFormData.new_password_confirmation}
                        onChange={(e) =>
                          updateUserField(
                            'new_password_confirmation',
                            e.target.value,
                          )
                        }
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUserSave}
                disabled={updateUserMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save User Account'
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No linked user account found for this artist.
              </p>
            </div>
          )}
        </FormSection>
      </div>
    </div>
  );
}
