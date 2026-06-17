"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Megaphone, Search, Sparkles, Wallet } from "lucide-react";

/**
 * Promotions landing — one simple decision page.
 *
 * Written for non-technical users: three plain-language paths instead of a
 * wall of filters, stats, and seller tools. The full marketplace lives at
 * /promotions/browse; requests (opportunities) at /promotions/opportunities;
 * everything you're involved in at /hub.
 */
export default function PromotionsLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Event pages deep-link here with event context to book promo for a show —
  // send those straight to the marketplace with the context intact.
  useEffect(() => {
    if (searchParams.get("target_type") === "event") {
      router.replace(`/promotions/browse?${searchParams.toString()}`);
    }
  }, [searchParams, router]);

  const paths = [
    {
      href: "/promotions/browse",
      icon: Search,
      title: "Find a promoter",
      description:
        "Browse people with real followings on TikTok, radio and clubs. Pick a package — your money is held safely and only paid out when the work is done.",
      action: "Browse promoters",
    },
    {
      href: "/promotions/opportunities",
      icon: Megaphone,
      title: "Get your music promoted",
      description:
        "Tell promoters what you need and your budget. They apply, you pick who to work with — you can even pick more than one.",
      action: "Post a request",
    },
    {
      href: "/hub",
      icon: Wallet,
      title: "My promotion activity",
      description: "Your orders, requests, deliveries and earnings — all in one place.",
      action: "Open my activity",
    },
  ];

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">Promotions</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Grow your music with promoters — or earn money promoting music you love.
          </p>
        </div>

        <div className="space-y-4">
          {paths.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className="group flex items-start gap-4 rounded-2xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <path.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{path.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {path.description}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {path.action}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/become-promoter"
          className="group flex items-center gap-4 rounded-2xl border border-dashed p-5 transition-colors hover:border-primary/40 hover:bg-accent/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Have a following? Earn as a promoter</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              If people follow you on TikTok, Instagram or anywhere else, artists will pay you
              to share their music. Free to join.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
