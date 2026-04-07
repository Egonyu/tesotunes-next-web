"use client";

import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface PlaylistShareButtonProps {
  slug: string;
  name: string;
}

export function PlaylistShareButton({ slug, name }: PlaylistShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return `/playlists/${slug}`;
    }

    return `${window.location.origin}/playlists/${slug}`;
  }, [slug]);

  const handleShare = async () => {
    if (isSharing) {
      return;
    }

    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `Listen to ${name} on Tesotunes`,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Playlist link copied");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        toast.error("Unable to share playlist");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isSharing}
      className="p-3 text-muted-foreground hover:text-foreground disabled:opacity-60"
      aria-label="Share playlist"
      title="Share playlist"
    >
      <Share2 className="h-6 w-6" />
    </button>
  );
}
