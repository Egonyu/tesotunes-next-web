"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Library,
  Menu,
  Radio,
  Disc3,
  Users,
  Calendar,
  ShoppingBag,
  Mic2,
  BookOpen,
  Wallet,
  MessageSquare,
  User,
  Settings,
  X,
  Compass,
  LayoutDashboard,
  Upload,
  BarChart3,
  Music,
  DollarSign,
  Sparkles,
  Plus,
  Heart,
  Trophy,
  Rss,
  TrendingUp,
  Bell,
  Clock,
  Coins,
  CreditCard,
  Megaphone,
  ThumbsUp,
  MessageCircle,
  BadgePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { usePlayerStore, useUIStore } from "@/stores";
import { STORE_ENABLED } from "@/lib/features";

const mainTabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "#menu", label: "More", icon: Menu },
];

const browseItems = [
  { href: "/genres", label: "Genres", icon: Disc3 },
  { href: "/artists", label: "Artists", icon: Users },
  { href: "/albums", label: "Albums", icon: Disc3 },
  { href: "/songs", label: "Songs", icon: Music },
  { href: "/playlists", label: "Playlists", icon: Library },
  { href: "/charts", label: "Charts", icon: TrendingUp },
  { href: "/new-releases", label: "New Releases", icon: Sparkles },
  { href: "/claim-artist", label: "Claim Artist", icon: Sparkles },
  { href: "/moods", label: "Moods", icon: Heart },
  { href: "/radio", label: "Radio", icon: Radio },
];

const moduleItems = [
  { href: "/edula", label: "Edula", icon: Rss },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/podcasts", label: "Podcasts", icon: Mic2 },
  { href: "/polls", label: "Polls", icon: ThumbsUp },
  { href: "/promotions", label: "Promotions", icon: Megaphone },
  { href: "/ojokotau", label: "Ojokotau", icon: BookOpen },
  { href: "/sacco", label: "SACCO", icon: Wallet },
  { href: "/forums", label: "Forums", icon: MessageSquare },
];

interface MobileNavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

function MobileNavItem({ href, label, icon: Icon, onClick }: MobileNavItemProps) {
  const pathname = usePathname();
  const isActive = href !== "#menu" && (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

  if (href === "#menu") {
    return (
      <button
        onClick={onClick}
        className="relative flex flex-col items-center justify-center px-3 py-1.5 group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-white/60 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:bg-white dark:border-white/10 dark:bg-[#161a22]/95 dark:group-hover:bg-[#1d2230]">
          <Icon className="h-4.5 w-4.5 text-foreground/65 group-hover:text-foreground transition-colors" />
        </div>
        <span className="mt-1 text-[10px] font-semibold tracking-[0.01em] text-foreground/55 group-hover:text-foreground transition-colors">
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center px-3 py-1.5 group"
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200",
          isActive
            ? "border-primary/20 bg-primary/12 shadow-[0_8px_18px_rgba(220,38,90,0.16)] dark:border-primary/30 dark:bg-primary/20"
            : "border-black/5 bg-white/60 shadow-sm group-hover:-translate-y-0.5 group-hover:bg-white dark:border-white/10 dark:bg-[#181a1f]/90 dark:group-hover:bg-[#1d2026]"
        )}
      >
        <Icon
          className={cn(
            "h-4.5 w-4.5 transition-colors",
            isActive ? "text-primary" : "text-foreground/60 group-hover:text-foreground"
          )}
        />
      </div>
      <span
        className={cn(
          "mt-1 text-[10px] font-semibold tracking-[0.01em] transition-colors",
          isActive ? "text-primary" : "text-foreground/55 group-hover:text-foreground"
        )}
      >
        {label}
      </span>
    </Link>
  );
}

interface MenuItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

