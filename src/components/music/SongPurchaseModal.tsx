"use client";

import { useState } from "react";
import { Coins, Music, CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { usePurchaseSong } from "@/hooks/api";
import { useCreditBalance } from "@/hooks/usePayments";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

interface SongPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  songId: number;
  songTitle: string;
  artistName: string;
  price: number;
  artworkUrl?: string | null;
  onPurchased?: () => void;
}

export function SongPurchaseModal({
  open,
  onClose,
  songId,
  songTitle,
  artistName,
  price,
  onPurchased,
}: SongPurchaseModalProps) {
  const [purchased, setPurchased] = useState(false);

  const { data: balance } = useCreditBalance();

  const purchaseMutation = usePurchaseSong();

  const hasEnoughCredits = (balance?.credits ?? 0) >= price;

  function handlePurchase() {
    purchaseMutation.mutate(songId, {
      onSuccess: (res) => {
        setPurchased(true);
        toast.success(res.message || `"${songTitle}" purchased!`);
        onPurchased?.();
      },
      onError: (error) => {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Purchase failed. Please try again.";
        toast.error(msg);
      },
    });
  }

  function handleClose() {
    setPurchased(false);
    purchaseMutation.reset();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {purchased ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Purchase Complete!</h3>
              <p className="text-muted-foreground mb-1">
                &ldquo;{songTitle}&rdquo; is now yours.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You can now download and listen offline.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* Purchase form */
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Music className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-1">Purchase Song</h3>
                <p className="text-sm text-muted-foreground">
                  &ldquo;{songTitle}&rdquo; by {artistName}
                </p>
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-bold flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    {formatNumber(price)} Credits
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Your Balance</span>
                  <span
                    className={`font-bold flex items-center gap-1.5 ${
                      hasEnoughCredits ? "text-green-500" : "text-destructive"
                    }`}
                  >
                    <Coins className="h-4 w-4" />
                    {formatNumber(balance?.credits ?? 0)} Credits
                  </span>
                </div>
              </div>

              {!hasEnoughCredits && (
                <div className="flex items-start gap-2 p-3 mb-4 bg-destructive/10 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-destructive font-medium">Insufficient credits</p>
                    <p className="text-muted-foreground">
                      You need {formatNumber(price - (balance?.credits ?? 0))} more credits.{" "}
                      <Link
                        href="/credits"
                        className="text-primary hover:underline"
                        onClick={handleClose}
                      >
                        Buy Credits
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {purchaseMutation.isError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Purchase failed. Please try again.</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 border rounded-xl font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={!hasEnoughCredits || purchaseMutation.isPending}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchaseMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
