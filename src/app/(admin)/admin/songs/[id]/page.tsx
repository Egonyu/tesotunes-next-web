'use client';

import { use, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Edit, Trash2, Music, Play, Pause, Eye, ArrowUpRight,
  Calendar, TrendingUp, Clock, Disc, User, Tag, Heart,
  Download, Share2, BarChart2, Headphones, Volume2, VolumeX,
  CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';
import { formatResolvedDuration, resolveDurationSeconds } from '@/lib/utils';
import { toast } from 'sonner';
import { isModeratorOnlyRole } from '@/lib/roles';

interface Song {
  id: string;
  title: string;
  slug: string;
  description?: string;
  duration_seconds?: number;
  duration?: number;
  duration_formatted?: string;
  play_count?: number;
  download_count?: number;
  like_count?: number;
  share_count?: number;
  is_explicit?: boolean;
  explicit?: boolean;
  lyrics?: string;
  isrc?: string;
  isrc_assignment?: {
    assigned: boolean;
    eligible: boolean;
    status: 'assigned' | 'eligible' | 'blocked';
    code?: string | null;
    blockers: string[];
    blocker_messages: string[];
  };
  bpm?: number;
  key?: string;
  track_number?: number;
  disc_number?: number;
  release_date?: string;
  status: string;
  is_featured?: boolean;
  artwork_url?: string;
  audio_url?: string;
  artist: { id: string; name: string; slug: string; avatar_url?: string };
  featured_artists?: { id: string; name: string; slug: string }[];
  album?: { id: string; title: string; slug: string; artwork_url?: string };
  genre?: { id: string; name: string; slug?: string };
  genres?: { id: string; name: string }[];
  credits?: { role: string; name: string }[];
  created_at: string;
  updated_at: string;
}

interface PlayHistory {
  date: string;
  plays: number;
}

interface BulkApproveResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    approved_count: number;
    isrc_assigned_count: number;
    isrc_already_assigned_count: number;
    isrc_blocked_count: number;
  };
}