function MenuItem({ href, label, icon: Icon, onClick }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex min-h-[90px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition-all duration-200 shadow-sm",
        isActive
          ? "border-primary/30 bg-linear-to-br from-primary/14 via-primary/10 to-orange-400/10 text-primary shadow-[0_12px_28px_rgba(220,38,90,0.14)] dark:border-primary/35 dark:from-[#2a1421] dark:via-[#241826] dark:to-[#1f1f2c]"
          : "border-border/70 bg-card/90 text-foreground hover:-translate-y-0.5 hover:bg-card dark:border-white/12 dark:bg-[#111826] dark:text-foreground/95 dark:hover:bg-[#182236]"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border",
          isActive
            ? "border-primary/15 bg-primary/15 dark:border-primary/20 dark:bg-primary/18"
            : "border-border/70 bg-background text-foreground/85 dark:border-white/12 dark:bg-[#1a2436]"
        )}
      >
        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-foreground/75 dark:text-foreground/90")} />
      </div>
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const { data: session } = useSession();
  const { currentSong } = usePlayerStore();
  const { playerMinimized } = useUIStore();

  const userRole = (session?.user as { role?: string } | undefined)?.role || "";
  const isArtist = userRole.toLowerCase().includes("artist");
  const isAdmin = ["admin", "super_admin", "Admin", "Super Admin"].some((r) => userRole.toLowerCase().includes(r.toLowerCase()));

  const { data: artistStatus } = useQuery({
    queryKey: ["artist", "application-status", "mobile-nav"],
    queryFn: () => apiGet<{ data?: { status?: string; is_artist?: boolean } }>("/artist/application-status"),
    enabled: !!session?.user && !isAdmin,
    staleTime: 30 * 1000,
    retry: false,
  });

  const isArtistByStatus = !!artistStatus?.data?.is_artist || artistStatus?.data?.status === "approved";
  const hasArtistAccess = isArtist || isArtistByStatus;
  const hasAnyPlayer = !!currentSong;
  const visibleModuleItems = moduleItems.filter((item) => {
    if (item.href === "/store" && !STORE_ENABLED) return false;
    if (item.href === "/sacco") return false;
    return true;
  });

  const closeMenu = () => {
    setMenuOpen(false);
    setFabExpanded(false);
  };

  useEffect(() => {
    setMenuOpen(false);
    setFabExpanded(false);
  }, [pathname]);

  const artistMenuItems = [
    { href: "/artist", label: "Artist Dashboard", icon: LayoutDashboard },
    { href: "/artist/songs", label: "My Songs", icon: Music },
    { href: "/artist/upload", label: "Upload Music", icon: Upload },
    { href: "/artist/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/artist/earnings", label: "Earnings", icon: DollarSign },
    { href: "/artist/wallet", label: "Wallet", icon: Wallet },
    { href: "/credits", label: "Credits", icon: Coins },
  ];

  const fabActions = hasArtistAccess
    ? [
        { href: "/artist/upload", label: "Upload Song", icon: Upload },
        { href: "/artist/events/create", label: "New Event", icon: Calendar },
        { href: "/artist/promotions/create", label: "Promote", icon: Megaphone },
      ]
    : session
      ? [
          { href: "/events", label: "Shows", icon: Calendar },
          { href: "/forums/new", label: "Topic", icon: MessageSquare },
          { href: "/polls/create", label: "Poll", icon: BadgePlus },
        ]
      : [
          { href: "/events", label: "Shows", icon: Calendar },
          { href: "/search", label: "Search", icon: Search },
          { href: "/login", label: "Sign In", icon: User },
        ];

  const fabBottomClass = "bottom-[6.75rem]";

  return (
    <>
      {/* Expanded Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/72 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeMenu}
        >
          {/* Menu Panel — slides up from bottom */}
          <div
            className="absolute bottom-24 left-4 right-4 rounded-2xl border border-black/10 bg-white/95 shadow-[0_20px_48px_rgba(0,0,0,0.35)] dark:border-white/12 dark:bg-[#070d17]/98 dark:shadow-[0_24px_56px_rgba(0,0,0,0.65)] backdrop-blur-xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
          <div
            className="absolute inset-0 rounded-2xl bg-linear-to-br from-white via-rose-50/90 to-orange-50/80 dark:hidden"
            aria-hidden="true"
          />
            {/* Drag indicator */}
            <div className="relative flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-foreground/15 dark:bg-white/15" />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-2">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-foreground">Explore</h2>
                  <p className="text-xs text-foreground/70 dark:text-foreground/82">Browse faster on mobile</p>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="rounded-full border border-border/70 bg-background/78 p-2 text-foreground/80 shadow-sm transition-colors hover:bg-background dark:border-white/12 dark:bg-[#17253a] dark:text-foreground/90 dark:hover:bg-[#22324b]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="relative max-h-[68vh] overflow-y-auto px-4 pb-4 space-y-4">
              {/* Artist Section */}
              {hasArtistAccess && (
                <div>
                  <h3 className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/68 dark:text-foreground/76">
                    Artist Studio
                  </h3>
                  <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4">
                    {artistMenuItems.map((item) => (
                      <MenuItem key={item.href} {...item} onClick={closeMenu} />
                    ))}
                  </div>
                </div>
              )}

              {/* Browse Section */}
              <div>
                <h3 className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/68 dark:text-foreground/76">
                  Browse
                </h3>
                <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4">
                  {browseItems.map((item) => (
                    <MenuItem key={item.href} {...item} onClick={closeMenu} />
                  ))}
                </div>
              </div>

              {/* Explore Section */}
              <div>
                <h3 className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/68 dark:text-foreground/76">
                  More
                </h3>
                <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4">
                  {visibleModuleItems.map((item) => (
                    <MenuItem key={item.href} {...item} onClick={closeMenu} />
                  ))}
                </div>
              </div>

              {/* User Section */}
              <div className="border-t border-border/70 pt-3 dark:border-white/12">
                <div className="space-y-2">
                  {session ? (
                    <>
                      {!hasArtistAccess && !isAdmin && (
                        <Link
                          href="/become-artist"
                          onClick={closeMenu}
                          className="mb-1 flex items-center gap-3 rounded-2xl bg-linear-to-r from-primary via-rose-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(220,38,90,0.28)]"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span>Become an Artist</span>
                        </Link>
                      )}
                      <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4">
                        <MenuItem href="/notifications" label="Notifications" icon={Bell} onClick={closeMenu} />
                        <MenuItem href="/messages" label="Messages" icon={MessageCircle} onClick={closeMenu} />
                        <MenuItem href="/history" label="History" icon={Clock} onClick={closeMenu} />
                        {!hasArtistAccess && <MenuItem href="/wallet" label="Wallet" icon={CreditCard} onClick={closeMenu} />}
                        {!hasArtistAccess && <MenuItem href="/credits" label="Credits" icon={Coins} onClick={closeMenu} />}
                        <MenuItem href="/profile" label="Profile" icon={User} onClick={closeMenu} />
                        <MenuItem href="/settings" label="Settings" icon={Settings} onClick={closeMenu} />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4">
                      <MenuItem href="/login" label="Sign In" icon={User} onClick={closeMenu} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB Expanded Overlay */}
      {fabExpanded && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setFabExpanded(false)}
        />
      )}

      {/* Right-side Vertical Action Buttons */}
      <div className={cn(
        "fixed left-4 z-[55] flex flex-col items-start gap-2.5 transition-all duration-300 lg:hidden",
        fabBottomClass
      )}>
        {fabExpanded && fabActions.map((action, i) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setFabExpanded(false)}
            className={cn(
              "flex min-h-11 items-center gap-2.5 rounded-full pl-3 pr-4",
              "bg-white/92 text-foreground shadow-[0_16px_34px_rgba(15,23,42,0.16)]",
              "border border-black/[0.06] backdrop-blur-2xl",
              "dark:border-white/[0.1] dark:bg-[#101722]/92 dark:text-foreground dark:shadow-[0_18px_38px_rgba(0,0,0,0.45)]",
              "hover:-translate-y-0.5 hover:bg-white dark:hover:bg-[#172031]",
              "transition-all duration-200",
              "animate-in slide-in-from-bottom fade-in"
            )}
            style={{ animationDelay: `${(fabActions.length - 1 - i) * 50}ms` }}
            title={action.label}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary dark:bg-primary/20">
              <action.icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold tracking-[0.01em]">{action.label}</span>
          </Link>
        ))}

        {/* Main FAB */}
        <button
          onClick={() => setFabExpanded(!fabExpanded)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border border-white/30",
            "bg-linear-to-br from-primary via-rose-500 to-orange-500 text-primary-foreground shadow-[0_18px_36px_rgba(220,38,90,0.38)]",
            "backdrop-blur-2xl hover:shadow-[0_22px_42px_rgba(220,38,90,0.45)] active:scale-95 transition-all duration-200",
            fabExpanded && "rotate-45"
          )}
          aria-label={fabExpanded ? "Close quick actions" : "Open quick actions"}
        >
          <Plus className="h-5 w-5 transition-transform duration-200" />
        </button>
      </div>

      {/* Floating Bottom Navigation Bar — always at the very bottom */}
      <nav className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden w-[min(92vw,22rem)]",
        menuOpen ? "z-[60]" : "z-30"
      )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className={cn(
          "flex items-center justify-around rounded-full px-1.5 py-1.5",
          "bg-linear-to-r from-white/92 via-white/88 to-rose-50/82 dark:bg-linear-to-r dark:from-[#070d17]/96 dark:via-[#070d17]/96 dark:to-[#070d17]/96",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_10px_30px_rgba(15,23,42,0.12)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.55)]",
          "border border-black/[0.05] dark:border-white/[0.1]",
          "pb-[max(0.25rem,env(safe-area-inset-bottom))]"
        )}>
          {mainTabs.map((tab) => (
            <MobileNavItem
              key={tab.href}
              {...tab}
              onClick={
                tab.href === "#menu"
                  ? () => {
                      setFabExpanded(false);
                      setMenuOpen(true);
                    }
                  : () => {
                      setMenuOpen(false);
                      setFabExpanded(false);
                    }
              }
            />
          ))}
        </div>
      </nav>
    </>
  );
}
