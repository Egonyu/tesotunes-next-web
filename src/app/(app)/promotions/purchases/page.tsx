"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Coins,
  ExternalLink,
  HelpCircle,
  Info,
  Loader2,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  TriangleAlert,
  Upload,
  WalletCards,
  Zap,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { useMyPurchases } from "@/hooks/usePromotions";
import {
  OrderCard,
  PromotionsEmptyState,
  PromotionsPagination,
} from "@/components/promotions";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending_verification", label: "Pending" },
  { value: "verification_submitted", label: "Submitted" },
  { value: "completed", label: "Completed" },
  { value: "disputed", label: "Disputed" },
  { value: "refunded", label: "Refunded" },
];

/**
 * Stat tones. Each pairs a wash with a foreground that clears contrast on both
 * grounds — the tint is `/10` of a colour rather than a baked hex, so the card
 * follows the viewer's theme instead of overriding it.
 */
const TONES = {
  sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rose: "bg-primary/10 text-primary",
  violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  neutral: "bg-muted text-foreground",
} as const;

const QUICK_ACTIONS = [
  {
    icon: Upload,
    title: "Submit proof quickly",
    text: "Once your promoter has delivered, open the order and attach a proof link so the workflow can continue.",
  },
  {
    icon: MessageCircle,
    title: "Dispute with context",
    text: "Escalate only when scope, timing or deliverables are materially off. Clear notes reach the admin desk.",
  },
  {
    icon: Star,
    title: "Review completed work",
    text: "Reviews are what the next artist reads when deciding whether a promoter delivers.",
  },
  {
    icon: BookOpen,
    title: "Learn how it works",
    text: "How purchases, delivery and disputes fit together on the marketplace contract.",
  },
];

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  value,
  label,
  note,
  tone,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  note: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div className={cn("rounded-2xl p-3 sm:p-4", TONES[tone])}>
      <Icon className="h-5 w-5" />
      <p className="mt-2 truncate text-lg font-bold tracking-tight tabular-nums sm:text-xl">
        {value}
      </p>
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{note}</p>
    </div>
  );
}

function IconChip({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-[18px] w-[18px]" />
    </span>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-card p-4">
      <IconChip icon={icon} />
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function PanelHeading({
  icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <IconChip icon={icon} />
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PromotionPurchasesPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useMyPurchases({
    status: status || undefined,
    page,
  });

  const orders = data?.data ?? [];

  const summary = useMemo(() => {
    return {
      totalOrders: orders.length,
      pending: orders.filter((order) => order.status === "pending_verification").length,
      completed: orders.filter((order) => order.status === "completed").length,
      disputed: orders.filter((order) => order.status === "disputed").length,
      totalCredits: orders.reduce((sum, order) => sum + order.total_credits, 0),
      totalUgx: orders.reduce((sum, order) => sum + order.total_ugx, 0),
    };
  }, [orders]);

  return (
    <div className="mx-auto max-w-5xl space-y-3 px-3 py-4 sm:space-y-4 sm:px-4 sm:py-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.06] p-5 sm:p-7">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
          <Megaphone className="h-3 w-3" />
          Promotion purchases
        </span>

        <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          Manage your booked promotion services
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Track delivery, submit proof, raise disputes when expectations are missed, and
          review promoters after successful campaigns.
        </p>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/promotions"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Search className="h-4 w-4" />
            Browse more services
          </Link>
          {/*
            This used to open /artist/promotions — the seller studio, which
            middleware gates on the artist role, so a buyer tapping it was
            bounced to sign-in. A buyer's own briefs are the useful destination.
          */}
          <Link
            href="/promotions/requests"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold transition-colors hover:bg-muted/50"
          >
            <ExternalLink className="h-4 w-4" />
            My promotion requests
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-3 sm:grid-cols-2">
        <InfoCard icon={ClipboardList} title="Buyer workflow">
          Each order flows through purchase, proof submission, dispute handling and review
          on the same marketplace contract.
        </InfoCard>
        <InfoCard icon={ShieldCheck} title="Escrow-backed">
          Payments stay protected until delivery is verified or a dispute is resolved.
        </InfoCard>
      </section>

      {/* Six figures, three up on a phone */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        <StatCard
          icon={ShoppingCart}
          value={formatNumber(summary.totalOrders)}
          label="Orders"
          note="In this tab"
          tone="sky"
        />
        <StatCard
          icon={Clock3}
          value={formatNumber(summary.pending)}
          label="Pending"
          note="Waiting for proof"
          tone="amber"
        />
        <StatCard
          icon={CheckCircle2}
          value={formatNumber(summary.completed)}
          label="Completed"
          note="Delivered"
          tone="emerald"
        />
        <StatCard
          icon={TriangleAlert}
          value={formatNumber(summary.disputed)}
          label="Disputed"
          note="Under review"
          tone="rose"
        />
        <StatCard
          icon={Coins}
          value={formatNumber(summary.totalCredits)}
          label="Credits"
          note="Shown here"
          tone="violet"
        />
        <StatCard
          icon={WalletCards}
          value={formatCurrency(summary.totalUgx)}
          label="Cash value"
          note="Shown here"
          tone="neutral"
        />
      </section>

      {/* Order queue */}
      <section className="rounded-2xl border bg-card p-3 sm:p-5">
        <PanelHeading
          icon={ClipboardList}
          title="Order queue"
          description="Filter by stage, then open an order to act on it."
        />

        {/* Segmented control — scrolls rather than wrapping into a ragged block */}
        <div className="-mx-1 mt-4 overflow-x-auto px-1 pb-1">
          <div className="inline-flex min-w-full gap-1 rounded-xl bg-muted/60 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "min-h-9 flex-1 whitespace-nowrap rounded-lg px-3 text-xs font-bold transition-colors",
                  status === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="mt-4 space-y-3">
            <PromotionsEmptyState
              title="We couldn't load your purchases"
              description="Check your connection, then refresh this page."
            />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Retry
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-4 space-y-3">
            <PromotionsEmptyState
              title="No purchases here"
              description="Nothing at this stage yet. Browse the marketplace to book a promotion."
            />
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/promotions"
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Browse marketplace
              </Link>
              <Link
                href="/become-promoter"
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Become a promoter
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-2.5">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => router.push(`/promotions/purchases/${order.id}`)}
                />
              ))}
            </div>

            <p className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-px h-4 w-4 shrink-0" />
              Open any order to submit proof, raise a dispute, or leave a review after
              delivery.
            </p>

            <Link
              href="/promotions"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              Book another promotion
              <ArrowRight className="h-4 w-4" />
            </Link>

            <PromotionsPagination
              currentPage={data?.meta.current_page ?? 1}
              lastPage={data?.meta.last_page ?? 1}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {/* Quick actions */}
      <section className="rounded-2xl border bg-card p-3 sm:p-5">
        <PanelHeading
          icon={Zap}
          title="Quick actions & tips"
          description="What to do at each stage."
        />
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {QUICK_ACTIONS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 rounded-xl border p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/15 bg-primary/[0.06] p-4">
        <HelpCircle className="h-5 w-5 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Need help?</span> Visit the{" "}
          <Link href="/support" className="font-medium text-primary hover:underline">
            Help Center
          </Link>{" "}
          or contact support.
        </p>
        <Link
          href="/support"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          Get support
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
