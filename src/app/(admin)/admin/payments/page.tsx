"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    ExternalLink,
    Loader2,
    RefreshCw,
    Search,
    ShieldAlert,
    XCircle,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface Summary {
    total: number;
    completed: number;
    processing: number;
    pending: number;
    failed: number;
    reversed: number;
    open_issues: number;
    invalid_webhook_signatures: number;
    completed_amount: number;
    failed_amount: number;
}
interface AlertRow {
    id: number;
    title: string;
    created_at: string | null;
    user: { name: string } | null;
}
interface DashboardData {
    summary: Summary;
    recent_alerts: AlertRow[];
    generated_at: string;
}
interface PaymentRow {
    id: number;
    user: { id: number; name: string; email: string } | null;
    payment_type: string;
    payment_method: string | null;
    provider: string | null;
    status: string;
    amount: number;
    currency: string;
    payment_reference: string | null;
    transaction_reference: string | null;
    failure_reason: string | null;
    created_at: string | null;
    processing_age_minutes: number | null;
    latest_issue: { issue_type: string; severity: string } | null;
}
interface IssueRow {
    id: number;
    title: string;
    severity: string;
    payment: {
        payment_reference: string;
        user: { name: string } | null;
    } | null;
}
interface EntryPoint {
    key: string;
    label: string;
    observability: string;
    known_gap: string | null;
    success_rate: number | null;
    metrics: { total: number; completed: number; open_issues: number };
}
interface BalanceSnapshot {
    balance: number;
    currency: string;
    captured_at: string;
}
interface ProviderBalance {
    available: boolean;
    balance: number;
    currency: string;
    captured_at: string;
    change_24h: number | null;
    history: BalanceSnapshot[];
}
interface PendingPayoutPage {
    data: Array<{ id: number; amount: number }>;
    total: number;
}
interface PaginationMeta {
    total: number;
}

const money = new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 });
const formatMoney = (amount: number, currency = "UGX") =>
    `${currency} ${money.format(amount || 0)}`;
