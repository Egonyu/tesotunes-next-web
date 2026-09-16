"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { useDeliverOrder, useMyPromotionOrder, useRejectOrder } from "@/hooks/usePromotions";
import { OrderStatusBadge } from "@/components/promotions";
import { getPromotionProofGuide } from "@/lib/promotions-proof";
import type { PromotionOrder } from "@/types/promotions";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Where the order sits in the promoter → buyer → wallet flow. */
function stepsFor(order: PromotionOrder) {
  const proofSent = order.verification.status === "submitted" || order.verification.status === "verified";
  const accepted = order.status === "completed";

  return [
    { label: "Paid into escrow", done: true, date: order.created_at },
    { label: "Proof sent", done: proofSent, date: order.verification.submitted_at },
    { label: "Buyer accepted", done: accepted, date: order.verification.verified_at ?? order.completed_at },
    { label: "Paid to wallet", done: accepted, date: null, note: accepted ? "After the dispute hold" : null },
  ];
}

export default function PromoterOrderPage() {
  const params = useParams();
  const orderId = Number(params.orderId);
  const { data: order, isLoading } = useMyPromotionOrder(orderId);
  const deliver = useDeliverOrder(orderId);
  const reject = useRejectOrder(orderId);

  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [extraLinks, setExtraLinks] = useState<string[]>([]);
  const [editingProof, setEditingProof] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Link href="/promoter/orders" className="mt-3 inline-block text-sm text-primary underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const proofGuide = getPromotionProofGuide(order.promotion.platform, order.promotion.type);
  const isClosed = order.status === "completed" || order.payment_status === "refunded";
  const disputeOpen = order.dispute.is_disputed && order.dispute.state !== "resolved";
  const proofSent = order.verification.status === "submitted";
  const showProofForm = !isClosed && !disputeOpen && (!proofSent || editingProof);
  const cleanLinks = extraLinks.map((link) => link.trim()).filter(Boolean);
  const proofValid = isHttpUrl(deliveryUrl.trim()) && cleanLinks.every(isHttpUrl);

  const startEditing = () => {
    setDeliveryUrl(order.verification.verification_url ?? "");
    setDeliveryNotes(order.verification.verification_notes ?? "");
    setExtraLinks(order.verification.verification_files ?? []);
    setEditingProof(true);
  };

  const submitProof = () => {
    deliver.mutate(
      {
        delivery_url: deliveryUrl.trim(),
        delivery_notes: deliveryNotes.trim() || undefined,
        delivery_files: cleanLinks.length ? cleanLinks : undefined,
      },
      { onSuccess: () => setEditingProof(false) },
    );
  };

  return (
    <div className="space-y-5 pb-8">
      <Link
        href="/promoter/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Orders
      </Link>

      {/* Summary */}
      <section className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
            {order.promotion.featured_image_url ? (
              <Image src={order.promotion.featured_image_url} alt="" fill className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="font-mono text-xs text-muted-foreground">{order.order_number}</span>
            </div>
            <h1 className="mt-1 text-lg font-bold leading-tight sm:text-2xl">{order.promotion.title}</h1>
            <p className="text-sm text-muted-foreground">
              For {order.buyer?.name ?? "a buyer"} · {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Order value</p>
            <p className="mt-1 font-semibold">
              {order.total_ugx > 0 ? formatCurrency(order.total_ugx) : `${formatNumber(order.total_credits)} credits`}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Deliver by</p>
            <p className="mt-1 font-semibold">{formatDate(order.expected_delivery_at)}</p>
          </div>
          <div className="col-span-2 rounded-xl bg-muted/50 p-3 sm:col-span-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Paid by</p>
            <p className="mt-1 font-semibold capitalize">{order.payment_method}</p>
          </div>
        </div>

        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stepsFor(order).map((step) => (
            <li
              key={step.label}
              className={cn(
                "flex items-start gap-2 rounded-xl px-3 py-2 text-xs",
                step.done
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-muted/60 text-muted-foreground",
              )}
            >
              {step.done ? <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
              <span>
                <span className="block font-medium">{step.label}</span>
                {step.date ? <span className="opacity-80">{formatDate(step.date)}</span> : null}
                {step.note ? <span className="opacity-80">{step.note}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {order.notes && (
        <section className="rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-semibold">Buyer&apos;s brief</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{order.notes}</p>
        </section>
      )}

      {disputeOpen && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold">The buyer opened a dispute</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{order.dispute.reason || order.dispute.dispute_reason}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Payment is on hold until an admin reviews the proof and the dispute.
          </p>
          {order.dispute.evidence_url ? (
            <a
              href={order.dispute.evidence_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Buyer&apos;s evidence <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Proof */}
        <section className="rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="text-base font-semibold">Proof of delivery</h2>

          {proofSent && !editingProof && (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                Sent{order.verification.submitted_at ? ` ${formatDate(order.verification.submitted_at)}` : ""}. The buyer is reviewing it
                {order.verification.auto_release_at
                  ? ` — if they don't respond, you're paid automatically after ${formatDate(order.verification.auto_release_at)}.`
                  : "."}
              </div>
              {order.verification.verification_url && (
                <a
                  href={order.verification.verification_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 break-all text-sm font-medium text-primary hover:underline"
                >
                  {order.verification.verification_url}
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              )}
              {order.verification.verification_files.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block break-all text-sm text-primary hover:underline"
                >
                  {link}
                </a>
              ))}
              {order.verification.verification_notes && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">{order.verification.verification_notes}</p>
              )}
              {!disputeOpen && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Update proof
                </button>
              )}
            </div>
          )}

          {order.status === "completed" && (
            <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              Accepted. Your share moves to your wallet once the short dispute hold ends.{" "}
              <Link href="/wallet" className="font-medium underline">
                Open wallet
              </Link>
            </div>
          )}

          {order.payment_status === "refunded" && (
            <div className="mt-3 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              This order was refunded to the buyer{order.verification.rejection_reason ? `: ${order.verification.rejection_reason}` : "."}
            </div>
          )}

          {showProofForm && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">{proofGuide.promoterPrompt}</p>
              <label className="block">
                <span className="text-sm font-medium">Link to the promotion</span>
                <input
                  type="url"
                  inputMode="url"
                  value={deliveryUrl}
                  onChange={(event) => setDeliveryUrl(event.target.value)}
                  placeholder="https://"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
                />
              </label>

              {extraLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    inputMode="url"
                    value={link}
                    onChange={(event) =>
                      setExtraLinks((links) => links.map((value, i) => (i === index ? event.target.value : value)))
                    }
                    placeholder="Screenshot or insights link"
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
                  />
                  <button
                    type="button"
                    aria-label="Remove link"
                    onClick={() => setExtraLinks((links) => links.filter((_, i) => i !== index))}
                    className="rounded-lg border px-3 text-muted-foreground hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {extraLinks.length < 10 && (
                <button
                  type="button"
                  onClick={() => setExtraLinks((links) => [...links, ""])}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add a screenshot or stats link
                </button>
              )}

              <label className="block">
                <span className="text-sm font-medium">Notes for the buyer</span>
                <textarea
                  value={deliveryNotes}
                  onChange={(event) => setDeliveryNotes(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="When it went live, reach so far, anything the buyer should know"
                  className="mt-1 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={submitProof}
                  disabled={!proofValid || deliver.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {deliver.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send proof to buyer
                </button>
                {editingProof && (
                  <button
                    type="button"
                    onClick={() => setEditingProof(false)}
                    className="rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border bg-card p-4 sm:p-5">
            <h2 className="text-sm font-semibold">{proofGuide.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Good proof includes:</p>
            <ul className="mt-3 space-y-2">
              {proofGuide.proofExamples.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {!isClosed && (
            <section className="rounded-2xl border bg-card p-4 sm:p-5">
              <h2 className="text-sm font-semibold">Can&apos;t deliver?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Decline the order and the buyer gets their money back straight away.
              </p>
              {!showRejectForm ? (
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" />
                  Decline and refund
                </button>
              ) : (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder="Tell the buyer why"
                    rows={3}
                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        reject.mutate({ reason: rejectReason.trim() }, { onSuccess: () => setShowRejectForm(false) })
                      }
                      disabled={!rejectReason.trim() || reject.isPending}
                      className="rounded-lg bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60"
                    >
                      {reject.isPending ? "Refunding…" : "Refund buyer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Keep order
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
