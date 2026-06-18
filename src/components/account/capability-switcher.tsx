"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Mic2, Megaphone, Store, Calendar, Disc3 } from "lucide-react";
import { useCapabilities, type CapabilityName, type CapabilityPosture } from "@/hooks/useCapabilities";
import { cn } from "@/lib/utils";

/**
 * One account, many hats: shows what this account can do today and the next
 * step for each mode. Consumes GET /capabilities.
 */

const CAPABILITY_META: Record<
  CapabilityName,
  { icon: typeof Mic2; blurb: string; dashboardHref: string; applyHref: string | null; applyLabel: string }
> = {
  artist: {
    icon: Mic2,
    blurb: "Upload music, see analytics, get paid for plays.",
    dashboardHref: "/artist",
    applyHref: "/become-artist",
    applyLabel: "Become an artist",
  },
  seller: {
    icon: Store,
    blurb: "Open a shop and sell merch or products.",
    dashboardHref: "/artist/store",
    applyHref: "/store/shops",
    applyLabel: "Open a shop",
  },
  organizer: {
    icon: Calendar,
    blurb: "Create events and sell tickets.",
    dashboardHref: "/artist/events",
    applyHref: "/become-organizer",
    applyLabel: "Become an organizer",
  },
  promoter: {
    icon: Megaphone,
    blurb: "Earn by promoting music to your following.",
    dashboardHref: "/artist/promotions",
    applyHref: "/become-promoter",
    applyLabel: "Become a promoter",
  },
  label: {
    icon: Disc3,
    blurb: "Manage multiple artists under one roof.",
    dashboardHref: "/artist",
    applyHref: null,
    applyLabel: "Coming soon",
  },
};

function StatusChip({ status }: { status: CapabilityPosture["status"] }) {
  if (status === "granted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
        <BadgeCheck className="h-3 w-3" /> Active
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
        <Clock3 className="h-3 w-3" /> Under review
      </span>
    );
  }

  if (status === "rejected" || status === "suspended" || status === "revoked") {
    return (
      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive capitalize">
        {status}
      </span>
    );
  }

  return null;
}

export function CapabilitySwitcher() {
  const { data: capabilities, isLoading } = useCapabilities();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (!capabilities?.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {capabilities.map((posture) => {
        const meta = CAPABILITY_META[posture.capability];
        if (!meta) return null;

        const Icon = meta.icon;
        const isGranted = posture.status === "granted";
        const isPending = posture.status === "pending";
        const href = isGranted ? meta.dashboardHref : meta.applyHref;

        const inner = (
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isGranted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{posture.label}</p>
                <StatusChip status={posture.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {posture.status === "rejected" && posture.status_reason
                  ? posture.status_reason
                  : meta.blurb}
              </p>
            </div>
            {href && !isPending && (
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                {isGranted ? "Open" : posture.status === "rejected" ? "Re-apply" : meta.applyLabel}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </div>
        );

        return href && !isPending ? (
          <Link key={posture.capability} href={href} className="block">
            {inner}
          </Link>
        ) : (
          <div key={posture.capability}>{inner}</div>
        );
      })}
    </div>
  );
}
