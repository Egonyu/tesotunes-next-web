"use client";

import { useState } from "react";
import { ListPlus, Loader2, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAddToPlaylist, useUserPlaylists } from "@/hooks/api";
import { CreatePlaylistModal } from "@/components/music/CreatePlaylistModal";
import type { Playlist } from "@/types";
import { useDropdownMenuContext } from "@/components/ui/dropdown-menu";

interface AddToPlaylistActionProps {
  songId: number;
  songTitle: string;
  onDone?: () => void;
  variant?: "menu" | "card";
}

export function AddToPlaylistAction({
  songId,
  songTitle,
  onDone,
  variant = "menu",
}: AddToPlaylistActionProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const { data: playlists = [], isLoading } = useUserPlaylists({
    enabled: isOpen && !!session?.user,
  });
  const addToPlaylist = useAddToPlaylist();
  const dropdownMenu = useDropdownMenuContext();

  const openPicker = () => {
    if (!session?.user) {
      toast.error("Please sign in to add songs to playlists");
      onDone?.();
      return;
    }

    dropdownMenu?.close();
    setIsOpen(true);
  };

  const handleAdd = (playlistId: number) => {
    addToPlaylist.mutate(
      { playlistId, songId },
      {
        onSuccess: () => {
          toast.success(`Added "${songTitle}" to playlist`);
          setIsOpen(false);
          onDone?.();
        },
        onError: () => {
          toast.error("Failed to add song to playlist");
        },
      }
    );
  };

  const handleCreated = (playlist: Playlist) => {
    setShowCreatePlaylist(false);
    setIsOpen(true);
    handleAdd(playlist.id);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className={
          variant === "card"
            ? "flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted transition-colors"
            : "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
        }
      >
        <ListPlus className="h-4 w-4" />
        <span className={variant === "card" ? "text-xs" : undefined}>Add to playlist</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0"
            onClick={() => {
              setIsOpen(false);
              onDone?.();
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Add to playlist</h2>
                <p className="text-sm text-muted-foreground truncate">
                  {songTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDone?.();
                }}
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
      )}

      <CreatePlaylistModal
        open={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onCreated={handleCreated}
        redirectOnCreate={false}
      />
    </>
  );
}
