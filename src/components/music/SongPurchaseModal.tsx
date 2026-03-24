"use client";

import { useEffect, useState } from "react";
import { Coins, Music, CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { usePurchaseSong, useSongPurchasePaymentStatus } from "@/hooks/api";
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
  const [paymentMethod, setPaymentMethod] = useState<"platform_credits" | "zengapay">("platform_credits");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pendingReference, setPendingReference] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    payment?: {
      id: number;
      reference: string;
      status: string;
      amount: number;
      currency: string;
    };
    distribution?: {
      artist_name?: string;
      artist_percentage: number;
      platform_percentage: number;
      artist_amount: number;
      platform_amount: number;
    };
    benefits?: {
      download_access: boolean;
      loyalty_points_awarded?: number;
      loyalty_points_balance?: number | null;
    };
    artist_wallet?: {
      current_balance: number;
    };
  } | null>(null);

  const { data: balance } = useCreditBalance();

  const purchaseMutation = usePurchaseSong();
  const paymentStatusQuery = useSongPurchasePaymentStatus(songId, pendingReference, {
    enabled: !!pendingReference,
    refetchInterval: 3000,
  });

  const hasEnoughCredits = (balance?.credits ?? 0) >= price;
  const needsPhone = paymentMethod === "zengapay";
  const hasValidPhone = phoneNumber.trim().length >= 9;

  useEffect(() => {
    if (!pendingReference || !paymentStatusQuery.data) return;

    const status = paymentStatusQuery.data.data.status;
    if (status === "completed") {
      setPendingReference(null);
      setPurchased(true);
      toast.success(`"${songTitle}" purchased! Download access is now active.`);
      onPurchased?.();
      return;
    }

    if (status === "failed" || status === "cancelled" || status === "refunded") {
      setPendingReference(null);
      toast.error(paymentStatusQuery.data.data.message || "Payment failed. Please try again.");
    }
  }, [pendingReference, paymentStatusQuery.data, songTitle, onPurchased]);

  function handlePurchase() {
    const payload =
      paymentMethod === "platform_credits"
        ? { payment_method: "platform_credits" as const }
        : { payment_method: "zengapay" as const, phone_number: phoneNumber.trim() };

    purchaseMutation.mutate({
      songId,
      payload,
    }, {
      onSuccess: (res) => {
        const status = res.data?.payment_status;

        if (status === "processing" && res.data?.payment_reference) {
          setPendingReference(res.data.payment_reference);
          toast.info(res.message || "Payment initiated. Approve on your phone.");
          return;
        }

        setPurchased(true);
        setReceipt(res.data ?? null);
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
    setPaymentMethod("platform_credits");
    setPhoneNumber("");
    setPendingReference(null);
    setReceipt(null);
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

              {receipt && (
                <div className="mb-5 rounded-xl border bg-muted/40 p-3 text-left space-y-2">
                  {receipt.payment && (
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">Payment #{receipt.payment.reference}</p>
                      <p className="text-muted-foreground">
                        {receipt.payment.currency} {formatNumber(receipt.payment.amount)}
                      </p>
                    </div>
                  )}

                  {receipt.distribution && (
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">Revenue Split</p>
                      <p className="text-muted-foreground">
                        Artist ({receipt.distribution.artist_percentage}%): {formatNumber(receipt.distribution.artist_amount)}
                      </p>
                      <p className="text-muted-foreground">
                        Platform ({receipt.distribution.platform_percentage}%): {formatNumber(receipt.distribution.platform_amount)}
                      </p>
                    </div>
                  )}

                  {receipt.benefits && (
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">Buyer Benefits</p>
                      <p className="text-muted-foreground">
                        Download Access: {receipt.benefits.download_access ? "Granted" : "Pending"}
                      </p>
                      {typeof receipt.benefits.loyalty_points_awarded === "number" && (
                        <p className="text-muted-foreground">
                          Loyalty Points: +{formatNumber(receipt.benefits.loyalty_points_awarded)}
                          {typeof receipt.benefits.loyalty_points_balance === "number"
                            ? ` (Balance: ${formatNumber(receipt.benefits.loyalty_points_balance)})`
                            : ""}
                        </p>
                      )}
                    </div>
                  )}

                  {receipt.artist_wallet && (
                    <div className="text-xs text-muted-foreground">
                      Artist Wallet Balance: {formatNumber(receipt.artist_wallet.current_balance)}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : pendingReference ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-bold mb-2">Waiting for Payment</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Approve the ZengaPay prompt on your phone.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Ref: {pendingReference}
              </p>

              {paymentStatusQuery.data?.data?.status && (
                <div className="mb-5 rounded-xl border bg-muted/40 p-3 text-left">
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-semibold text-foreground capitalize">{paymentStatusQuery.data.data.status}</span>
                  </p>
                  {paymentStatusQuery.data.data.message && (
                    <p className="text-xs text-muted-foreground mt-1">{paymentStatusQuery.data.data.message}</p>
                  )}
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 border rounded-xl font-semibold hover:bg-muted transition-colors"
              >
                Close
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("platform_credits")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === "platform_credits"
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    Credits
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("zengapay")}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      paymentMethod === "zengapay"
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    ZengaPay
                  </button>
                </div>

                {needsPhone && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">ZengaPay Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 2567XXXXXXXX"
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-bold flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    {formatNumber(price)} Credits
                  </span>
                </div>
                {paymentMethod === "platform_credits" && (
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
                )}
              </div>

              {paymentMethod === "platform_credits" && !hasEnoughCredits && (
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
                  disabled={(paymentMethod === "platform_credits" && !hasEnoughCredits) || (needsPhone && !hasValidPhone) || purchaseMutation.isPending}
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