function buildApproveToastMessage(payload: BulkApproveResponse['data']): string {
  const parts = ['Song approved and published'];

  if (payload.isrc_assigned_count > 0) {
    parts.push('ISRC assigned');
  }

  if (payload.isrc_already_assigned_count > 0) {
    parts.push('ISRC already present');
  }

  if (payload.isrc_blocked_count > 0) {
    parts.push('ISRC still blocked');
  }

  return parts.join(' • ');
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num: number | null | undefined): string {
  if (num == null) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function SongDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { data: session } = useSession();
  const isModeratorOnly = isModeratorOnlyRole(session?.user?.role);

  const { data: song, isLoading } = useQuery({
    queryKey: ['admin', 'song', id],
    queryFn: () => apiGet<{ data: Song }>(`/admin/songs/${id}`),
  });

  const { data: playHistory } = useQuery({
    queryKey: ['admin', 'song', id, 'play-history'],
    queryFn: () => apiGet<{ data: PlayHistory[] }>(`/admin/songs/${id}/play-history`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/admin/songs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
      router.push('/admin/songs');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: () => apiPost(`/admin/songs/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: () => apiPost(`/admin/songs/${id}/toggle-featured`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => apiPost<BulkApproveResponse>('/admin/songs/bulk-approve', { song_ids: [Number(id)] }),
    onSuccess: (response) => {
      toast.success(buildApproveToastMessage(response.data));
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to approve song'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => apiPost('/admin/songs/bulk-reject', { song_ids: [Number(id)], reason }),
    onSuccess: () => {
      toast.success('Song rejected');
      setShowRejectDialog(false);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: () => toast.error('Failed to reject song'),
  });

  const assignIsrcMutation = useMutation({
    mutationFn: () => apiPost(`/songs/${id}/generate-isrc`),
    onSuccess: () => {
      toast.success('ISRC assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'song', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'songs'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to assign ISRC';
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!song?.data) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Song not found</h2>
        <Link href="/admin/songs" className="text-primary hover:underline mt-2 inline-block">
          Back to songs
        </Link>
      </div>
    );
  }

  const s = song.data;
  const isrcAssignment = s.isrc_assignment;

  const togglePlay = () => {
    if (!audioRef.current || !s.audio_url) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Audio Element */}
      {s.audio_url && (
        <audio
          ref={audioRef}
          src={s.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
      )}
      <PageHeader
        title={s.title}
        description={`by ${s.artist.name}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Songs', href: '/admin/songs' },
          { label: s.title },
        ]}
        backHref="/admin/songs"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/songs/${s.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              View Live
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href={`/admin/songs/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            {!isModeratorOnly && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Song Header Card */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex gap-6">
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden">
                {s.artwork_url ? (
                  <Image
                    src={s.artwork_url}
                    alt={s.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Music className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {s.audio_url && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    {isPlaying ? (
                      <Pause className="h-12 w-12 text-white" fill="white" />
                    ) : (
                      <Play className="h-12 w-12 text-white" fill="white" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={s.status} />
                  {(s.is_explicit || s.explicit) && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-800 rounded">
                      EXPLICIT
                    </span>
                  )}
                  {s.is_featured && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded">
                      FEATURED
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-1">{s.title}</h2>

                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Link href={`/admin/artists/${s.artist.id}`} className="hover:text-primary hover:underline">
                    {s.artist.name}
                  </Link>
                  {(s.featured_artists?.length ?? 0) > 0 && (
                    <>
                      <span>feat.</span>
                      {s.featured_artists!.map((fa, i) => (
                        <span key={fa.id}>
                          <Link href={`/admin/artists/${fa.id}`} className="hover:text-primary hover:underline">
                            {fa.name}
                          </Link>
                          {i < s.featured_artists!.length - 1 && ', '}
                        </span>
                      ))}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatResolvedDuration(undefined, s.duration_seconds, s.duration_formatted)}</span>
                  </div>
                  {s.album && (
                    <div className="flex items-center gap-1.5">
                      <Disc className="h-4 w-4 text-muted-foreground" />
                      <Link href={`/admin/albums/${s.album.id}`} className="hover:text-primary hover:underline">
                        {s.album.title}
                      </Link>
                    </div>
                  )}
                  {s.release_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(s.release_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inline Audio Player */}
          {s.audio_url && (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDuration(Math.floor(currentTime))}</span>
              <span>{formatDuration(Math.floor(duration || resolveDurationSeconds(undefined, s.duration_seconds)))}</span>
                  </div>
                </div>

                <button onClick={toggleMute} className="p-2 hover:bg-muted rounded-lg">
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Headphones className="h-4 w-4" />
                <span className="text-sm">Plays</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(s.play_count)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Likes</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(s.like_count)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Download className="h-4 w-4" />
                <span className="text-sm">Downloads</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(s.download_count)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Shares</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(s.share_count)}</p>
            </div>
          </div>

          {/* Play History Chart Placeholder */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Play History (Last 30 Days)
              </h3>
            </div>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              {playHistory?.data?.length ? (
                <div className="w-full h-full flex items-end gap-1">
                  {playHistory.data.map((day, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                      style={{
                        height: `${Math.max(10, (day.plays / Math.max(...playHistory.data.map(d => d.plays))) * 100)}%`
                      }}
                      title={`${day.date}: ${day.plays} plays`}
                    />
                  ))}
                </div>
              ) : (
                <p>No play data available</p>
              )}
            </div>
          </div>

          {/* Lyrics */}
          {s.lyrics && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Lyrics</h3>
              <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed">
                {s.lyrics}
              </pre>
            </div>
          )}

          {/* Description */}
          {s.description && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Description</h3>
              <p className="text-muted-foreground">{s.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Song Approval (for pending songs) */}
          {(s.status === 'pending' || s.status === 'pending_review') && (
            <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <Clock className="h-5 w-5" />
                Pending Review
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This song is waiting for admin approval before it can be published.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  <CheckCircle className="h-4 w-4" />
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => toggleStatusMutation.mutate()}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center justify-between"
                disabled={toggleStatusMutation.isPending}
              >
                <span>{s.status === 'published' ? 'Unpublish' : 'Publish'}</span>
                <StatusBadge status={s.status === 'published' ? 'draft' : 'published'} />
              </button>
              {!isModeratorOnly && (
                <button
                  onClick={() => toggleFeatureMutation.mutate()}
                  className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted"
                  disabled={toggleFeatureMutation.isPending}
                >
                  {s.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                </button>
              )}
            </div>
          </div>

          {/* Track Details */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Track Details</h3>
            <dl className="space-y-3 text-sm">
              {s.isrc && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ISRC</dt>
                  <dd className="font-mono">{s.isrc}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Track #</dt>
                <dd>{s.track_number}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Disc #</dt>
                <dd>{s.disc_number}</dd>
              </div>
              {s.bpm && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">BPM</dt>
                  <dd>{s.bpm}</dd>
                </div>
              )}
              {s.key && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Key</dt>
                  <dd>{s.key}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* ISRC Readiness */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">ISRC Readiness</h3>

            {isrcAssignment?.status === 'assigned' && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-green-800 dark:text-green-300">ISRC assigned</p>
                    <p className="text-sm text-muted-foreground font-mono">{isrcAssignment.code || s.isrc}</p>
                  </div>
                </div>
              </div>
            )}

            {isrcAssignment?.status === 'eligible' && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-800 dark:text-blue-300">Ready for ISRC assignment</p>
                    <p className="text-sm text-muted-foreground">
                      This song is approved for release or distribution and can safely receive an ISRC.
                    </p>
                    <button
                      onClick={() => assignIsrcMutation.mutate()}
                      disabled={assignIsrcMutation.isPending}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {assignIsrcMutation.isPending ? 'Assigning…' : 'Assign ISRC'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(!isrcAssignment || isrcAssignment.status === 'blocked') && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-amber-800 dark:text-amber-300">Not ready for ISRC yet</p>
                    <p className="text-sm text-muted-foreground">
                      ISRC should only be assigned once a song is approved or otherwise authorized for release/distribution.
                    </p>
                    {!!isrcAssignment?.blocker_messages?.length && (
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {isrcAssignment.blocker_messages.map((message) => (
                          <li key={message}>{message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Genres */}
          {(s.genres?.length ?? 0) > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {s.genres!.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Credits */}
          {(s.credits?.length ?? 0) > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Credits
              </h3>
              <dl className="space-y-2 text-sm">
                {s.credits!.map((credit, i) => (
                  <div key={i} className="flex justify-between">
                    <dt className="text-muted-foreground">{credit.role}</dt>
                    <dd>{credit.name}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Timestamps</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(s.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(s.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {!isModeratorOnly && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Song"
          description={`Are you sure you want to delete "${s.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
        />
      )}

      {/* Reject Reason Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRejectDialog(false)}>
          <div className="bg-card border rounded-xl p-6 w-full max-w-md mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Reject Song</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting &ldquo;{s.title}&rdquo;. The artist will be notified.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g., low audio quality, inappropriate content...)"
              className="w-full px-3 py-2 border rounded-lg bg-background resize-none h-24 text-sm"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowRejectDialog(false); setRejectReason(''); }}
                className="px-4 py-2 border rounded-lg hover:bg-muted text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate(rejectReason)}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Song'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
