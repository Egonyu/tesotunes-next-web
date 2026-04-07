"use client";

import { useState } from "react";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PlaylistEditModal } from "@/components/playlists/PlaylistEditModal";
import type { Playlist } from "@/types";
import { useDeletePlaylist } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PlaylistOwnerMenuProps {
  playlist: Playlist;
}

export function PlaylistOwnerMenu({ playlist }: PlaylistOwnerMenuProps) {
  const router = useRouter();
  const deletePlaylist = useDeletePlaylist();
  const [showEditModal, setShowEditModal] = useState(false);

  if (!playlist.can_edit) {
    return null;
  }

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete "${playlist.name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    deletePlaylist.mutate(playlist.slug || playlist.id, {
      onSuccess: () => {
        toast.success("Playlist deleted");
        router.push("/library");
        router.refresh();
      },
      onError: () => {
        toast.error("Failed to delete playlist");
      },
    });
  };

  return (
    <>
      <DropdownMenu
        align="end"
        trigger={(
          <button className="p-3 text-muted-foreground hover:text-foreground" aria-label="Playlist actions">
            <MoreHorizontal className="h-6 w-6" />
          </button>
        )}
      >
        <DropdownMenuItem
          onClick={() => setShowEditModal(true)}
          className="gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Edit playlist
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete playlist
        </DropdownMenuItem>
      </DropdownMenu>

      <PlaylistEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        playlist={playlist}
      />
    </>
  );
}
