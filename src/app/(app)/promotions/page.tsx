"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Megaphone, Users } from "lucide-react";
import PromotionsBrowsePage from "./browse/BrowseContent";
import PromotersDiscoveryPage from "../promoters/DiscoveryContent";

type View = "services" | "promoters";

export default function PromotionsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const view: View = params.get("view") === "promoters" ? "promoters" : "services";

  const selectView = (next: View) => {
    const query = new URLSearchParams(params.toString());
    query.set("view", next);
    router.replace(`/promotions?${query.toString()}`, { scroll: false });
  };

  return (
    <main className="container mx-auto max-w-7xl space-y-5 px-3 py-5 sm:px-6 sm:py-8">
      <div className="rounded-2xl bg-card p-4 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Promotions</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Find your next audience</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Compare services or discover the people behind them. Have a specific goal? Post a brief for promoters to respond to.</p>
        <nav aria-label="Promotion marketplace" className="mt-5 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => selectView("services")} aria-current={view === "services" ? "page" : undefined} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold sm:flex-row sm:justify-center sm:text-sm ${view === "services" ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}><BriefcaseBusiness className="h-5 w-5" />Services</button>
          <button type="button" onClick={() => selectView("promoters")} aria-current={view === "promoters" ? "page" : undefined} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold sm:flex-row sm:justify-center sm:text-sm ${view === "promoters" ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}><Users className="h-5 w-5" />Promoters</button>
          <Link href="/promotions/requests" className="flex min-w-0 flex-col items-center gap-1 rounded-xl border p-2.5 text-center text-xs font-semibold hover:bg-muted sm:flex-row sm:justify-center sm:text-sm"><Megaphone className="h-5 w-5" />Briefs</Link>
        </nav>
      </div>
      {view === "services" ? <PromotionsBrowsePage embedded /> : <PromotersDiscoveryPage embedded />}
    </main>
  );
}
