'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUp, Clock, ListMusic, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAddToPlaylist, useRemoveFromPlaylist, useReorderPlaylistSongs, useSuggestedPlaylistSongs } from '@/hooks/api';
import type { Playlist, Song } from '@/types';
import { formatDuration, resolveDurationSeconds } from '@/lib/utils';

interface PlaylistTracksSectionProps {
  playlist: Playlist;
  tracks: Song[];
}

export function PlaylistTracksSection({ playlist, tracks }: PlaylistTracksSectionProps) {
  const [orderedTracks, setOrderedTracks] = useState(tracks);
  const reorderPlaylist = useReorderPlaylistSongs();
  const removeFromPlaylist = useRemoveFromPlaylist();
  const addToPlaylist = useAddToPlaylist();
  const { data: suggestedSongs } = useSuggestedPlaylistSongs(playlist.id, {
    enabled: playlist.can_edit === true,
    limit: 8,
  });

  useEffect(() => {
    setOrderedTracks(tracks);
  }, [tracks]);

  const trackIds = useMemo(() => orderedTracks.map((track) => track.id), [orderedTracks]);

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= orderedTracks.length) {
      return;
    }

    const reordered = [...orderedTracks];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    setOrderedTracks(reordered);

    reorderPlaylist.mutate(
      {
        playlistId: playlist.slug || playlist.id,
        songIds: reordered.map((track) => track.id),
      },
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
      {
        playlistId: playlist.slug || playlist.id,
        songId,
      },
      {
        onSuccess: () => {
          setOrderedTracks((current) => current.filter((track) => track.id !== songId));
          toast.success('Song removed from playlist');
        },
        onError: () => {
          toast.error('Failed to remove song');
        },
      }
    );
  };

  const addSuggestedSong = (songId: number) => {
    addToPlaylist.mutate(
      {
        playlistId: playlist.id,
        songId,
      },
      {
        onSuccess: () => toast.success('Song added to playlist'),
        onError: () => toast.error('Failed to add song'),
      }
    );
  };

  return (
    <div className="px-6 pb-8 space-y-8">
      <div>
        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b mb-2">
          <span className="w-8 text-center">#</span>
          <span>Title</span>
          <span>Album</span>
          <span className="w-20 text-right">Added</span>
          <span className="w-12 text-right">
            <Clock className="h-4 w-4 inline" />
          </span>
        </div>

        <div className="space-y-1">
          {orderedTracks.length > 0 ? (
            orderedTracks.map((track, index) => (
              <div
                key={track.id}
                className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center p-2 md:px-4 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="w-8 text-center text-muted-foreground">
                  {index + 1}
                </span>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {track.artwork_url && (
                      <Image src={track.artwork_url} alt={track.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    {track.artist && (
                      <Link
                        href={`/artists/${track.artist.slug || track.artist.id}`}
                        className="text-sm text-muted-foreground hover:underline truncate block"
                      >
                        {track.artist.name}
                      </Link>
                    )}
                  </div>
                </div>

                <div className="hidden md:block min-w-0">
                  {track.album && (
                    <Link
                      href={`/albums/${track.album.slug || track.album.id}`}
                      className="text-sm text-muted-foreground hover:underline truncate block"
                    >
                      {track.album.title}
                    </Link>
                  )}
                </div>

                <div className="hidden md:flex items-center justify-end gap-2 text-sm text-muted-foreground">
                  <span>
                    {track.pivot?.created_at ? new Date(track.pivot.created_at).toLocaleDateString() : '-'}
                  </span>
                  {playlist.can_edit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveTrack(index, 'up')}
                        disabled={index === 0 || reorderPlaylist.isPending}
                        className="rounded p-1 hover:bg-background disabled:opacity-40"
                        aria-label={`Move ${track.title} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveTrack(index, 'down')}
                        disabled={index === orderedTracks.length - 1 || reorderPlaylist.isPending}
                        className="rounded p-1 hover:bg-background disabled:opacity-40"
                        aria-label={`Move ${track.title} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeTrack(track.id)}
                        disabled={removeFromPlaylist.isPending}
                        className="rounded p-1 text-destructive hover:bg-background disabled:opacity-40"
                        aria-label={`Remove ${track.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <span className="w-12 text-right text-sm text-muted-foreground">
                  {formatDuration(resolveDurationSeconds(undefined, track.duration_seconds))}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ListMusic className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>This playlist is empty</p>
              <p className="text-sm mt-2">
                Add songs to start building your playlist
              </p>
              {playlist.can_edit && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/songs"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Browse songs to add
                  </Link>
                  <Link
                    href="/library"
                    className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Open your library
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {playlist.can_edit && suggestedSongs && suggestedSongs.length > 0 && (
        <div className="rounded-2xl border p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Suggested songs</h2>
            <p className="text-sm text-muted-foreground">
              Quick additions based on artists and genres already in this playlist.
            </p>
          </div>

          <div className="space-y-2">
            {suggestedSongs
              .filter((song) => !trackIds.includes(song.id))
              .slice(0, 6)
              .map((song) => (
                <div key={song.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted shrink-0">
                    {song.artwork_url && (
                      <Image src={song.artwork_url} alt={song.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{song.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{song.artist?.name}</p>
                  </div>
                  <button
                    onClick={() => addSuggestedSong(song.id)}
                    disabled={addToPlaylist.isPending}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
