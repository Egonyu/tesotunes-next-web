"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  Copy,
  Check,
  Music,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export interface SharePayload {
  share_url: string;
  og_title: string;
  og_description: string | null;
  og_image: string | null;
  caption: string;
  platform_links: {
    copy: string;
    whatsapp: string;
    twitter: string;
    facebook: string;
    telegram: string;
    instagram: null;
  };
}

type PlatformKey = keyof SharePayload["platform_links"];

interface ShareBottomSheetProps {
  open: boolean;
  onClose: () => void;
  payload: SharePayload | null;
  isLoading?: boolean;
}

const PLATFORMS = [
  {
    key: "copy" as const,
    label: "Copy Link",
    icon: (props: { className?: string }) => <Copy {...props} />,
    color: "bg-zinc-600",
  },
  {
    key: "whatsapp" as const,
    label: "WhatsApp",
    icon: (props: { className?: string }) => (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    color: "bg-[#25D366]",
  },
  {
    key: "twitter" as const,
    label: "X",
    icon: (props: { className?: string }) => (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-black dark:bg-zinc-700",
  },
  {
    key: "facebook" as const,
    label: "Facebook",
    icon: (props: { className?: string }) => (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: "bg-[#1877F2]",
  },
  {
    key: "telegram" as const,
    label: "Telegram",
    icon: (props: { className?: string }) => (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: "bg-[#0088cc]",
  },
];

function isSafeShareUrl(url: string): boolean {
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://www.tesotunes.com");
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function ShareBottomSheet({ open, onClose, payload, isLoading }: ShareBottomSheetProps) {
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset copied state when sheet closes
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  async function handlePlatformClick(key: PlatformKey) {
    if (!payload) return;

    if (key === "copy") {
      const text = payload.platform_links.copy || payload.share_url || payload.caption;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy");
      }
      return;
    }

    let url = payload.platform_links[key];

    if (!url) {
      const canonicalUrl = payload.share_url;
      const shareTitle = payload.og_title || "Listen on TesoTunes";
      const shareText = `${canonicalUrl}\n\n${shareTitle}`;

      if (key === "whatsapp") {
        url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      } else if (key === "twitter") {
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(canonicalUrl)}&hashtags=TesoTunes`;
      } else if (key === "facebook") {
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`;
      } else if (key === "telegram") {
        url = `https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(shareTitle)}`;
      }
    }

    if (url && isSafeShareUrl(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (url) {
      toast.error("Unable to open share link");
    }
  }

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-sheet-title"
        className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 id="share-sheet-title" className="text-lg font-bold">Share</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading || !payload ? (
          <div className="flex flex-col items-center justify-center py-12 px-5">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Preparing share...</p>
          </div>
        ) : (
          <div className="px-5 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+6rem))] sm:pb-6">
            {/* OG Image Hero */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted mb-4">
              {payload.og_image ? (
                <Image
                  src={payload.og_image}
                  alt={payload.og_title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                  <Music className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <h3 className="font-bold text-base mb-1 line-clamp-2">{payload.og_title}</h3>
            {payload.og_description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {payload.og_description}
              </p>
            )}

            {/* Caption preview */}
            <div className="bg-muted/50 rounded-lg p-3 mb-5 border">
              <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">
                {payload.caption}
              </p>
            </div>

            {/* Platform Icons Row */}
            <div className="grid grid-cols-5 gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.key}
                  onClick={() => handlePlatformClick(platform.key)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${platform.color} text-white flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95`}
                  >
                    {platform.key === "copy" && copied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <platform.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight text-center">
                    {platform.key === "copy" && copied ? "Copied!" : platform.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
