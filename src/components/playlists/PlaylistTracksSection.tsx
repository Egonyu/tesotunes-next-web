'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Clock,
  ListMusic,
  Minus,
  Plus,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAddToPlaylist,
  useRemoveFromPlaylist,
  useReorderPlaylistSongs,
  useSuggestedPlaylistSongs,
} from '@/hooks/api';
import type { Playlist, Song } from '@/types';
import { formatDuration, formatNumber, resolveDurationSeconds } from '@/lib/utils';
import { usePlayerStore } from '@/stores';

interface PlaylistTracksSectionProps {
  playlist: Playlist;
  tracks: Song[];
}

type Trend = 'up' | 'down' | 'stable' | 'new';

function computeTrend(playCount: number, avg: number): Trend {
  if (playCount < 50) return 'new';
  const ratio = avg > 0 ? playCount / avg : 1;
  if (ratio > 1.4) return 'up';
  if (ratio < 0.6) return 'down';
  return 'stable';
}

function TrendIndicator({ trend }: { trend: Trend }) {
  if (trend === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-emerald-500 font-bold text-xs">
        <TrendingUp className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-red-500 font-bold text-xs">
        <TrendingDown className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (trend === 'new') {
    return (
      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded">
        NEW
      </span>
    );
  }
  return <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />;
}

export function PlaylistTracksSection({ playlist, tracks }: PlaylistTracksSectionProps) {
  const [orderedTracks, setOrderedTracks] = useState(tracks);
  const [showAll, setShowAll] = useState(false);
  const reorderPlaylist = useReorderPlaylistSongs();
  const removeFromPlaylist = useRemoveFromPlaylist();
  const addToPlaylist = useAddToPlaylist();
  const { play, pause, resume, currentSong, isPlaying } = usePlayerStore();
  const { data: suggestedSongs } = useSuggestedPlaylistSongs(playlist.id, {
    enabled: playlist.can_edit === true,
    limit: 8,
  });

  useEffect(() => {
    setOrderedTracks(tracks);
  }, [tracks]);

  const trackIds = useMemo(() => orderedTracks.map((t) => t.id), [orderedTracks]);

  const avgPlayCount = useMemo(() => {
    if (orderedTracks.length === 0) return 0;
    return orderedTracks.reduce((sum, t) => sum + (t.play_count || 0), 0) / orderedTracks.length;
  }, [orderedTracks]);

  const displayedTracks = showAll ? orderedTracks : orderedTracks.slice(0, 20);

  const handlePlay = (track: Song) => {
    if (currentSong?.id === track.id) {
      isPlaying ? pause() : resume();
    } else {
      play(track, orderedTracks);
    }
  };

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= orderedTracks.length) return;
    const reordered = [...orderedTracks];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setOrderedTracks(reordered);
    reorderPlaylist.mutate(
      { playlistId: playlist.slug || playlist.id, songIds: reordered.map((t) => t.id) },
      {
        onError: () => {
          setOrderedTracks(tracks);
          toast.error('Failed to reorder playlist');
        },
      }
    );
  };

  const removeTrack = (songId: number) => {
    removeFromPlaylist.mutate(
      { playlistId: playlist.slug || playlist.id, songId },
      {
        onSuccess: () => {
          setOrderedTracks((curr) => curr.filter((t) => t.id !== songId));
          toast.success('Song removed from playlist');
        },
        onError: () => toast.error('Failed to remove song'),
      }
    );
  };

  const addSuggestedSong = (songId: number) => {
    addToPlaylist.mutate(
      { playlistId: playlist.id, songId },
      {
        onSuccess: () => toast.success('Song added to playlist'),
        onError: () => toast.error('Failed to add song'),
      }
    );
  };

  if (orderedTracks.length === 0) {
    return (
      <div className="px-6 pb-8">
        <div className="text-center py-16 text-muted-foreground">
          <ListMusic className="h-14 w-14 mx-auto mb-4 opacity-30" />
          <p className="font-medium">This playlist is empty</p>
          <p className="text-sm mt-1">Add songs to start building your playlist</p>
          {playlist.can_edit && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/songs"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Browse songs
              </Link>
              <Link
                href="/library"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Open library
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-8 space-y-10">
      {/* Column headers — desktop only */}
      <div>
        <div className="hidden md:grid grid-cols-[50px_50px_1fr_1fr_110px_70px] gap-2 px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <span>Rank</span>
          <span>Trend</span>
          <span>Title &amp; Artist</span>
          <span>Album</span>
          <span className="text-right">Plays</span>
          <span className="flex items-center justify-end gap-1">
            <Clock className="h-3 w-3" />
          </span>
        </div>

        <div className="space-y-0.5">
          {displayedTracks.map((track, index) => {
            const isCurrentTrack = currentSong?.id === track.id;
            const trend = computeTrend(track.play_count || 0, avgPlayCount);
            const duration = resolveDurationSeconds(undefined, track.duration_seconds);

            return (
              <div
                key={track.id}
                className={`group grid grid-cols-[40px_1fr_60px] md:grid-cols-[50px_50px_1fr_1fr_110px_70px] gap-2 items-center px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  isCurrentTrack
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                {/* Rank / Play button */}
                <div className="flex items-center justify-center h-6 w-6 md:w-auto">
                  <span
                    className={`text-sm font-black group-hover:hidden transition-opacity ${
                      isCurrentTrack ? 'text-primary hidden' : 'text-muted-foreground/50'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => handlePlay(track)}
                    className={`${isCurrentTrack ? 'flex' : 'hidden group-hover:flex'} items-center justify-center text-primary hover:scale-110 transition-transform`}
                    aria-label={isCurrentTrack && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                  >
                    {isCurrentTrack && isPlaying ? (
                      <svg className="h-5 w-5 fill-primary" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 fill-primary" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Trend — desktop only */}
                <div className="hidden md:flex items-center justify-center">
                  <TrendIndicator trend={trend} />
                </div>

                {/* Title & Artist */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted shadow-md">
                    {track.artwork_url ? (
                      <Image src={track.artwork_url} alt={track.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ListMusic className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`font-bold text-sm truncate transition-colors ${
                        isCurrentTrack ? 'text-primary' : 'group-hover:text-primary'
                      }`}
                    >
                      {track.title}
                    </p>
                    {track.artist && (
                      <Link
                        href={`/artists/${track.artist.slug || track.artist.id}`}
                        className="text-xs text-muted-foreground hover:underline truncate block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {track.artist.name}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Album — desktop only */}
                <div className="hidden md:block min-w-0">
                  {track.album ? (
                    <Link
                      href={`/albums/${track.album.slug || track.album.id}`}
                      className="text-xs text-muted-foreground hover:underline truncate block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {track.album.title}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground/30">—</span>
                  )}
                </div>

                {/* Plays — desktop only */}
                <div className="hidden md:flex items-center justify-end gap-2">
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {formatNumber(track.play_count || 0)}
                  </span>
                  {playlist.can_edit && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveTrack(index, 'up')}
                        disabled={index === 0 || reorderPlaylist.isPending}
                        className="rounded p-1 hover:bg-background disabled:opacity-30"
                        aria-label={`Move ${track.title} up`}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => moveTrack(index, 'down')}
                        disabled={index === orderedTracks.length - 1 || reorderPlaylist.isPending}
                        className="rounded p-1 hover:bg-background disabled:opacity-30"
                        aria-label={`Move ${track.title} down`}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeTrack(track.id)}
                        disabled={removeFromPlaylist.isPending}
                        className="rounded p-1 text-destructive hover:bg-background disabled:opacity-30"
                        aria-label={`Remove ${track.title}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="flex items-center justify-end">
                  <span className="text-xs text-muted-foreground font-mono tabular-nums">
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more / less */}
        {orderedTracks.length > 20 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors group"
            >
              <svg
                className={`h-6 w-6 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                {showAll
                  ? 'Show less'
                  : `Show ${orderedTracks.length - 20} more track${orderedTracks.length - 20 !== 1 ? 's' : ''}`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Suggested songs */}
      {playlist.can_edit && suggestedSongs && suggestedSongs.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-base font-bold">Suggested for you</h2>
              <p className="text-xs text-muted-foreground">
                Based on artists and genres in this playlist
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {suggestedSongs
              .filter((song) => !trackIds.includes(song.id))
              .slice(0, 6)
              .map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-muted shrink-0 shadow-sm">
                    {song.artwork_url && (
                      <Image src={song.artwork_url} alt={song.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sm">{song.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{song.artist?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                      {formatNumber(song.play_count || 0)}
                    </span>
                    <button
                      onClick={() => addSuggestedSong(song.id)}
                      disabled={addToPlaylist.isPending}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
