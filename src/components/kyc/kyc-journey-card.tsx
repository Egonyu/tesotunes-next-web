"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { useKycStatus } from "@/hooks/useKyc";

/**
 * A gentle, always-present nudge on the dashboard for users who haven't finished
 * identity verification. Hidden once verified. Pairs with the weekly
 * `kyc:remind` notification so the journey is surfaced both passively and actively.
 */
export function KycJourneyCard() {
  const { status: authStatus } = useSession();
  const { data: kyc } = useKycStatus({ enabled: authStatus === "authenticated" });

  if (!kyc || kyc.status === "verified") return null;

  const required = kyc.requirements.required_document_types;
  const verifiedCount = required.filter(
    (r) => kyc.documents.find((d) => d.document_type === r.type)?.status === "verified",
  ).length;
  const pending = kyc.status === "pending_review";

  const Icon = pending ? Clock : ShieldAlert;
  const title = pending ? "Verification under review" : "Verify your identity";
  const blurb = pending
    ? "Your documents are in — we'll let you know once they're approved."
    : "Unlock withdrawals, payouts and seller payments. It only takes a few minutes.";

  return (
    <Link
      href="/verify"
      className="group flex items-center gap-4 rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50 to-background p-4 transition-colors hover:border-amber-400 dark:border-amber-500/30 dark:from-amber-950/30"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{blurb}</p>
        {!pending && required.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${(verifiedCount / required.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {verifiedCount}/{required.length}
            </span>
          </div>
        )}
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
        {pending ? "View" : "Verify"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