const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleString("en-UG", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—";

function Sparkline({ values }: { values: number[] }) {
    const points = useMemo(() => {
        if (values.length < 2) return "0,34 100,34";
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = Math.max(1, max - min);
        return values
            .map(
                (value, index) =>
                    `${(index / (values.length - 1)) * 100},${38 - ((value - min) / range) * 32}`,
            )
            .join(" ");
    }, [values]);
    return (
        <svg
            viewBox="0 0 100 42"
            preserveAspectRatio="none"
            className="h-20 w-full"
            role="img"
            aria-label="Seven-day provider balance trend"
        >
            <defs>
                <linearGradient id="balance-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity=".25"
                    />
                    <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                    />
                </linearGradient>
            </defs>
            <polygon
                points={`0,42 ${points} 100,42`}
                fill="url(#balance-fill)"
            />
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

function Metric({
    label,
    value,
    detail,
    icon: Icon,
    tone = "neutral",
}: {
    label: string;
    value: string;
    detail: string;
    icon: React.ComponentType<{ className?: string }>;
    tone?: "neutral" | "good" | "warn" | "bad";
}) {
    const tones = {
        neutral: "text-slate-700 dark:text-slate-200",
        good: "text-emerald-700 dark:text-emerald-300",
        warn: "text-amber-700 dark:text-amber-300",
        bad: "text-rose-700 dark:text-rose-300",
    };
    return (
        <div className="group rounded-2xl border border-border/60 bg-background/75 p-4 shadow-[0_1px_2px_rgba(0,0,0,.04),0_12px_30px_rgba(0,0,0,.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                </p>
                <Icon className={cn("h-4 w-4", tones[tone])} />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
                {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
    );
}

export default function AdminPaymentsPage() {
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search.trim(), 300);
    const paymentParams = useMemo(
        () => ({
            status: statusFilter === "all" ? undefined : statusFilter,
            search: debouncedSearch || undefined,
            per_page: 12,
        }),
        [debouncedSearch, statusFilter],
    );

    const dashboardQuery = useQuery({
        queryKey: ["admin", "payments", "dashboard"],
        queryFn: () =>
            apiGet<{ data: DashboardData }>(
                "/admin/payments/observability",
            ).then((r) => r.data),
        refetchInterval: 30000,
    });
    const balanceQuery = useQuery({
        queryKey: ["admin", "payments", "provider-balance"],
        queryFn: () =>
            apiGet<{ data: ProviderBalance }>(
                "/admin/payments/provider-balance",
            ).then((r) => r.data),
        refetchInterval: 60000,
        retry: 1,
    });
    const paymentsQuery = useQuery({
        queryKey: ["admin", "payments", "list", paymentParams],
        queryFn: () =>
            apiGet<{ data: PaymentRow[]; meta: PaginationMeta }>(
                "/admin/payments",
                { params: paymentParams },
            ),
        refetchInterval: 20000,
        placeholderData: (old) => old,
    });
    const issuesQuery = useQuery({
        queryKey: ["admin", "payments", "issues"],
        queryFn: () =>
            apiGet<{ data: IssueRow[] }>("/admin/payment-issues", {
                params: { unresolved: true, per_page: 6 },
            }),
        refetchInterval: 30000,
    });
    const entryPointsQuery = useQuery({
        queryKey: ["admin", "payments", "entry-points"],
        queryFn: () =>
            apiGet<{ data: EntryPoint[] }>("/admin/payments/entry-points").then(
                (r) => r.data,
            ),
        staleTime: 60000,
    });
    const payoutsQuery = useQuery({
        queryKey: ["admin", "artist-payouts", "pending-summary"],
        queryFn: () =>
            apiGet<PendingPayoutPage>("/admin/artist-payouts", {
                params: { status: "pending", per_page: 10 },
            }),
        refetchInterval: 30000,
    });

    const summary = dashboardQuery.data?.summary;
    const balance = balanceQuery.data;
    const payments = paymentsQuery.data?.data ?? [];
    const issues = issuesQuery.data?.data ?? [];
    const alerts = dashboardQuery.data?.recent_alerts ?? [];
    const entryPoints = entryPointsQuery.data ?? [];
    const pendingPayouts = payoutsQuery.data?.data ?? [];
    const pendingExposure = pendingPayouts.reduce(
        (sum, payout) => sum + Number(payout.amount),
        0,
    );
    const coverage =
        balance?.balance && pendingExposure
            ? balance.balance / pendingExposure
            : null;
    const isRefreshing =
        dashboardQuery.isFetching ||
        balanceQuery.isFetching ||
        paymentsQuery.isFetching ||
        issuesQuery.isFetching ||
        payoutsQuery.isFetching;
    const refreshAll = () => {
        void dashboardQuery.refetch();
        void balanceQuery.refetch();
        void paymentsQuery.refetch();
        void issuesQuery.refetch();
        void payoutsQuery.refetch();
    };

    if (dashboardQuery.isLoading || paymentsQuery.isLoading)
        return (
            <div className="flex min-h-[520px] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        );

    return (
        <div className="admin-linear-page admin-linear-payments space-y-7 pb-12 text-foreground">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Payments command center
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                        Money movement, without the blind spots.
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Provider liquidity, payout exposure, payment health, and
                        exceptions—grouped by the decisions an operator needs to
                        make.
                    </p>
                </div>
                <div className="flex gap-2">
                    <a
                        href="https://dashboard.zengapay.com/login"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted"
                    >
                        Add funds in ZengaPay{" "}
                        <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                        type="button"
                        onClick={refreshAll}
                        className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm"
                    >
                        <RefreshCw
                            className={cn(
                                "h-4 w-4",
                                isRefreshing && "animate-spin",
                            )}
                        />
                        Refresh
                    </button>
                </div>
            </header>

            <section className="grid items-stretch gap-4 xl:grid-cols-[1.35fr_1fr]">
                <div className="relative overflow-hidden rounded-[28px] border border-emerald-200/80 bg-[#f1fbf7] p-6 text-slate-950 shadow-[0_2px_5px_rgba(15,23,42,.05),0_24px_70px_rgba(16,185,129,.10)] sm:p-8">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-emerald-200/55 blur-3xl" />
                    <div className="relative flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <span
                                    className={cn(
                                        "h-2 w-2 rounded-full",
                                        balance?.available
                                            ? "bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,.14)]"
                                            : "bg-rose-500",
                                    )}
                                />
                                ZengaPay live balance
                            </div>
                            <p className="mt-4 text-4xl font-semibold tabular-nums tracking-[-0.04em] sm:text-5xl">
                                {balanceQuery.isLoading
                                    ? "Syncing…"
                                    : balance?.available
                                      ? formatMoney(
                                            balance.balance,
                                            balance.currency,
                                        )
                                      : "Unavailable"}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                {balance?.change_24h !== null &&
                                balance?.change_24h !== undefined ? (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1",
                                            balance.change_24h >= 0
                                                ? "font-medium text-emerald-700"
                                                : "font-medium text-rose-700",
                                        )}
                                    >
                                        {balance.change_24h >= 0 ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4" />
                                        )}
                                        {formatMoney(
                                            Math.abs(balance.change_24h),
                                            balance.currency,
                                        )}{" "}
                                        in 24h
                                    </span>
                                ) : (
                                    <span>
                                        Trend starts after the first snapshots
                                    </span>
                                )}
                                <span>
                                    Updated{" "}
                                    {formatDate(balance?.captured_at ?? null)}
                                </span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-600">
                                Pending coverage
                            </p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums">
                                {coverage === null
                                    ? "No exposure"
                                    : `${coverage.toFixed(1)}×`}
                            </p>
                            <p className="text-xs text-slate-600">
                                {formatMoney(pendingExposure)} queued
                            </p>
                        </div>
                    </div>
                    <div className="relative mt-3 text-emerald-600">
                        <Sparkline
                            values={(balance?.history ?? []).map((point) =>
                                Number(point.balance),
                            )}
                        />
                    </div>
                    <div className="relative mt-3 flex items-center justify-between border-t border-emerald-200/80 pt-4 text-xs font-medium text-slate-600">
                        <span>Seven-day provider liquidity</span>
                        <span>{balance?.history?.length ?? 0} snapshots</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Metric
                        label="Completed"
                        value={String(summary?.completed ?? 0)}
                        detail={formatMoney(summary?.completed_amount ?? 0)}
                        icon={CheckCircle2}
                        tone="good"
                    />
                    <Metric
                        label="In flight"
                        value={String(
                            (summary?.processing ?? 0) +
                                (summary?.pending ?? 0),
                        )}
                        detail={`${summary?.processing ?? 0} processing · ${summary?.pending ?? 0} pending`}
                        icon={Clock3}
                        tone="warn"
                    />
                    <Metric
                        label="Failed"
                        value={String(
                            (summary?.failed ?? 0) + (summary?.reversed ?? 0),
                        )}
                        detail={`${formatMoney(summary?.failed_amount ?? 0)} exposed`}
                        icon={XCircle}
                        tone="bad"
                    />
                    <Metric
                        label="Open issues"
                        value={String(summary?.open_issues ?? 0)}
                        detail={`${summary?.invalid_webhook_signatures ?? 0} signature faults`}
                        icon={ShieldAlert}
                    />
                </div>
            </section>

            <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,.75fr)]">
                <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,.04),0_16px_45px_rgba(0,0,0,.035)]">
                    <div className="flex flex-col gap-4 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">
                                    Payment activity
                                </h2>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {paymentsQuery.data?.meta.total ?? 0} ledger
                                entries · newest first
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search people or references"
                                    className="w-full min-w-64 rounded-xl border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="rounded-xl border bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">All statuses</option>
                                <option value="completed">Completed</option>
                                <option value="processing">Processing</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                    </div>
                    <div className="max-h-[610px] overflow-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-card/95 text-[11px] uppercase tracking-[.14em] text-muted-foreground backdrop-blur">
                                <tr>
                                    <th className="px-5 py-3">
                                        Account / flow
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        Amount
                                    </th>
                                    <th className="px-5 py-3">State</th>
                                    <th className="px-5 py-3">Reference</th>
                                    <th className="px-5 py-3 text-right">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-16 text-center text-muted-foreground"
                                        >
                                            No payments match these filters.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="group hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium">
                                                    {payment.user?.name ??
                                                        "Unknown user"}
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-1.5">
                                                    <StatusBadge
                                                        status={
                                                            payment.payment_type
                                                        }
                                                        size="sm"
                                                    />
                                                    {payment.provider ? (
                                                        <StatusBadge
                                                            status={
                                                                payment.provider
                                                            }
                                                            size="sm"
                                                            variant="info"
                                                        />
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right font-semibold tabular-nums">
                                                {formatMoney(
                                                    payment.amount,
                                                    payment.currency,
                                                )}
                                                <p className="mt-1 text-xs font-normal text-muted-foreground">
                                                    {payment.payment_method ??
                                                        "—"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    status={payment.status}
                                                />
                                                {payment.latest_issue ? (
                                                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                                                        {payment.latest_issue.issue_type.replaceAll(
                                                            "_",
                                                            " ",
                                                        )}
                                                    </p>
                                                ) : payment.failure_reason ? (
                                                    <p className="mt-2 max-w-52 text-xs text-rose-600">
                                                        {payment.failure_reason}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs">
                                                <p>
                                                    {payment.payment_reference ??
                                                        "—"}
                                                </p>
                                                <p className="mt-1 text-muted-foreground">
                                                    {payment.transaction_reference ??
                                                        ""}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-right text-xs text-muted-foreground">
                                                {formatDate(payment.created_at)}
                                                {payment.processing_age_minutes !==
                                                null ? (
                                                    <p className="mt-1 text-amber-600">
                                                        {Math.round(
                                                            payment.processing_age_minutes,
                                                        )}
                                                        m in flow
                                                    </p>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside className="space-y-5">
                    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                                    Needs action
                                </p>
                                <h2 className="mt-1 text-lg font-semibold">
                                    Payout queue
                                </h2>
                            </div>
                            <div className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                {payoutsQuery.data?.total ?? 0}
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {pendingExposure
                                ? `${formatMoney(pendingExposure)} is reserved and waiting for review.`
                                : "No payouts are waiting for approval."}
                        </p>
                        <Link
                            href="/admin/payouts"
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background"
                        >
                            Review payout approvals{" "}
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                                    Exceptions
                                </p>
                                <h2 className="mt-1 text-lg font-semibold">
                                    Investigate first
                                </h2>
                            </div>
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="mt-4 space-y-2.5">
                            {issues.length === 0 ? (
                                <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                                    No open payment issues.
                                </div>
                            ) : (
                                issues.slice(0, 4).map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="rounded-2xl border border-border/60 bg-background/70 p-3.5"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium leading-snug">
                                                {issue.title}
                                            </p>
                                            <StatusBadge
                                                status={issue.severity}
                                                size="sm"
                                                variant={
                                                    issue.severity ===
                                                    "critical"
                                                        ? "error"
                                                        : "warning"
                                                }
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {issue.payment?.user?.name ??
                                                "Unknown user"}{" "}
                                            ·{" "}
                                            {issue.payment?.payment_reference ??
                                                `Issue #${issue.id}`}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {alerts.length > 0 ? (
                        <div className="rounded-3xl border border-border/60 bg-muted/25 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                                Latest signal
                            </p>
                            <p className="mt-2 text-sm font-medium">
                                {alerts[0].title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {alerts[0].user?.name ?? "Unknown user"} ·{" "}
                                {formatDate(alerts[0].created_at)}
                            </p>
                        </div>
                    ) : null}
                </aside>
            </section>

            <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                            Coverage map
                        </p>
                        <h2 className="mt-1 text-lg font-semibold">
                            Payment flows
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Compact health view of every money entry point.
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Updated{" "}
                        {formatDate(dashboardQuery.data?.generated_at ?? null)}
                    </p>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {entryPoints.map((entry) => (
                        <div
                            key={entry.key}
                            className="rounded-2xl border border-border/60 bg-background/70 p-4"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold">{entry.label}</h3>
                                <StatusBadge
                                    status={entry.observability}
                                    size="sm"
                                    variant={
                                        entry.observability === "full"
                                            ? "success"
                                            : entry.observability === "partial"
                                              ? "warning"
                                              : "error"
                                    }
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-lg font-semibold tabular-nums">
                                        {entry.metrics.total}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        Tracked
                                    </p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold tabular-nums text-emerald-600">
                                        {entry.metrics.completed}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        Done
                                    </p>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold tabular-nums text-rose-600">
                                        {entry.metrics.open_issues}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                        Issues
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                                <span>
                                    {entry.success_rate === null
                                        ? "No rate yet"
                                        : `${entry.success_rate}% success`}
                                </span>
                                {entry.known_gap ? (
                                    <span className="text-amber-600">Gap</span>
                                ) : (
                                    <span className="text-emerald-600">
                                        Covered
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
