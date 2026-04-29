"use client";

import { ListPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useUIStore } from "@/stores";

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
  const openPlaylistPicker = useUIStore((s) => s.openPlaylistPicker);

  const handleClick = () => {
    if (!session?.user) {
      toast.error("Please sign in to add songs to playlists");
      onDone?.();
      return;
    }
    openPlaylistPicker({ id: songId, title: songTitle });
    onDone?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        variant === "card"
          ? "flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted transition-colors"
          : "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
      }
    >
      <ListPlus className="h-4 w-4" />
      <span className={variant === "card" ? "text-xs" : undefined}>Add to playlist</span>
    </button>
  );
}
