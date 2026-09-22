"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { href: "/admin/promotions", label: "Services" },
  { href: "/admin/promotions/promoters", label: "Promoters" },
  { href: "/admin/promotions/requests", label: "Briefs" },
  { href: "/admin/promotions/disputes", label: "Disputes" },
  { href: "/admin/promotions/analytics", label: "Analytics" },
];

export default function AdminPromotionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-5">
      <nav aria-label="Admin promotion sections" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {sections.map(({ href, label }) => {
          const active = pathname === href || (href !== "/admin/promotions" && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`rounded-lg border px-2 py-2.5 text-center text-xs font-semibold sm:text-sm ${active ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-muted"}`}>{label}</Link>;
        })}
      </nav>
      {children}
    </div>
  );
}
