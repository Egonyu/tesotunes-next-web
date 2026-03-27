"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Coins,
  Loader2,
  Megaphone,
  Radio,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { usePromotions } from "@/hooks/usePromotions";
import { usePromotionsStore } from "@/stores/promotions";
import {
  PromotionCard,
  PromotionFilters,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";
import {
  promotionsAuditTasks,
  promotionsDocumentationSources,
  promotionsIntegrations,
  promotionsKeyFindings,
  promotionsMockMetrics,
  promotionsOfferLanes,
  type DeliveryStatus,
} from "@/data/promotions-audit";

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "mock-backed": "border-sky-200 bg-sky-50 text-sky-700",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  live: "Live",
  "mock-backed": "Mock-backed",
  partial: "Partial",
  blocked: "Blocked",
};

function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function PromotionsBrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilter } = usePromotionsStore();
  const { data, isLoading, isError } = usePromotions(filters);

  const selectedEvent = useMemo(() => {
    if (searchParams.get("target_type") !== "event") {
      return null;
    }

    const id = Number(searchParams.get("event_id"));
    const title = searchParams.get("event_name");

    if (!id || !title) {
      return null;
    }

    return {
      id,
      title,
      slug: searchParams.get("event_slug"),
      startsAt: searchParams.get("event_starts_at"),
      venue: searchParams.get("event_venue"),
      city: searchParams.get("event_city"),
    };
  }, [searchParams]);

  const promotionDetailSuffix = useMemo(() => {
    if (!selectedEvent) {
      return "";
    }

    const params = new URLSearchParams();
    params.set("target_type", "event");
    params.set("event_id", String(selectedEvent.id));
    params.set("event_name", selectedEvent.title);

    if (selectedEvent.slug) {
      params.set("event_slug", selectedEvent.slug);
    }

    if (selectedEvent.startsAt) {
      params.set("event_starts_at", selectedEvent.startsAt);
    }

    if (selectedEvent.venue) {
      params.set("event_venue", selectedEvent.venue);
    }

    if (selectedEvent.city) {
      params.set("event_city", selectedEvent.city);
    }

    return `?${params.toString()}`;
  }, [selectedEvent]);

  const clearEventContext = () => {
    router.replace("/promotions");
  };

  const completedTasks = promotionsAuditTasks.filter(
    (task) => task.status === "completed"
  );
  const todoTasks = promotionsAuditTasks.filter((task) => task.status === "todo");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <section className="overflow-hidden rounded-[2rem] border bg-card">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_26%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Promotions as a Service
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Megaphone className="h-6 w-6 text-orange-200" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Promotions marketplace, audit, and delivery tracker
                    </h1>
                    <p className="text-sm text-white/70">
                      {selectedEvent
                        ? `Running in event campaign mode for ${selectedEvent.title}.`
                        : "One working surface for influencers, DJs, radio, artists, SACCO funding, store linkage, and commission readiness."}
                    </p>
                  </div>
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-white/78">
                The docs already describe a full two-sided promotions economy, but local dev still spans live routes, placeholder APIs, and roadmap-only integrations. This page now tracks what is completed, what is still todo, and which related surfaces are safe to use today.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[26rem]">
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Tracker</p>
                <p className="mt-2 text-3xl font-semibold">
                  {promotionsMockMetrics.completedTasks}
                  <span className="text-lg text-white/55"> / {promotionsAuditTasks.length}</span>
                </p>
                <p className="mt-1 text-sm text-white/70">Completed workstreams visible today</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Commission</p>
                <p className="mt-2 text-3xl font-semibold">
                  {promotionsMockMetrics.commissionSplit.platform}%
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Platform fee mock for promotions, with {promotionsMockMetrics.commissionSplit.promoter}% to the promoter
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
              <div className="flex items-center gap-2 text-sm text-white/75">
                <Users className="h-4 w-4" />
                Offer lanes
              </div>
              <p className="mt-2 text-2xl font-semibold">{promotionsMockMetrics.activePromoterLanes}</p>
              <p className="mt-1 text-sm text-white/60">Influencers, DJs, radio, and artist-led campaigns</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
              <div className="flex items-center gap-2 text-sm text-white/75">
                <ShoppingBag className="h-4 w-4" />
                Live bridges
              </div>
              <p className="mt-2 text-2xl font-semibold">{promotionsMockMetrics.liveIntegrationSurfaces}</p>
              <p className="mt-1 text-sm text-white/60">Storefront and wallet surfaces already usable</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
              <div className="flex items-center gap-2 text-sm text-white/75">
                <CircleAlert className="h-4 w-4" />
                Blockers
              </div>
              <p className="mt-2 text-2xl font-semibold">{promotionsMockMetrics.blockedWorkstreams}</p>
              <p className="mt-1 text-sm text-white/60">Contract drifts currently stopping end-to-end parity</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
              <div className="flex items-center gap-2 text-sm text-white/75">
                <Clock3 className="h-4 w-4" />
                Todo queue
              </div>
              <p className="mt-2 text-2xl font-semibold">{promotionsMockMetrics.todoTasks}</p>
              <p className="mt-1 text-sm text-white/60">Backend and shared integration tasks still outstanding</p>
            </div>
          </div>
        </div>
      </section>

      {selectedEvent && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Event Promotion Mode
              </p>
              <h2 className="text-lg font-semibold">{selectedEvent.title}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.venue || "Venue pending"}
                {selectedEvent.city ? ` · ${selectedEvent.city}` : ""}
                {selectedEvent.startsAt ? ` · ${selectedEvent.startsAt}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={clearEventContext}
              className="rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Browse all promotions
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
        <div className="rounded-3xl border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Audit Tracker
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Completed vs todo</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A truth-based tracker stitched from the docs, the current page inventory, and the Laravel controller audit.
              </p>
            </div>
            <div className="rounded-3xl bg-muted/50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Progress</p>
              <p className="text-3xl font-semibold">
                {completedTasks.length}
                <span className="text-lg text-muted-foreground">/{promotionsAuditTasks.length}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </div>
              <div className="mt-4 space-y-3">
                {completedTasks.map((task) => (
                  <div key={task.title} className="rounded-2xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Clock3 className="h-4 w-4" />
                Todo
              </div>
              <div className="mt-4 space-y-3">
                {todoTasks.map((task) => (
                  <div key={task.title} className="rounded-2xl bg-white/80 p-3">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Offer Map
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Who promotions serve</h2>
          <div className="mt-5 space-y-3">
            {promotionsOfferLanes.map((lane) => (
              <div key={lane.title} className="rounded-2xl border bg-background/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{lane.title}</p>
                  <DeliveryBadge status={lane.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{lane.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
            Mock operating model: artists buy with wallet funds or credits, promoters complete external deliverables, the platform holds an 18% commission, and seller/admin dashboards close the loop once backend workflows are finished.
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-3xl border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Integrations
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Cross-module handoff</h2>
          <div className="mt-5 space-y-3">
            {promotionsIntegrations.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-start justify-between gap-4 rounded-2xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/20"
              >
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DeliveryBadge status={item.status} />
                  <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Findings
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Main gaps from the audit</h2>
          <div className="mt-5 space-y-3">
            {promotionsKeyFindings.map((finding) => (
              <div key={finding.title} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{finding.title}</p>
                  <DeliveryBadge status={finding.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{finding.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Coins className="h-3.5 w-3.5" />
                Commission
              </div>
              <p className="mt-2 text-sm font-semibold">Store and promotions still need one payout source of truth.</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Radio className="h-3.5 w-3.5" />
                Proof
              </div>
              <p className="mt-2 text-sm font-semibold">Radio and DJ offers need stronger verification payloads than current placeholder endpoints.</p>
            </div>
            <div className="rounded-2xl bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                Funding
              </div>
              <p className="mt-2 text-sm font-semibold">Wallet and SACCO paths exist, but campaign-specific financing rules are not yet connected.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Docs Inventory
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Scattered documentation, now consolidated here</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            These are the main source documents behind the current implementation and gap analysis.
          </p>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {promotionsDocumentationSources.map((source) => (
            <div key={source.path} className="rounded-2xl border p-4">
              <p className="font-semibold">{source.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{source.summary}</p>
              <p className="mt-3 break-all text-xs text-muted-foreground">{source.path}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <PromotionFilters />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Marketplace Feed
            </p>
            <h2 className="text-2xl font-semibold">Live browse results</h2>
            <p className="text-sm text-muted-foreground">
              This remains connected to the current promotions API surface so local dev still has a real browse experience underneath the audit tracker.
            </p>
          </div>
        </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <PromotionsEmptyState
          title="Something went wrong"
          description="Failed to load promotions. Please try again later."
        />
      ) : !data?.data?.length ? (
        <PromotionsEmptyState />
      ) : (
        <>
          {/* Count */}
          <p className="text-sm text-muted-foreground">
            {data.meta.total} promotion{data.meta.total !== 1 ? "s" : ""} found
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.data.map((promo) => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                href={`/promotions/${promo.slug}${promotionDetailSuffix}`}
              />
            ))}
          </div>

          {/* Pagination */}
          <PromotionsPagination
            currentPage={data.meta.current_page}
            lastPage={data.meta.last_page}
            onPageChange={(page) => setFilter("page", page)}
          />
        </>
      )}
      </section>
    </div>
  );
}
