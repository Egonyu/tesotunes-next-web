"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreatePlaylistModal } from "@/components/music/CreatePlaylistModal";

export function CreatePlaylistButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Create Playlist
      </button>
      <CreatePlaylistModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
