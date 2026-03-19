'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';
import {
  Calendar,
  CheckCircle,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  Globe,
  Music,
  PiggyBank,
  Trash2,
  User,
  Users,
  XCircle,
  FileText,
  Clock,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';
import { InitialsAvatar, SafeImage } from '@/components/ui/safe-image';
import { pickMediaUrl } from '@/lib/media';

type Artist = {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  status: string;
  is_verified: boolean;
  is_placeholder?: boolean;
  claim_status?: string | null;
  claimed_user_id?: number | null;
  catalog_manager_user_id?: number | null;
  verification_status?: string;
  rejection_reason?: string | null;
  is_featured: boolean;
  profile_url: string | null;
  cover_url: string | null;
  website: string | null;
  total_plays: number;
  total_songs: number;
  total_albums: number;
  followers: number;
  earnings_balance?: number;
  commission_rate?: number;
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

type SaccoMember = {
  id: number;
  user_id: number;
  member_number: string;
  status: string;
  joined_at: string;
  total_savings: number;
  loans_count: number;
  username?: string;
  email?: string;
};

type EventItem = {
  id: number;
  title: string;
  status: string;
  starts_at?: string | null;
  ends_at?: string | null;
  venue_name?: string | null;
  city?: string | null;
  is_featured?: boolean;
};

function compactNumber(value: number | null | undefined): string {
  if (!value) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

function formatUGX(amount: number | null | undefined): string {
  if (!amount) return 'UGX 0';
  return `UGX ${amount.toLocaleString()}`;
}

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteSongId, setDeleteSongId] = useState<number | null>(null);
  const [showRejectComposer, setShowRejectComposer] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // --- Queries ---

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'artist', id],
    queryFn: () => apiGet<{ data: Artist }>(`/admin/artists/${id}`),
  });

  const { data: songsRes, isLoading: songsLoading } = useQuery({
    queryKey: ['admin', 'artist', id, 'songs'],
    queryFn: () => apiGet<{ data: ArtistSong[]; meta?: { total?: number } }>(`/admin/songs?artist_id=${id}&per_page=50&sort=-created_at`),
  });

  const artist = data?.data;

  const { data: saccoRes } = useQuery({
    queryKey: ['admin', 'artist', id, 'sacco'],
    queryFn: () => apiGet<{ data: SaccoMember[] }>(`/admin/sacco/members?user_id=${artist?.user?.id}&per_page=1`),
    enabled: !!artist?.user?.id,
  });

  const { data: eventsRes, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin', 'artist', id, 'events'],
    queryFn: () => apiGet<{ data: EventItem[]; meta?: { total?: number } }>(`/admin/events?user_id=${artist?.user?.id}&per_page=10`),
    enabled: !!artist?.user?.id,
  });

  const artistSongs = songsRes?.data ?? [];
  const saccoMember = saccoRes?.data?.[0] ?? null;
  const artistEvents = eventsRes?.data ?? [];

  // --- Mutations ---

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

  const rejectArtistMutation = useMutation({
    mutationFn: (reason: string) => apiPost<{ message?: string }>(`/admin/artists/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Artist application rejected');
      setShowRejectComposer(false);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: () => toast.error('Failed to reject artist application'),
  });

  const approveArtistMutation = useMutation({
    mutationFn: () => apiPost<{ message?: string }>(`/admin/artists/${id}/approve`),
    onSuccess: () => {
      toast.success('Artist approved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: () => toast.error('Failed to approve artist'),
  });

  const suspendArtistMutation = useMutation({
    mutationFn: () => apiPost<{ message?: string }>(`/admin/artists/${id}/suspend`),
    onSuccess: () => {
      toast.success('Artist suspended');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    },
    onError: () => toast.error('Failed to suspend artist'),
  });

  const changeSongStatusMutation = useMutation({
    mutationFn: ({ songId, status }: { songId: number; status: string }) =>
      apiPut<{ message?: string }>(`/admin/songs/${songId}`, { status }),
    onSuccess: (_, { status }) => {
      toast.success(`Song status changed to ${status}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id, 'songs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to change song status'),
  });

  const deleteSongMutation = useMutation({
    mutationFn: (songId: number) => apiDelete<{ message?: string }>(`/admin/songs/${songId}`),
    onSuccess: () => {
      toast.success('Song deleted');
      setDeleteSongId(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id, 'songs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to delete song'),
  });

  const toggleSongFeaturedMutation = useMutation({
    mutationFn: (songId: number) => apiPost<{ message?: string }>(`/admin/songs/${songId}/toggle-featured`),
    onSuccess: () => {
      toast.success('Featured status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id, 'songs'] });
    },
    onError: () => toast.error('Failed to toggle featured'),
  });

  // --- Render ---

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

  /** Get contextual status actions based on current song status */
  const getSongActions = (currentStatus: string): Array<{ label: string; value: string; icon: typeof CheckCircle; color: string }> => {
    switch (currentStatus) {
      case 'published':
        return [
          { label: 'Unpublish', value: 'draft', icon: FileText, color: 'text-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800' },
        ];
      case 'pending':
      case 'pending_review':
        return [
          { label: 'Approve', value: 'published', icon: CheckCircle, color: 'text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950' },
          { label: 'Reject', value: 'rejected', icon: Ban, color: 'text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950' },
        ];
      case 'rejected':
        return [
          { label: 'Publish', value: 'published', icon: CheckCircle, color: 'text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950' },
          { label: 'Draft', value: 'draft', icon: FileText, color: 'text-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800' },
        ];
      case 'draft':
      default:
        return [
          { label: 'Publish', value: 'published', icon: CheckCircle, color: 'text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950' },
          { label: 'Pending', value: 'pending', icon: Clock, color: 'text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950' },
        ];
    }
  };

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

      {/* Hero / Cover */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="relative h-52 bg-linear-to-r from-primary/15 via-primary/5 to-transparent md:h-64">
          {pickMediaUrl(artist.cover_url) && (
            <SafeImage
              src={pickMediaUrl(artist.cover_url)}
              alt={`${artist.name} cover`}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white">
              {pickMediaUrl(artist.profile_url) ? (
                <SafeImage
                  src={pickMediaUrl(artist.profile_url)}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  fallback={<InitialsAvatar name={artist.name} className="bg-white/90 text-slate-700" textClassName="text-3xl" />}
                />
              ) : (
                <InitialsAvatar name={artist.name} className="bg-white/90 text-slate-700" textClassName="text-3xl" />
              )}
            </div>
            <div className="flex-1 text-white">
              <div className="mb-1 flex items-center gap-2">
                <h2 className="text-2xl font-bold">{artist.name}</h2>
                {artist.is_verified && <CheckCircle className="h-5 w-5 text-blue-400" fill="currentColor" />}
                {artist.is_placeholder ? (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    Placeholder Artist
                  </span>
                ) : null}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4 lg:grid-cols-6">
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
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Earnings Balance</p>
            <p className="text-xl font-semibold">{formatUGX(artist.earnings_balance)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Commission Rate</p>
            <p className="text-xl font-semibold">{artist.commission_rate != null ? `${artist.commission_rate}%` : '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bio</h3>
            <p className="text-sm leading-6 text-foreground/90">{artist.bio || 'No bio provided.'}</p>
          </div>

          {(artist.is_placeholder || artist.claim_status) && (
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Claimability</h3>
                <Link
                  href="/admin/catalog/claims"
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                >
                  Open Claim Queue
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Placeholder Status</p>
                  <p className="mt-1 text-lg font-semibold">{artist.is_placeholder ? 'Placeholder artist' : 'Claimed artist'}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Claim Status</p>
                  <p className="mt-1 text-lg font-semibold capitalize">{artist.claim_status || 'not-set'}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Operational Notes</p>
                  <p className="mt-1 text-sm text-foreground/80">
                    {artist.is_placeholder
                      ? 'This profile was created for catalog intake and can be claimed later.'
                      : 'This profile is already linked to a claimed artist account.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Songs Management Table */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Songs ({songsRes?.meta?.total ?? artistSongs.length})
              </h3>
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
              <div className="overflow-x-auto rounded-lg border">
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
                          <div>DL: {compactNumber(song.download_count)}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-1">
                            {/* Contextual status change buttons */}
                            {getSongActions(song.status || 'draft')
                              .map((action) => {
                                const Icon = action.icon;
                                return (
                                  <button
                                    key={action.value}
                                    onClick={() => changeSongStatusMutation.mutate({ songId: song.id, status: action.value })}
                                    disabled={changeSongStatusMutation.isPending}
                                    className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs disabled:opacity-50 ${action.color}`}
                                    title={action.label}
                                  >
                                    <Icon className="h-3 w-3" /> {action.label}
                                  </button>
                                );
                              })}
                            <button
                              onClick={() => toggleSongFeaturedMutation.mutate(song.id)}
                              disabled={toggleSongFeaturedMutation.isPending}
                              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 disabled:opacity-50"
                              title={song.is_featured ? 'Unfeature' : 'Feature'}
                            >
                              <Music className="h-3 w-3" /> {song.is_featured ? 'Unfeature' : 'Feature'}
                            </button>
                            <Link href={`/admin/songs/${song.id}`} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-muted">
                              <Eye className="h-3 w-3" /> View
                            </Link>
                            <Link href={`/admin/songs/${song.id}/edit`} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-muted">
                              <Edit className="h-3 w-3" /> Edit
                            </Link>
                            <button
                              onClick={() => setDeleteSongId(song.id)}
                              className="inline-flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              title="Delete song"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Events Section */}
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Calendar className="mr-1.5 inline h-4 w-4" />
                Events ({eventsRes?.meta?.total ?? artistEvents.length})
              </h3>
              <Link
                href="/admin/events"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Manage events <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {eventsLoading ? (
              <div className="space-y-2">
                <div className="h-10 rounded bg-muted animate-pulse" />
                <div className="h-10 rounded bg-muted animate-pulse" />
              </div>
            ) : artistEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events found for this artist.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Event</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Venue</th>
                      <th className="px-3 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {artistEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{event.title}</td>
                        <td className="px-3 py-2"><StatusBadge status={event.status} /></td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {event.starts_at ? new Date(event.starts_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {event.venue_name || event.city || '—'}
                        </td>
                        <td className="px-3 py-2">
                          <Link href={`/admin/events/${event.id}`} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-muted">
                            <Eye className="h-3 w-3" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Earnings Card */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <DollarSign className="mr-1.5 inline h-4 w-4" />
              Earnings
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold">{formatUGX(artist.earnings_balance)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Commission Rate</p>
                <p className="text-lg font-semibold">{artist.commission_rate != null ? `${artist.commission_rate}%` : 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* SACCO Status Card */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <PiggyBank className="mr-1.5 inline h-4 w-4" />
              SACCO Status
            </h3>
            {saccoMember ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <StatusBadge status={saccoMember.status} size="sm" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member #</p>
                  <p className="text-sm font-medium">{saccoMember.member_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Savings</p>
                  <p className="text-sm font-semibold">{formatUGX(saccoMember.total_savings)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Loans</p>
                  <p className="text-sm font-medium">{saccoMember.loans_count}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm">{new Date(saccoMember.joined_at).toLocaleDateString()}</p>
                </div>
                <Link
                  href="/admin/sacco"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View SACCO details <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not a SACCO member.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick Actions</h3>
            <div className="space-y-2">
              {artist.status !== 'active' && (
                <button
                  onClick={() => approveArtistMutation.mutate()}
                  disabled={approveArtistMutation.isPending}
                  className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {approveArtistMutation.isPending ? 'Approving artist...' : 'Approve artist'}
                </button>
              )}
              <button
                onClick={() => toggleVerifyMutation.mutate()}
                className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {artist.is_verified ? 'Remove verification' : 'Verify artist'}
              </button>
              <button
                onClick={() => setShowRejectComposer((value) => !value)}
                className="w-full rounded-lg border border-red-300 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Reject application
              </button>
              {artist.status !== 'suspended' && (
                <button
                  onClick={() => suspendArtistMutation.mutate()}
                  disabled={suspendArtistMutation.isPending}
                  className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {suspendArtistMutation.isPending ? 'Suspending artist...' : 'Suspend artist'}
                </button>
              )}
              <button
                onClick={() => toggleFeaturedMutation.mutate()}
                className="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
              >
                {artist.is_featured ? 'Remove from featured' : 'Add to featured'}
              </button>
            </div>
            {showRejectComposer && (
              <div className="mt-4 space-y-2 rounded-lg border border-red-200 bg-red-50/60 p-3">
                <p className="text-sm font-medium text-red-700">Reject artist application</p>
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Reason for rejection..."
                  className="min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => rejectArtistMutation.mutate(rejectReason)}
                  disabled={rejectArtistMutation.isPending || !rejectReason.trim()}
                  className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {rejectArtistMutation.isPending ? 'Rejecting...' : 'Confirm rejection'}
                </button>
              </div>
            )}
            {artist.rejection_reason && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Current rejection reason</p>
                <p className="mt-1 text-sm text-red-900">{artist.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Linked User */}
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

      {/* Delete Artist Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Artist"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate()}
      />

      {/* Delete Song Dialog */}
      <ConfirmDialog
        open={deleteSongId !== null}
        onOpenChange={(open) => { if (!open) setDeleteSongId(null); }}
        title="Delete Song"
        description="This will permanently delete the song and its audio files. This action cannot be undone."
        confirmLabel="Delete Song"
        variant="destructive"
        onConfirm={() => { if (deleteSongId) deleteSongMutation.mutate(deleteSongId); }}
        isLoading={deleteSongMutation.isPending}
      />
    </div>
  );
}
