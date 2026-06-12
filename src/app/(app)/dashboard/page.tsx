"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Loader2,
  Wallet,
  Coins,
  Megaphone,
  Star,
  BadgeCheck,
  ShoppingBag,
  Briefcase,
  Send,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";
import { cn, formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  useActivityHubSummary,
  useActivityHubOrders,
  useActivityHubOpportunities,
  useActivityHubApplications,
  useActivityHubEarnings,
} from "@/hooks/usePromotionsV2";
import type {
  PromotionOpportunityV2,
  PromotionApplicationV2,
  PromoterTier,
  OpportunityStatus,
  ApplicationStatus,
} from "@/types/promotions-v2";
import {
  PROMOTER_TIER_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  APPLICATION_STATUS_LABELS,
} from "@/types/promotions-v2";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.round(diff / 86400)}d ago`;
  return formatDate(iso);
}

const TIER_COLORS: Record<PromoterTier, string> = {
  starter: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  rising: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  established:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  elite:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const OPP_STATUS_COLORS: Record<OpportunityStatus, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-800",
  open: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  reviewing:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  awarded:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  closed: "bg-slate-100 text-slate-600 dark:bg-slate-800",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const APP_STATUS_COLORS: Record<ApplicationStatus, string> = {
  submitted:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shortlisted:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  awarded:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-slate-100 text-slate-600 dark:bg-slate-800",
};

// ---------------------------------------------------------------------------
// Reusable small components
// ---------------------------------------------------------------------------

function StatusPill({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass
      )}
    >
      {label}
    </span>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 flex items-start gap-4">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          accent ?? "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold truncate">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function ActionBadge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-primary">{count}</span>
    </div>
  );
}

function EmptySlate({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-16 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab content components (each mounts only when its tab is active)
// ---------------------------------------------------------------------------

function OrdersTab() {
  const { data, isLoading, isError } = useActivityHubOrders();
  const orders = (data?.data ?? []) as Record<string, unknown>[];

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  if (isError)
    return (
      <EmptySlate
        icon={AlertCircle}
        title="Could not load orders"
        description="Check your connection and try refreshing."
      />
    );

  if (orders.length === 0)
    return (
      <EmptySlate
        icon={ShoppingBag}
        title="No orders yet"
        description="Your promotion purchases will appear here."
        action={
          <Link
            href="/promotions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Browse the marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );

  return (
    <div className="space-y-3">
      {orders.map((order, i) => {
        const num = String(order.order_number ?? order.id ?? i + 1);
        const status = String(order.status ?? "");
        const created = String(order.created_at ?? "");
        const ugx = Number(order.total_ugx ?? order.paid_ugx ?? 0);
        const credits = Number(order.total_credits ?? order.paid_credits ?? 0);
        return (
          <div
            key={num}
            className="flex items-center justify-between rounded-xl border bg-card/70 px-4 py-3 gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Order #{num}</p>
              {created && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {relativeTime(created)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {(ugx > 0 || credits > 0) && (
                <span className="text-sm font-semibold">
                  {ugx > 0 ? formatCurrency(ugx) : `${formatNumber(credits)} cr`}
                </span>
              )}
              {status && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                  {status.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
        );
      })}

      <div className="pt-2 flex justify-end">
        <Link
          href="/promotions/purchases"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all orders
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function OpportunitiesTab() {
  const { data, isLoading, isError } = useActivityHubOpportunities();
  const opps: PromotionOpportunityV2[] = data?.data ?? [];

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  if (isError)
    return (
      <EmptySlate
        icon={AlertCircle}
        title="Could not load opportunities"
        description="Refresh the page to try again."
      />
    );

  if (opps.length === 0)
    return (
      <EmptySlate
        icon={Briefcase}
        title="No opportunities posted"
        description="Artists can post opportunities to find promoters for their tracks."
        action={
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Browse feed
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );

  return (
    <div className="space-y-3">
      {opps.map((opp) => (
        <div
          key={opp.uuid}
          className="rounded-xl border bg-card/70 px-4 py-4 space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{opp.title}</p>
              {opp.promotable && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {opp.promotable.title ?? opp.promotable.name}
                </p>
              )}
            </div>
            <StatusPill
              label={OPPORTUNITY_STATUS_LABELS[opp.status]}
              colorClass={OPP_STATUS_COLORS[opp.status]}
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{opp.application_count} applicant{opp.application_count !== 1 ? "s" : ""}</span>
            {opp.deadline_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Due {formatDate(opp.deadline_at)}
              </span>
            )}
            {(opp.budget_min_ugx > 0 || opp.budget_max_ugx > 0) && (
              <span>
                {formatCurrency(opp.budget_min_ugx)}
                {opp.budget_max_ugx > 0 &&
                  opp.budget_max_ugx !== opp.budget_min_ugx &&
                  ` – ${formatCurrency(opp.budget_max_ugx)}`}
              </span>
            )}
          </div>

          {opp.application_count > 0 && opp.status === "open" && (
            <Link
              href={`/opportunities/${opp.uuid}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Review applications
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      ))}

      <div className="pt-2 flex justify-end">
        <Link
          href="/opportunities/my/posted"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function ApplicationsTab({ isPromoter }: { isPromoter: boolean }) {
  const { data, isLoading, isError } = useActivityHubApplications();
  const apps: PromotionApplicationV2[] = data?.data ?? [];

  if (!isPromoter)
    return (
      <EmptySlate
        icon={Send}
        title="You're not a promoter yet"
        description="Set up your promoter profile to apply to opportunities from artists."
        action={
          <Link
            href="/become-promoter"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Become a Promoter
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  if (isError)
    return (
      <EmptySlate
        icon={AlertCircle}
        title="Could not load applications"
        description="Refresh the page to try again."
      />
    );

  if (apps.length === 0)
    return (
      <EmptySlate
        icon={Send}
        title="No applications yet"
        description="Browse the opportunity feed and apply to briefs that match your audience."
        action={
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Browse opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );

  return (
    <div className="space-y-3">
      {apps.map((app) => (
        <div
          key={app.uuid}
          className="rounded-xl border bg-card/70 px-4 py-4 space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {app.opportunity?.title ?? `Opportunity #${app.opportunity_id}`}
              </p>
              {app.opportunity?.promotable && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {app.opportunity.promotable.title ??
                    app.opportunity.promotable.name}
                </p>
              )}
            </div>
            <StatusPill
              label={APPLICATION_STATUS_LABELS[app.status]}
              colorClass={APP_STATUS_COLORS[app.status]}
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {app.proposed_price_ugx > 0 && (
              <span>{formatCurrency(app.proposed_price_ugx)}</span>
            )}
            {app.proposed_price_credits > 0 && (
              <span>{formatNumber(app.proposed_price_credits)} credits</span>
            )}
            <span>{relativeTime(app.created_at)}</span>
          </div>

          {app.pitch_message && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {app.pitch_message}
            </p>
          )}
        </div>
      ))}

      <div className="pt-2 flex justify-end">
        <Link
          href="/opportunities/my/applications"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function EarningsTab() {
  const { data, isLoading, isError } = useActivityHubEarnings();

  if (isLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  if (isError || !data)
    return (
      <EmptySlate
        icon={AlertCircle}
        title="Could not load earnings"
        description="You may not have a store set up yet. Complete promoter onboarding to enable payouts."
      />
    );

  const earningOrders = (data.orders?.data ?? []) as Record<
    string,
    unknown
  >[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Total UGX
          </p>
          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(data.total_ugx)}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Total Credits
          </p>
          <p className="mt-2 text-2xl font-bold">
            {formatNumber(data.total_credits)}
          </p>
        </div>
      </div>

      {earningOrders.length === 0 ? (
        <EmptySlate
          icon={TrendingUp}
          title="No earnings yet"
          description="Earnings appear here once buyers pay for your promotion services."
        />
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Recent paid orders</h3>
          {earningOrders.slice(0, 10).map((order, i) => {
            const ugx = Number(order.paid_ugx ?? 0);
            const created = String(order.created_at ?? "");
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border bg-card/70 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    Order #{String(order.id ?? i + 1)}
                  </p>
                  {created && (
                    <p className="text-xs text-muted-foreground">
                      {relativeTime(created)}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  +{formatCurrency(ugx)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type TabId = "orders" | "opportunities" | "applications" | "earnings";

interface TabDef {
  id: TabId;
  label: string;
  Icon: React.ElementType;
  promoterOnly?: boolean;
}

const TABS: TabDef[] = [
  { id: "orders", label: "Orders", Icon: ShoppingBag },
  { id: "opportunities", label: "Opportunities", Icon: Briefcase },
  { id: "applications", label: "Applications", Icon: Send },
  { id: "earnings", label: "Earnings", Icon: TrendingUp, promoterOnly: true },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("orders");

  const { data: summaryData, isLoading: summaryLoading } =
    useActivityHubSummary();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const wallet = summaryData?.wallet;
  const promoter = summaryData?.promoter;
  const isPromoter = promoter?.is_promoter === true;
  const pendingActions = summaryData?.pending_actions;

  const totalPendingCount =
    (pendingActions?.buyer_orders_awaiting_review ?? 0) +
    (pendingActions?.seller_orders_to_verify ?? 0) +
    (pendingActions?.open_opportunities ?? 0) +
    (pendingActions?.pending_applications ?? 0);

  const visibleTabs = TABS.filter((t) => !t.promoterOnly || isPromoter);

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Activity Hub</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your wallet, orders, opportunities, and promotion activity in one place.
        </p>
      </div>

      {/* Summary cards */}
      {summaryLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-5 h-24 animate-pulse bg-muted/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Wallet */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Wallet
              </p>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(wallet?.ugx_balance ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">UGX balance</p>
              </div>
              <div className="pb-0.5">
                <p className="text-lg font-semibold text-primary">
                  {formatNumber(wallet?.credits ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">credits</p>
              </div>
            </div>
          </div>

          {/* Promoter status / CTA */}
          {isPromoter && promoter.is_promoter ? (
            <div className="rounded-2xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Promoter
                  </p>
                </div>
                {promoter.is_verified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">
                    {promoter.display_name}
                  </p>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      TIER_COLORS[promoter.tier]
                    )}
                  >
                    {PROMOTER_TIER_LABELS[promoter.tier]}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {promoter.average_rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {promoter.average_rating}
                    </span>
                  )}
                  <span>
                    {promoter.total_completed_orders} completed
                  </span>
                </div>
              </div>
              <Link
                href={`/promoters/${promoter.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View public profile
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-5 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Promoter
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Offer promotion services to artists — no artist account required.
                </p>
              </div>
              <Link
                href="/become-promoter"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 self-start"
              >
                Become a Promoter
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Pending actions */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Pending Actions
              </p>
              {totalPendingCount > 0 && (
                <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {totalPendingCount}
                </span>
              )}
            </div>

            {totalPendingCount === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                All caught up!
              </div>
            ) : (
              <div className="space-y-2">
                <ActionBadge
                  count={pendingActions?.buyer_orders_awaiting_review ?? 0}
                  label="Orders awaiting review"
                />
                <ActionBadge
                  count={pendingActions?.seller_orders_to_verify ?? 0}
                  label="Orders to verify"
                />
                <ActionBadge
                  count={pendingActions?.open_opportunities ?? 0}
                  label="Open opportunities"
                />
                <ActionBadge
                  count={pendingActions?.pending_applications ?? 0}
                  label="Pending applications"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b overflow-x-auto">
          {visibleTabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "opportunities" && <OpportunitiesTab />}
          {activeTab === "applications" && (
            <ApplicationsTab isPromoter={isPromoter} />
          )}
          {activeTab === "earnings" && isPromoter && <EarningsTab />}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/promotions", label: "Browse Promotions", Icon: Megaphone },
          { href: "/opportunities", label: "Opportunity Feed", Icon: Briefcase },
          {
            href: "/promotions/purchases",
            label: "My Purchases",
            Icon: ShoppingBag,
          },
          {
            href: "/become-promoter",
            label: "Promoter Setup",
            Icon: Send,
            hide: isPromoter,
          },
        ]
          .filter((l) => !l.hide)
          .map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors text-center"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
      </div>
    </div>
  );
}
