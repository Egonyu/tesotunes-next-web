"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2, Lock, Crown, ShoppingCart, X, Music2, Gem } from "lucide-react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useMySubscription } from "@/hooks/useSubscriptions";

type AudioQuality = "128" | "192" | "320" | "flac";

interface QualityOption {
  value: AudioQuality;
  label: string;
  description: string;
  premium: boolean;
  extension: string;
}

const qualityOptions: QualityOption[] = [
  { value: "128", label: "Standard", description: "128 kbps MP3", premium: false, extension: "mp3" },
  { value: "192", label: "High", description: "192 kbps MP3", premium: false, extension: "mp3" },
  { value: "320", label: "Premium", description: "320 kbps MP3", premium: true, extension: "mp3" },
  { value: "flac", label: "Lossless", description: "FLAC (CD quality)", premium: true, extension: "flac" },
];

interface DownloadGateProps {
  songId: number;
  songTitle: string;
  isFree: boolean;
  isDownloadable: boolean;
  isPurchased?: boolean;
  price?: number;
}

type DownloadError = "not_downloadable" | "purchase_required" | "limit_reached" | "auth_required" | "unknown";

function classifyError(message: string): DownloadError {
  const lower = message.toLowerCase();
  if (lower.includes("not available for download") || lower.includes("not downloadable")) return "not_downloadable";
  if (lower.includes("purchase") || lower.includes("upgrade to premium")) return "purchase_required";
  if (lower.includes("limit reached") || lower.includes("download limit")) return "limit_reached";
  if (lower.includes("unauthenticated") || lower.includes("login")) return "auth_required";
  return "unknown";
}

export function DownloadGate({ songId, songTitle, isFree, isDownloadable, isPurchased, price }: DownloadGateProps) {
  const { data: session } = useSession();
  const { data: subscription } = useMySubscription();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [showQualityPicker, setShowQualityPicker] = useState(false);
  const [gateType, setGateType] = useState<DownloadError>("unknown");

  const maxQualityKbps = subscription?.limits?.audio_quality_kbps ?? 128;

  function isQualityLocked(option: QualityOption): boolean {
    if (option.value === "flac") return maxQualityKbps < 320;
    const kbps = parseInt(option.value, 10);
    return kbps > maxQualityKbps;
  }

  function handleInitiateDownload() {
    if (!isDownloadable && !isPurchased) {
      setGateType("not_downloadable");
      setShowGate(true);
      return;
    }
    if (!session?.user) {
      setGateType("auth_required");
      setShowGate(true);
      return;
    }
    setShowQualityPicker(true);
  }

  async function handleDownload(quality: AudioQuality = "320") {
    setShowQualityPicker(false);
    setIsDownloading(true);
    try {
      const res = await apiPost<{
        success: boolean;
        download_url?: string;
        expires_at?: string;
        message?: string;
      }>(`/songs/${songId}/download`, { quality });

      if (res.download_url) {
        const ext = quality === "flac" ? "flac" : "mp3";
        const a = document.createElement("a");
        a.href = res.download_url;
        a.download = `${songTitle}.${ext}`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Downloading ${songTitle} (${quality === "flac" ? "FLAC" : quality + "kbps"})`);
      } else {
        toast.error(res.message || "Download failed");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Download failed");
      const errorType = classifyError(message);
      setGateType(errorType);
      setShowGate(true);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleInitiateDownload}
        disabled={isDownloading}
        className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
        title={!isDownloadable && !isPurchased ? "Not available for download" : isFree ? "Free download" : "Download"}
      >
        {isDownloading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : !isDownloadable && !isPurchased ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Download className="h-5 w-5" />
        )}
        <span className="text-xs">
          {!isDownloadable && !isPurchased ? "Locked" : "Download"}
        </span>
      </button>

      {/* Quality Picker */}
      {showQualityPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Music2 className="h-5 w-5" />
                Download Quality
              </h3>
              <button
                onClick={() => setShowQualityPicker(false)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose audio quality for &ldquo;{songTitle}&rdquo;
            </p>
            <div className="space-y-2">
              {qualityOptions.map((option) => {
                const locked = isQualityLocked(option);
                return (
                  <button
                    key={option.value}
                    onClick={() => !locked && handleDownload(option.value)}
                    disabled={locked}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors text-left ${
                      locked
                        ? 'opacity-50 cursor-not-allowed bg-muted/30'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        locked ? 'bg-muted' : option.premium ? 'bg-amber-500/10' : 'bg-primary/10'
                      }`}>
                        {locked ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : option.premium ? (
                          <Gem className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Download className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    {locked ? (
                      <Link
                        href="/pricing"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 shrink-0"
                      >
                        Upgrade
                      </Link>
                    ) : option.premium ? (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                        Premium
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Gate Dialog */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowGate(false)}
                className="p-1 rounded-full hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {gateType === "not_downloadable" && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">Not Available for Download</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  The artist has not enabled downloads for this song. You can still stream it.
                </p>
                <button
                  onClick={() => setShowGate(false)}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  Got it
                </button>
              </div>
            )}

            {gateType === "purchase_required" && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Purchase Required</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {price
                    ? `This song costs ${price.toLocaleString()} credits. Purchase it or upgrade to Premium for unlimited downloads.`
                    : "Purchase this song or upgrade to Premium to download it."}
                </p>
                <div className="space-y-2">
                  <Link
                    href="/settings/subscription"
                    className="block w-full py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-center hover:bg-primary/90 transition-colors"
                    onClick={() => setShowGate(false)}
                  >
                    <Crown className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                    Upgrade to Premium
                  </Link>
                  <button
                    onClick={() => setShowGate(false)}
                    className="w-full py-2.5 border rounded-full font-semibold hover:bg-muted transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            )}

            {gateType === "limit_reached" && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Download className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Download Limit Reached</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  You&apos;ve reached your daily download limit. Upgrade to Premium for unlimited downloads.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/settings/subscription"
                    className="block w-full py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-center hover:bg-primary/90 transition-colors"
                    onClick={() => setShowGate(false)}
                  >
                    <Crown className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                    Upgrade to Premium
                  </Link>
                  <button
                    onClick={() => setShowGate(false)}
                    className="w-full py-2.5 border rounded-full font-semibold hover:bg-muted transition-colors"
                  >
                    Try Again Tomorrow
                  </button>
                </div>
              </div>
            )}

            {gateType === "auth_required" && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Sign In Required</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Sign in to download songs to your device.
                </p>
                <Link
                  href="/access-required"
                  className="block w-full py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-center hover:bg-primary/90 transition-colors"
                  onClick={() => setShowGate(false)}
                >
                  Sign In
                </Link>
              </div>
            )}

            {gateType === "unknown" && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <Download className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Download Failed</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Something went wrong. Please try again later.
                </p>
                <button
                  onClick={() => setShowGate(false)}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
