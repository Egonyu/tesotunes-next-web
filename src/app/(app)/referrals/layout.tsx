"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/referrals", label: "Invite" },
  { href: "/referrals/history", label: "History" },
  { href: "/referrals/rewards", label: "Rewards" },
  { href: "/referrals/leaderboard", label: "Leaders" },
];

export default function ReferralsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto max-w-6xl px-3 pb-24 pt-5 sm:px-6 sm:pb-8">
      <nav aria-label="Referral programme" className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {tabs.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={`rounded-xl border px-1.5 py-2.5 text-center text-xs font-semibold sm:px-4 sm:text-sm ${active ? "border-primary bg-primary/10 text-primary" : "bg-card text-foreground hover:bg-muted"}`}>
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
