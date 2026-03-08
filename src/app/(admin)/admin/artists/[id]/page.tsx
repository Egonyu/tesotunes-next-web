'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';
import { CheckCircle, Edit, ExternalLink, Eye, Globe, MapPin, Music, Trash2, User, Users, XCircle } from 'lucide-react';
import { toast } from 'sonner';

type Artist = {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  profile_url: string | null;
  cover_url: string | null;
  website: string | null;
  total_plays: number;
  total_songs: number;
  total_albums: number;
  followers: number;
  genres: Array<{ id: string; name: string }>;
  user?: {
    id: number;
    name: string;
    email: string;
    username: string;
    phone: string;
  } | null;
  created_at: string;
  updated_at: string;
};

type ArtistSong = {
  id: number;
  title: string;
  status?: string;
  is_featured?: boolean;
  play_count?: number;
  like_count?: number;
  download_count?: number;
  release_date?: string | null;
  created_at?: string;
};

function compactNumber(value: number | null | undefined): string {
  if (!value) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'artist', id],
    queryFn: () => apiGet<{ data: Artist }>(`/admin/artists/${id}`),
  });

  const { data: songsRes, isLoading: songsLoading } = useQuery({
    queryKey: ['admin', 'artist', id, 'songs'],
    queryFn: () => apiGet<{ data: ArtistSong[]; meta?: { total?: number } }>(`/admin/songs?artist_id=${id}&per_page=20&sort=-created_at`),
  });

  const artist = data?.data;
  const artistSongs = songsRes?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete<{ message?: string }>(`/admin/artists/${id}`),
    onSuccess: () => {
      toast.success('Artist deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
      router.push('/admin/artists');
    },
    onError: () => toast.error('Failed to delete artist'),
  });

  const toggleVerifyMutation = useMutation({
    mutationFn: () => apiPost<{ message?: string }>(`/admin/artists/${id}/toggle-verify`),
    onSuccess: () => {
      toast.success('Verification status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: () => toast.error('Failed to update verification status'),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: () => apiPost<{ message?: string }>(`/admin/artists/${id}/toggle-featured`),
    onSuccess: () => {
      toast.success('Featured status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: () => toast.error('Failed to update featured status'),
  });

  const approveSongMutation = useMutation({
    mutationFn: (songId: number) => apiPost(`/admin/songs/${songId}/approve`),
    onSuccess: () => {
      toast.success('Song approved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id, 'songs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to approve song'),
  });

  const rejectSongMutation = useMutation({
    mutationFn: (songId: number) => apiPost(`/admin/songs/${songId}/reject`, { reason: 'Rejected by admin' }),
    onSuccess: () => {
      toast.success('Song rejected');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id, 'songs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to reject song'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 rounded bg-muted animate-pulse" />
        <div className="h-72 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="py-12 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Artist not found</h2>
        <Link href="/admin/artists" className="mt-2 inline-block text-primary hover:underline">
          Back to artists
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={artist.name}
        description="Artist profile"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Artists', href: '/admin/artists' },
          { label: artist.name },
        ]}
        backHref="/admin/artists"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/artists/${artist.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              View Live
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link
              href={`/admin/artists/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Edit Artist
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="relative h-52 md:h-64">
          {artist.cover_url && (
            <Image src={artist.cover_url} alt={`${artist.name} cover`} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white">
              {artist.profile_url && (
                <Image src={artist.profile_url} alt={artist.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 text-white">
              <div className="mb-1 flex items-center gap-2">
                <h2 className="text-2xl font-bold">{artist.name}</h2>
                {artist.is_verified && <CheckCircle className="h-5 w-5 text-blue-400" fill="currentColor" />}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
                {artist.website && (
                  <a href={artist.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
                {artist.genres.length > 0 && <span>{artist.genres.map((g) => g.name).join(', ')}</span>}
              </div>
            </div>
            <StatusBadge status={artist.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Followers</p>
            <p className="text-xl font-semibold">{compactNumber(artist.followers)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Total Plays</p>
            <p className="text-xl font-semibold">{compactNumber(artist.total_plays)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Songs</p>
            <p className="text-xl font-semibold">{compactNumber(artist.total_songs)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Albums</p>
            <p className="text-xl font-semibold">{compactNumber(artist.total_albums)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bio</h3>
            <p className="text-sm leading-6 text-foreground/90">{artist.bio || 'No bio provided.'}</p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Artist Songs</h3>
              <Link
                href={`/admin/songs?artist_id=${artist.id}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Manage all songs <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {songsLoading ? (
              <div className="space-y-2">
                <div className="h-10 rounded bg-muted animate-pulse" />
                <div className="h-10 rounded bg-muted animate-pulse" />
                <div className="h-10 rounded bg-muted animate-pulse" />
              </div>
            ) : artistSongs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No songs found for this artist.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Title</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Stats</th>
                      <th className="px-3 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {artistSongs.map((song) => (
                      <tr key={song.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <div className="font-medium">{song.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {song.release_date || song.created_at?.split('T')[0] || '—'}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={song.status || 'draft'} />
                            {song.is_featured ? <span className="text-xs text-amber-600">Featured</span> : null}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          <div>Plays: {compactNumber(song.play_count)}</div>
                          <div>Likes: {compactNumber(song.like_count)}</div>
                          <div>Downloads: {compactNumber(song.download_count)}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {(song.status === 'pending' || song.status === 'pending_review') && (
                              <>
                                <button
                                  onClick={() => approveSongMutation.mutate(song.id)}
                                  disabled={approveSongMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded border border-green-300 px-2 py-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-3 w-3" /> Approve
                                </button>
                                <button
                                  onClick={() => rejectSongMutation.mutate(song.id)}
                                  disabled={rejectSongMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="h-3 w-3" /> Reject
                                </button>
                              </>
                            )}
                            <Link href={`/admin/songs/${song.id}`} className="inline-flex items-center gap-1 rounded border px-2 py-1 hover:bg-muted">
                              <Eye className="h-3 w-3" /> View
                            </Link>
                            <Link href={`/admin/songs/${song.id}/edit`} className="inline-flex items-center gap-1 rounded border px-2 py-1 hover:bg-muted">
                              <Edit className="h-3 w-3" /> Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => toggleVerifyMutation.mutate()}
                className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {artist.is_verified ? 'Remove verification' : 'Verify artist'}
              </button>
              <button
                onClick={() => toggleFeaturedMutation.mutate()}
                className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {artist.is_featured ? 'Remove from featured' : 'Add to featured'}
              </button>
            </div>
          </div>

          {artist.user && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Linked User</h3>
              <p className="text-sm font-medium">{artist.user.name}</p>
              <p className="text-sm text-muted-foreground">{artist.user.email}</p>
              <p className="text-sm text-muted-foreground">@{artist.user.username}</p>
              <Link href={`/admin/users/${artist.user.id}`} className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Open user profile <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Artist"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
