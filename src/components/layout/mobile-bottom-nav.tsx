"use client";

import { useState } from "react";
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
  Headphones,
  Heart,
  Trophy,
  Rss,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { usePlayerStore, useUIStore } from "@/stores";

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
  { href: "/playlists", label: "Playlists", icon: Library },
  { href: "/radio", label: "Radio", icon: Radio },
];

const moduleItems = [
  { href: "/edula", label: "Edula", icon: Rss },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/podcasts", label: "Podcasts", icon: Mic2 },
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
        <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-foreground/5">
          <Icon className="h-5 w-5 text-foreground/50 group-hover:text-foreground/80 transition-colors" />
        </div>
        <span className="mt-0.5 text-[10px] font-medium text-foreground/50 group-hover:text-foreground/80 transition-colors">
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center px-3 py-1.5 group"
    >
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200",
          isActive ? "bg-primary/15" : "group-hover:bg-foreground/5"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 transition-colors",
            isActive ? "text-primary" : "text-foreground/50 group-hover:text-foreground/80"
          )}
        />
      </div>
      <span
        className={cn(
          "mt-0.5 text-[10px] font-medium transition-colors",
          isActive ? "text-primary" : "text-foreground/50 group-hover:text-foreground/80"
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
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-foreground hover:bg-muted"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          isActive ? "bg-primary/15" : "bg-muted"
        )}
      >
        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
      </div>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export function MobileBottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const { data: session } = useSession();
  const { currentSong } = usePlayerStore();
  const { playerMinimized } = useUIStore();

  const hasActivePlayer = !!currentSong && !playerMinimized;

  const userRole = (session?.user as { role?: string } | undefined)?.role || "";
  const isArtist = userRole.toLowerCase().includes("artist");
  const isAdmin = ["admin", "super_admin", "Admin", "Super Admin"].some((r) => userRole.toLowerCase().includes(r.toLowerCase()));

  const closeMenu = () => setMenuOpen(false);

  const artistMenuItems = [
    { href: "/artist", label: "Artist Dashboard", icon: LayoutDashboard },
    { href: "/artist/songs", label: "My Songs", icon: Music },
    { href: "/artist/upload", label: "Upload Music", icon: Upload },
    { href: "/artist/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/artist/earnings", label: "Earnings", icon: DollarSign },
    { href: "/artist/wallet", label: "Wallet", icon: Wallet },
  ];

  // Side action buttons (right-side vertical stack)
  const sideActions = isArtist
    ? [
        { href: "/artist/upload", label: "Upload Song", icon: Upload },
        { href: "/artist/earnings", label: "Earnings", icon: DollarSign },
      ]
    : [
        { href: "/browse", label: "Browse", icon: Headphones },
        { href: "/library", label: "Favorites", icon: Heart },
      ];

  return (
    <>
      {/* Expanded Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeMenu}
        >
          {/* Menu Panel — slides up from bottom */}
          <div
            className="absolute bottom-24 left-4 right-4 bg-background border rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold">Explore</h2>
              </div>
              <button
                onClick={closeMenu}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-4 space-y-4">
              {/* Artist Section */}
              {isArtist && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-2">
                    Artist Studio
                  </h3>
                  <div className="grid grid-cols-1 gap-0.5">
                    {artistMenuItems.map((item) => (
                      <MenuItem key={item.href} {...item} onClick={closeMenu} />
                    ))}
                  </div>
                </div>
              )}

              {/* Browse Section */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-2">
                  Browse
                </h3>
                <div className="grid grid-cols-1 gap-0.5">
                  {browseItems.map((item) => (
                    <MenuItem key={item.href} {...item} onClick={closeMenu} />
                  ))}
                </div>
              </div>

              {/* Explore Section */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-2">
                  More
                </h3>
                <div className="grid grid-cols-1 gap-0.5">
                  {moduleItems.map((item) => (
                    <MenuItem key={item.href} {...item} onClick={closeMenu} />
                  ))}
                </div>
              </div>

              {/* User Section */}
              <div className="border-t pt-3">
                <div className="grid grid-cols-1 gap-0.5">
                  {session ? (
                    <>
                      {!isArtist && !isAdmin && (
                        <Link
                          href="/become-artist"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold text-sm mb-1"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span>Become an Artist</span>
                        </Link>
                      )}
                      <MenuItem href="/profile" label="Profile" icon={User} onClick={closeMenu} />
                      <MenuItem href="/settings" label="Settings" icon={Settings} onClick={closeMenu} />
                    </>
                  ) : (
                    <MenuItem href="/login" label="Sign In" icon={User} onClick={closeMenu} />
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
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setFabExpanded(false)}
        />
      )}

      {/* Right-side Vertical Action Buttons */}
      <div className={cn(
        "fixed right-4 z-50 lg:hidden flex flex-col items-center gap-2.5 transition-all duration-300",
        hasActivePlayer ? "bottom-[10rem]" : "bottom-[5.5rem]"
      )}>
        {/* Side action buttons - slide up when FAB expanded */}
        {fabExpanded && sideActions.map((action, i) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setFabExpanded(false)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-background/80 dark:bg-neutral-800/80 backdrop-blur-2xl",
              "border border-black/[0.08] dark:border-white/[0.08] shadow-lg",
              "hover:bg-background/90 dark:hover:bg-neutral-700/80",
              "transition-all duration-200",
              "animate-in slide-in-from-bottom fade-in"
            )}
            style={{ animationDelay: `${(sideActions.length - 1 - i) * 50}ms` }}
            title={action.label}
          >
            <action.icon className="h-4 w-4 text-foreground/80" />
          </Link>
        ))}

        {/* Main FAB */}
        <button
          onClick={() => setFabExpanded(!fabExpanded)}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            "bg-primary/90 text-primary-foreground shadow-lg",
            "backdrop-blur-2xl",
            "hover:bg-primary active:scale-95 transition-all duration-200",
            fabExpanded && "rotate-45"
          )}
        >
          <Plus className="h-5 w-5 transition-transform duration-200" />
        </button>
      </div>

      {/* Floating Bottom Navigation Bar — always at the very bottom */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[min(92vw,22rem)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className={cn(
          "flex items-center justify-around rounded-full px-1 py-1",
          "bg-background/70 dark:bg-neutral-900/70",
          "backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_2px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]",
          "border border-black/[0.06] dark:border-white/[0.06]",
          "pb-[max(0.25rem,env(safe-area-inset-bottom))]"
        )}>
          {mainTabs.map((tab) => (
            <MobileNavItem
              key={tab.href}
              {...tab}
              onClick={tab.href === "#menu" ? () => setMenuOpen(true) : undefined}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
