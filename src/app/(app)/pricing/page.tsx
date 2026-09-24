"use client";

import Link from "next/link";
import {
    ArrowRight,
    Building2,
    Check,
    Music2,
    ShieldCheck,
    Sparkles,
    Star,
    Wifi,
    WifiOff,
} from "lucide-react";
import {
    type SubscriptionPlan,
    useMySubscription,
    useSubscriptionPlans,
} from "@/hooks/useSubscriptions";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<string, typeof Music2> = {
    free: Music2,
    emong: Music2,
    eris: Star,
    engatuny: Building2,
};

export default function PricingPage() {
    const { data: plans, isLoading } = useSubscriptionPlans();
    const { data: currentSub } = useMySubscription();

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
                <div
                    className="mx-auto max-w-2xl space-y-4 text-center"
                    aria-label="Loading subscription plans"
                >
                    <div className="mx-auto h-5 w-32 animate-pulse rounded-full bg-muted" />
                    <div className="mx-auto h-12 w-full max-w-xl animate-pulse rounded-2xl bg-muted" />
                    <div className="mx-auto h-5 w-4/5 animate-pulse rounded-lg bg-muted" />
                </div>
                <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="h-[560px] animate-pulse rounded-[2rem] border bg-card"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative isolate overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.16),transparent_62%)]" />

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
                <header className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Built for every stage
                    </div>
                    <h1 className="mt-6 text-balance text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                        Start with the music.
                        <span className="block text-primary">
                            Grow when you&apos;re ready.
                        </span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                        Listen, publish, sell and run events from one account.
                        Begin free, then choose the tools that move your work
                        forward.
                    </p>
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Clear monthly pricing
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            Change plans as you grow
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            Trial eligible plans first
                        </span>
                    </div>
                </header>

                <section
                    className="mt-16 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4"
                    aria-label="Subscription plans"
                >
                    {plans?.map((plan) => {
                        const Icon = PLAN_ICONS[plan.slug] || Music2;
                        const isCurrentPlan = currentSub?.plan === plan.slug;
                        const price = Number(plan.price_local || plan.price);
                        const isRecommended = plan.is_popular;

                        return (
                            <article
                                key={plan.id}
                                className={cn(
                                    "group relative flex min-h-[560px] flex-col rounded-[2rem] border bg-card/95 p-7 shadow-[0_2px_10px_hsl(var(--foreground)/0.04),0_24px_60px_hsl(var(--foreground)/0.06)] transition duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_8px_20px_hsl(var(--foreground)/0.08),0_32px_80px_hsl(var(--foreground)/0.1)]",
                                    isRecommended
                                        ? "border-primary/50 bg-[linear-gradient(160deg,hsl(var(--primary)/0.1),hsl(var(--card))_36%)] shadow-[0_4px_18px_hsl(var(--primary)/0.16),0_32px_80px_hsl(var(--primary)/0.14)] xl:-translate-y-3 xl:hover:-translate-y-5"
                                        : "border-border/80",
                                    isCurrentPlan &&
                                        "ring-2 ring-primary ring-offset-4 ring-offset-background",
                                )}
                            >
                                {isRecommended && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground shadow-lg shadow-primary/25">
                                        Best balance
                                    </span>
                                )}

                                <div className="flex items-start justify-between gap-4">
                                    <div
                                        className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted/50 transition-transform duration-300 group-hover:scale-105",
                                            isRecommended &&
                                                "border-primary/20 bg-primary/10",
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "h-5 w-5",
                                                isRecommended
                                                    ? "text-primary"
                                                    : "text-foreground",
                                            )}
                                        />
                                    </div>
                                    {isCurrentPlan && (
                                        <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-background">
                                            Your plan
                                        </span>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <h2 className="text-2xl font-bold tracking-tight">
                                        {plan.name}
                                    </h2>
                                    <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mt-7 border-y border-border/70 py-5">
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-black tracking-[-0.04em]">
                                            {price === 0
                                                ? "Free"
                                                : `UGX ${price.toLocaleString()}`}
                                        </span>
                                        {price > 0 && (
                                            <span className="pb-1 text-sm text-muted-foreground">
                                                /month
                                            </span>
                                        )}
                                    </div>
                                    {plan.trial_days ? (
                                        <p className="mt-2 text-sm font-semibold text-primary">
                                            Try every feature for{" "}
                                            {plan.trial_days} days
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            No payment needed
                                        </p>
                                    )}
                                </div>

                                <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                                    <div className="rounded-xl bg-muted/60 p-3">
                                        <dt className="text-muted-foreground">
                                            Audio
                                        </dt>
                                        <dd className="mt-1 font-bold">
                                            {plan.limits.audio_quality_kbps}{" "}
                                            kbps
                                        </dd>
                                    </div>
                                    <div className="rounded-xl bg-muted/60 p-3">
                                        <dt className="text-muted-foreground">
                                            Downloads/day
                                        </dt>
                                        <dd className="mt-1 font-bold">
                                            {plan.limits.downloads_per_day ===
                                            null
                                                ? "Unlimited"
                                                : plan.limits.downloads_per_day}
                                        </dd>
                                    </div>
                                    {plan.limits.uploads_per_month !== null &&
                                        plan.limits.uploads_per_month > 0 && (
                                            <div className="rounded-xl bg-muted/60 p-3">
                                                <dt className="text-muted-foreground">
                                                    Uploads/month
                                                </dt>
                                                <dd className="mt-1 font-bold">
                                                    {
                                                        plan.limits
                                                            .uploads_per_month
                                                    }
                                                </dd>
                                            </div>
                                        )}
                                    <div className="rounded-xl bg-muted/60 p-3">
                                        <dt className="text-muted-foreground">
                                            Listening
                                        </dt>
                                        <dd className="mt-1 flex items-center gap-1.5 font-bold">
                                            {plan.offline_mode ? (
                                                <Wifi className="h-3.5 w-3.5" />
                                            ) : (
                                                <WifiOff className="h-3.5 w-3.5" />
                                            )}
                                            {plan.offline_mode
                                                ? "Offline"
                                                : plan.has_ads
                                                  ? "With ads"
                                                  : "Ad-free"}
                                        </dd>
                                    </div>
                                </dl>

                                <ul className="mt-6 flex-1 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-3 text-sm leading-5"
                                        >
                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <Check
                                                    className="h-3 w-3 text-primary"
                                                    strokeWidth={3}
                                                />
                                            </span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-7">
                                    {isCurrentPlan ? (
                                        <span className="flex min-h-12 w-full items-center justify-center rounded-xl border bg-muted/40 px-4 text-sm font-semibold text-muted-foreground">
                                            Current plan
                                        </span>
                                    ) : plan.slug === "free" ? (
                                        <span className="flex min-h-12 w-full items-center justify-center rounded-xl border px-4 text-sm font-semibold text-muted-foreground">
                                            Included with every account
                                        </span>
                                    ) : (
                                        <Link
                                            href="/settings/subscription"
                                            className={cn(
                                                "flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                isRecommended
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                                                    : "border bg-background hover:border-primary/40 hover:bg-primary/5",
                                            )}
                                        >
                                            {plan.trial_days
                                                ? `Try ${plan.name} free`
                                                : `Choose ${plan.name}`}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>

                {plans && plans.length > 0 && (
                    <section
                        className="mt-20 overflow-hidden rounded-[2rem] border bg-card shadow-[0_24px_70px_hsl(var(--foreground)/0.06)]"
                        aria-labelledby="compare-plans"
                    >
                        <div className="border-b px-6 py-6 sm:px-8">
                            <h2
                                id="compare-plans"
                                className="text-2xl font-bold tracking-tight"
                            >
                                Compare the essentials
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                A quick view of the limits that change most as
                                you grow.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-muted/40">
                                        <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                                            Feature
                                        </th>
                                        {plans.map((plan) => (
                                            <th
                                                key={plan.id}
                                                className={cn(
                                                    "px-5 py-4 text-center font-bold",
                                                    plan.is_popular &&
                                                        "text-primary",
                                                )}
                                            >
                                                {plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        {
                                            label: "Audio quality",
                                            value: (plan: SubscriptionPlan) =>
                                                `${plan.limits.audio_quality_kbps} kbps`,
                                        },
                                        {
                                            label: "Daily downloads",
                                            value: (plan: SubscriptionPlan) =>
                                                plan.limits
                                                    .downloads_per_day === null
                                                    ? "Unlimited"
                                                    : String(
                                                          plan.limits
                                                              .downloads_per_day,
                                                      ),
                                        },
                                        {
                                            label: "Monthly uploads",
                                            value: (plan: SubscriptionPlan) =>
                                                !plan.limits.uploads_per_month
                                                    ? "—"
                                                    : String(
                                                          plan.limits
                                                              .uploads_per_month,
                                                      ),
                                        },
                                        {
                                            label: "Ad-free",
                                            value: (plan: SubscriptionPlan) =>
                                                plan.has_ads ? "—" : "Included",
                                        },
                                        {
                                            label: "Offline mode",
                                            value: (plan: SubscriptionPlan) =>
                                                plan.offline_mode
                                                    ? "Included"
                                                    : "—",
                                        },
                                        {
                                            label: "Monthly price",
                                            value: (plan: SubscriptionPlan) => {
                                                const planPrice = Number(
                                                    plan.price_local ||
                                                        plan.price,
                                                );
                                                return planPrice === 0
                                                    ? "Free"
                                                    : `UGX ${planPrice.toLocaleString()}`;
                                            },
                                        },
                                    ].map((row) => (
                                        <tr
                                            key={row.label}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-6 py-4 font-medium text-muted-foreground">
                                                {row.label}
                                            </td>
                                            {plans.map((plan) => (
                                                <td
                                                    key={plan.id}
                                                    className={cn(
                                                        "px-5 py-4 text-center font-semibold",
                                                        plan.is_popular &&
                                                            "bg-primary/[0.035]",
                                                    )}
                                                >
                                                    {row.value(plan)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
