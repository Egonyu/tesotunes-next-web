"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2, Lock, Crown, ShoppingCart, X } from "lucide-react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface DownloadGateProps {
  songId: number;
  songTitle: string;
  isFree: boolean;
  isDownloadable: boolean;
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

export function DownloadGate({ songId, songTitle, isFree, isDownloadable, price }: DownloadGateProps) {
  const { data: session } = useSession();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [gateType, setGateType] = useState<DownloadError>("unknown");

  async function handleDownload() {
    // Client-side pre-check: not downloadable at all
    if (!isDownloadable) {
      setGateType("not_downloadable");
      setShowGate(true);
      return;
    }

    // Must be signed in
    if (!session?.user) {
      setGateType("auth_required");
      setShowGate(true);
      return;
    }

    setIsDownloading(true);
    try {
      const res = await apiPost<{
        success: boolean;
        download_url?: string;
        message?: string;
      }>(`/v1/songs/${songId}/download`);

      if (res.download_url) {
        // Trigger browser download
        const a = document.createElement("a");
        a.href = res.download_url;
        a.download = `${songTitle}.mp3`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Download started!");
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
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
        title={!isDownloadable ? "Not available for download" : isFree ? "Free download" : "Download"}
      >
        {isDownloading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : !isDownloadable ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Download className="h-5 w-5" />
        )}
        <span className="text-xs">
          {!isDownloadable ? "N/A" : "Download"}
        </span>
      </button>

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