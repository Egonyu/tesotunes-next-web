"use client";

import { useState } from "react";
import { Heart, Coins, CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { useSendTip } from "@/hooks/api";
import { useCreditBalance } from "@/hooks/usePayments";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

interface TipModalProps {
  open: boolean;
  onClose: () => void;
  recipientId: number;
  recipientType: "artist" | "song";
  recipientName: string;
}

const TIP_PRESETS = [10, 50, 100, 500, 1000];

export function TipModal({
  open,
  onClose,
  recipientId,
  recipientType,
  recipientName,
}: TipModalProps) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const { data: balance } = useCreditBalance();

  const tipMutation = useSendTip();

  const activeAmount = customAmount ? parseInt(customAmount) || 0 : amount;
  const hasEnoughCredits = (balance?.credits ?? 0) >= activeAmount && activeAmount > 0;

  function handleSend() {
    if (activeAmount <= 0) return;
    tipMutation.mutate(
      {
        recipient_id: recipientId,
        recipient_type: recipientType,
        amount: activeAmount,
        message: message.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          setSent(true);
          toast.success(res.message || `Tip of ${activeAmount} credits sent!`);
        },
        onError: (error) => {
          const msg =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || "Failed to send tip. Please try again.";
          toast.error(msg);
        },
      }
    );
  }

  function handleClose() {
    setSent(false);
    setAmount(50);
    setCustomAmount("");
    setMessage("");
    tipMutation.reset();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tip Sent!</h3>
              <p className="text-muted-foreground mb-6">
                {formatNumber(activeAmount)} credits sent to {recipientName}
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold mb-1">Send a Tip</h3>
                <p className="text-sm text-muted-foreground">
                  Support {recipientName} with credits
                </p>
              </div>

              {/* Preset amounts */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {TIP_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount("");
                    }}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      !customAmount && amount === preset
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-4">
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    placeholder="Custom amount"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Optional message */}
              <div className="mb-4">
                <textarea
                  placeholder="Add a message (optional)"
                  maxLength={200}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/50 border rounded-lg text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between p-3 mb-4 bg-muted/50 rounded-lg text-sm">
                <span className="text-muted-foreground">Your Balance</span>
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    hasEnoughCredits ? "text-green-500" : "text-destructive"
                  }`}
                >
                  <Coins className="h-4 w-4" />
                  {formatNumber(balance?.credits ?? 0)}
                </span>
              </div>

              {!hasEnoughCredits && activeAmount > 0 && (
                <div className="flex items-start gap-2 p-3 mb-4 bg-destructive/10 rounded-lg text-sm">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-destructive font-medium">Insufficient credits</p>
                    <p className="text-muted-foreground">
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

              {tipMutation.isError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Failed to send tip. Please try again.</span>
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
                  onClick={handleSend}
                  disabled={!hasEnoughCredits || activeAmount <= 0 || tipMutation.isPending}
                  className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {tipMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4" />
                      Send {activeAmount > 0 ? formatNumber(activeAmount) : ""} Credits
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
