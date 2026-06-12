'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Globe,
  Plus,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Music,
  Radio,
  TrendingUp,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useDistributionAnalytics,
  useSongDistributions,
  useSubmitDistribution,
  useRetryDistribution,
  useRemoveDistribution,
  type Distribution,
  type DistributionStatus,
} from '@/hooks/useDistribution';
import { useMyArtistSongs } from '@/hooks/useArtist';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS: { code: string; name: string; color: string }[] = [
  { code: 'spotify',       name: 'Spotify',        color: '#1DB954' },
  { code: 'apple_music',   name: 'Apple Music',    color: '#FC3C44' },
  { code: 'youtube_music', name: 'YouTube Music',  color: '#FF0000' },
  { code: 'amazon_music',  name: 'Amazon Music',   color: '#232F3E' },
  { code: 'deezer',        name: 'Deezer',         color: '#A238FF' },
  { code: 'tidal',         name: 'Tidal',          color: '#000000' },
  { code: 'pandora',       name: 'Pandora',        color: '#3668FF' },
  { code: 'soundcloud',    name: 'SoundCloud',     color: '#FF5500' },
  { code: 'bandcamp',      name: 'Bandcamp',       color: '#1DA0C3' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DistributionStatus }) {
  const map: Record<DistributionStatus, { label: string; className: string; Icon: React.ElementType }> = {
    live:       { label: 'Live',       className: 'bg-green-500/10 text-green-600 dark:text-green-400',   Icon: CheckCircle2 },
    pending:    { label: 'Pending',    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',   Icon: Clock },
    processing: { label: 'Processing', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',     Icon: Loader2 },
    failed:     { label: 'Failed',     className: 'bg-red-500/10 text-red-600 dark:text-red-400',         Icon: AlertCircle },
    rejected:   { label: 'Rejected',   className: 'bg-red-500/10 text-red-600 dark:text-red-400',         Icon: AlertCircle },
    removed:    { label: 'Removed',    className: 'bg-muted text-muted-foreground',                       Icon: X },
  };
  const { label, className, Icon } = map[status] ?? map.pending;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      <Icon className={cn('h-3 w-3', status === 'processing' && 'animate-spin')} />
      {label}
    </span>
  );
}

// ─── Submit Modal ─────────────────────────────────────────────────────────────

interface SubmitModalProps {
  songId: number;
  songTitle: string;
  existingPlatforms: string[];
  onClose: () => void;
}

function SubmitModal({ songId, songTitle, existingPlatforms, onClose }: SubmitModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [releaseDate, setReleaseDate] = useState('');
  const submit = useSubmitDistribution();

  const available = PLATFORMS.filter((p) => !existingPlatforms.includes(p.code));

  const toggle = (code: string) =>
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));

  const handleSubmit = () => {
    if (selected.length === 0) {
      toast.error('Select at least one platform');
      return;
    }
    submit.mutate(
      { songId, payload: { platforms: selected, release_date: releaseDate || undefined } },
      {
        onSuccess: (res) => {
          toast.success(res.message ?? 'Distribution submitted');
          onClose();
        },
        onError: () => toast.error('Failed to submit distribution'),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">Distribute to Platforms</h2>
            <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[260px]">{songTitle}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              This song is already submitted to all platforms.
            </p>
          ) : (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Select platforms</p>
                <div className="grid grid-cols-2 gap-2">
                  {available.map((p) => (
                    <button
                      key={p.code}
                      onClick={() => toggle(p.code)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors text-left',
                        selected.includes(p.code)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'hover:bg-muted/60'
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Release date (optional)
                </label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </>
          )}
        </div>

        {available.length > 0 && (
          <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submit.isPending || selected.length === 0}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submit.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Distribute ({selected.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Song Distribution Row ────────────────────────────────────────────────────

interface SongRowProps {
  song: { id: number; title: string; artwork_url?: string; status: string };
  onDistribute: () => void;
}

function SongDistributionRow({ song, onDistribute }: SongRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: distributions, isLoading } = useSongDistributions(expanded ? song.id : null);
  const retry = useRetryDistribution();
  const remove = useRemoveDistribution();

  const handleRetry = (dist: Distribution) => {
    retry.mutate(dist.id, {
      onSuccess: () => toast.success(`Retrying on ${dist.platform_name}`),
      onError: () => toast.error('Failed to retry'),
    });
  };

  const handleRemove = (dist: Distribution) => {
    if (!confirm(`Remove "${song.title}" from ${dist.platform_name}?`)) return;
    remove.mutate(dist.id, {
      onSuccess: () => toast.success(`Removal requested from ${dist.platform_name}`),
      onError: () => toast.error('Failed to request removal'),
    });
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
          {song.artwork_url ? (
            <Image src={song.artwork_url} alt={song.title} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Music className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{song.title}</p>
          <p className="text-xs text-muted-foreground capitalize">{song.status}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onDistribute}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/60 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Distribute
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : !distributions || distributions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Not distributed to any platform yet.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {distributions.map((dist) => {
                const platform = PLATFORMS.find((p) => p.code === dist.platform_code);
                return (
                  <div
                    key={dist.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: platform?.color ?? '#888' }}
                    />
                    <span className="flex-1 text-sm">{dist.platform_name}</span>
                    <StatusBadge status={dist.status} />
                    <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">
                      {dist.total_streams} plays
                    </span>
                    <div className="flex items-center gap-1">
                      {dist.platform_url && (
                        <a
                          href={dist.platform_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          title="View on platform"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {(dist.status === 'failed' || dist.status === 'rejected') && (
                        <button
                          onClick={() => handleRetry(dist)}
                          disabled={retry.isPending}
                          className="rounded p-1 text-muted-foreground hover:text-blue-500"
                          title="Retry distribution"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {dist.status === 'live' && (
                        <button
                          onClick={() => handleRemove(dist)}
                          disabled={remove.isPending}
                          className="rounded p-1 text-muted-foreground hover:text-red-500"
                          title="Request removal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DistributionPage() {
  const [selectedSong, setSelectedSong] = useState<{ id: number; title: string; existingPlatforms: string[] } | null>(null);
  const [songSearch, setSongSearch] = useState('');

  const { data: analytics, isLoading: analyticsLoading } = useDistributionAnalytics();
  const { data: songsData, isLoading: songsLoading } = useMyArtistSongs({ per_page: 100, status: 'published' });

  const songs = (songsData?.data ?? []).filter((s) =>
    s.title.toLowerCase().includes(songSearch.toLowerCase())
  );

  const statsCards = [
    { label: 'Total Distributions', value: analytics?.total_distributions ?? 0, Icon: Globe },
    { label: 'Live on Platforms',   value: analytics?.live ?? 0,                Icon: Radio },
    { label: 'Pending / Processing', value: analytics?.pending ?? 0,            Icon: Clock },
    { label: 'Total Streams',        value: analytics?.total_streams ?? 0,      Icon: TrendingUp, format: 'streams' },
  ];

  const formatVal = (n: number, fmt?: string) => {
    if (fmt === 'streams') return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
    return String(n);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Distribution</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Get your music on Spotify, Apple Music, and 7 more platforms.
          </p>
        </div>
      </div>

      {/* Stats */}
      {analyticsLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statsCards.map(({ label, value, Icon, format }) => (
            <div key={label} className="rounded-xl border bg-card px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
              </div>
              <p className="mt-1.5 text-2xl font-bold tabular-nums">{formatVal(value, format)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Platform breakdown */}
      {analytics && analytics.platforms.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">By Platform</h2>
          <div className="space-y-2">
            {analytics.platforms.map((p) => {
              const platform = PLATFORMS.find((pl) => pl.name === p.platform);
              return (
                <div key={p.platform} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: platform?.color ?? '#888' }}
                  />
                  <span className="flex-1 text-sm">{p.platform}</span>
                  <span className="text-xs text-muted-foreground">{p.live} live</span>
                  <span className="w-20 text-right text-xs font-medium tabular-nums">
                    {p.streams.toLocaleString()} plays
                  </span>
                  <span className="w-24 text-right text-xs text-muted-foreground tabular-nums">
                    UGX {p.revenue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Song list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Your Published Songs</h2>
          <input
            type="text"
            placeholder="Search songs…"
            value={songSearch}
            onChange={(e) => setSongSearch(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {songsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border bg-muted/30" />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-12 text-center">
            <Music className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No published songs yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Only published songs can be distributed to platforms.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <SongDistributionRow
                key={song.id}
                song={song}
                onDistribute={() =>
                  setSelectedSong({ id: song.id, title: song.title, existingPlatforms: [] })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      {analytics && analytics.recent_distributions.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
          <div className="space-y-2">
            {analytics.recent_distributions.map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-sm">
                <StatusBadge status={d.status} />
                <span className="flex-1 truncate">{d.song ?? 'Unknown'}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{d.platform}</span>
                {d.live_date && (
                  <span className="shrink-0 text-xs text-muted-foreground">{d.live_date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribute modal */}
      {selectedSong && (
        <SubmitModal
          songId={selectedSong.id}
          songTitle={selectedSong.title}
          existingPlatforms={selectedSong.existingPlatforms}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </div>
  );
}
