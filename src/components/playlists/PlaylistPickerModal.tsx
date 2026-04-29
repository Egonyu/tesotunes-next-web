"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAddToPlaylist, useUserPlaylists } from "@/hooks/api";
import { CreatePlaylistModal } from "@/components/music/CreatePlaylistModal";
import { useUIStore } from "@/stores";
import type { Playlist } from "@/types";

export function PlaylistPickerModal() {
  const { playlistPickerSong, closePlaylistPicker } = useUIStore();
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  const isOpen = !!playlistPickerSong;

  const { data: playlists = [], isLoading } = useUserPlaylists({
    enabled: isOpen,
  });
  const addToPlaylist = useAddToPlaylist();

  const handleAdd = (playlistId: number) => {
    if (!playlistPickerSong) return;
    addToPlaylist.mutate(
      { playlistId, songId: playlistPickerSong.id },
      {
        onSuccess: () => {
          toast.success(`Added "${playlistPickerSong.title}" to playlist`);
          closePlaylistPicker();
        },
        onError: () => {
          toast.error("Failed to add song to playlist");
        },
      }
    );
  };

  const handleCreated = (playlist: Playlist) => {
    setShowCreatePlaylist(false);
    handleAdd(playlist.id);
  };

  const handleClose = () => {
    closePlaylistPicker();
    setShowCreatePlaylist(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="absolute inset-0" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Add to playlist</h2>
              <p className="text-sm text-muted-foreground truncate">
                {playlistPickerSong.title}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1 hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowCreatePlaylist(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-3 text-left hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Create playlist</p>
                <p className="text-sm text-muted-foreground">
                  Start a new playlist, then add this song
                </p>
              </div>
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={() => handleAdd(playlist.id)}
                  disabled={addToPlaylist.isPending}
                  className="flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left hover:bg-muted/50 disabled:opacity-60"
                >
                  <div>
                    <p className="font-medium">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {playlist.song_count || 0} songs
                    </p>
                  </div>
                  {addToPlaylist.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </button>
              ))
            ) : (
              <div className="rounded-lg border px-4 py-6 text-center text-sm text-muted-foreground">
                Create your first playlist, then add songs from here.
              </div>
            )}
          </div>
        </div>
      </div>

      <CreatePlaylistModal
        open={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onCreated={handleCreated}
        redirectOnCreate={false}
      />
    </>
  );
}
