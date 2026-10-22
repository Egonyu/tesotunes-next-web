"use client";

import { useEffect, useRef, useState } from "react";
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
  Coins,
  Megaphone,
  ThumbsUp,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useUIStore } from "@/stores";
import { PlayerBar } from "@/components/player/player-bar";
import { CreatePlaylistModal } from "@/components/music/CreatePlaylistModal";
import { Modal } from "@/components/ui/modal";
import { STORE_ENABLED } from "@/lib/features";
import { useNavigationAvailability } from "@/hooks/useNavigationAvailability";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { isPromoterIdentity } from "@/lib/studio-access";

const defaultMainTabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "#menu", label: "More", icon: Menu },
];

const artistMainTabs = [
  { href: "/artist", label: "Studio", icon: Sparkles },
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
  { href: "/referrals", label: "Refer & Earn", icon: Gift },
  { href: "/edula", label: "Edula", icon: Rss },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/podcasts", label: "Podcasts", icon: Mic2 },
  { href: "/polls", label: "Polls", icon: ThumbsUp },
  { href: "/promotions", label: "Promoter Market", icon: Megaphone },
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
  const isActive =
    href !== "#menu" && (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

  if (href === "#menu") {
    return (
      <button
        onClick={onClick}
        className="relative flex flex-col items-center justify-center min-h-11 min-w-11 flex-1 px-2 py-1 group"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-black/5 bg-white/60 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:bg-white dark:border-white/10 dark:bg-[#161a22]/95 dark:group-hover:bg-[#1d2230]">
          <Icon className="h-4 w-4 text-foreground/65 group-hover:text-foreground transition-colors" />
        </div>
        <span className="mt-0.5 text-[10px] font-semibold leading-none tracking-tight text-foreground/55 group-hover:text-foreground transition-colors">
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center min-h-11 min-w-11 flex-1 px-2 py-1 group"
    >
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200",
          isActive
            ? "border-primary/20 bg-primary/12 shadow-[0_8px_18px_rgba(220,38,90,0.16)] dark:border-primary/30 dark:bg-primary/20"
            : "border-black/5 bg-white/60 shadow-sm group-hover:-translate-y-0.5 group-hover:bg-white dark:border-white/10 dark:bg-[#181a1f]/90 dark:group-hover:bg-[#1d2026]",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 transition-colors",
            isActive ? "text-primary" : "text-foreground/60 group-hover:text-foreground",
          )}
        />
      </div>
      <span
        className={cn(
          "mt-0.5 text-[10px] font-semibold leading-none tracking-tight transition-colors",
          isActive ? "text-primary" : "text-foreground/55 group-hover:text-foreground",
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
          : "border-border/70 bg-card/90 text-foreground hover:-translate-y-0.5 hover:bg-card dark:border-white/12 dark:bg-[#111826] dark:text-foreground/95 dark:hover:bg-[#182236]",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border",
          isActive
            ? "border-primary/15 bg-primary/15 dark:border-primary/20 dark:bg-primary/18"
            : "border-border/70 bg-background text-foreground/85 dark:border-white/12 dark:bg-[#1a2436]",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            isActive ? "text-primary" : "text-foreground/75 dark:text-foreground/90",
          )}
        />
      </div>
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [createPlaylist, setCreatePlaylist] = useState(false);
  const dockRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();
  const { openModal } = useUIStore();
  const { hasAlbums, hasRadioStations } = useNavigationAvailability();
  const { data: platformSettings } = usePlatformSettings();

  const userRole = (session?.user as { role?: string } | undefined)?.role || "";
  const isArtist = userRole.toLowerCase().includes("artist");
  const isAdmin = ["admin", "super_admin", "Admin", "Super Admin"].some((r) =>
    userRole.toLowerCase().includes(r.toLowerCase()),
  );

  const { data: artistStatus } = useQuery({
    queryKey: ["artist", "application-status", "mobile-nav"],
    queryFn: () =>
      apiGet<{ data?: { status?: string; is_artist?: boolean } }>("/artist/application-status"),
    enabled: !!session?.user && !isAdmin,
    staleTime: 30 * 1000,
    retry: false,
  });

  /**
   * The creator menu must agree with what middleware will actually let through.
   *
   * Middleware guards /artist/* on the session token — role, isArtist,
   * isEventOrganizer — while this menu was deciding from a live
   * /artist/application-status call. The two disagree for anyone whose
   * application reads approved before the session carries the flag, and the
   * result is a Dashboard button that bounces to sign-in when tapped. Showing
   * a door nobody can open is worse than not showing it, so the session is the
   * authority here and the API call only ever adds to it.
   */
  const sessionUser = session?.user as
    | {
        role?: string;
        isArtist?: boolean;
        isEventOrganizer?: boolean;
        capabilities?: string[];
      }
    | undefined;
  const isArtistBySession =
    Boolean(sessionUser?.isArtist) || Boolean(sessionUser?.isEventOrganizer);
  const hasArtistAccess = isArtist || isAdmin || isArtistBySession;
  const hasPromoterAccess = sessionUser ? isPromoterIdentity(sessionUser) : false;

  /**
   * An approved application that the session has not caught up with yet. The
   * studio is not reachable until the token refreshes, so the menu offers the
   * profile route that will refresh it rather than a door that bounces.
   */
  const artistApprovedPendingSession =
    !hasArtistAccess &&
    (!!artistStatus?.data?.is_artist || artistStatus?.data?.status === "approved");
  const mainTabs = hasArtistAccess ? artistMainTabs : defaultMainTabs;
  const g = platformSettings?.general;
  const visibleModuleItems = moduleItems.filter((item) => {
    if (item.href === "/referrals" && (!session?.user || hasArtistAccess)) return false;
    if (item.href === "/sacco") return false;
    if (item.href === "/store" && !(g?.store_enabled ?? STORE_ENABLED)) return false;
    if (item.href === "/podcasts" && !(g?.podcasts_enabled ?? false)) return false;
    if (item.href === "/awards" && !(g?.awards_system_enabled ?? false)) return false;
    if (item.href === "/edula" && !(g?.edula_enabled ?? false)) return false;
    if (item.href === "/promotions" && !(g?.promotions_enabled ?? false)) return false;
    if (item.href === "/forums" && !(g?.forums_enabled ?? false)) return false;
    if (item.href === "/polls" && !(g?.polls_enabled ?? false)) return false;
    return true;
  });
  const visibleBrowseItems = browseItems.filter((item) => {
    if (item.href === "/albums" && !hasAlbums) return false;
    if (item.href === "/radio" && !hasRadioStations) return false;
    return true;
  });

  const closeMenu = () => {
    setMenuOpen(false);
    setFabExpanded(false);
  };

  useEffect(() => {
    setMenuOpen(false);
    setFabExpanded(false);
    setCreatePlaylist(false);
  }, [pathname]);

  const artistMenuItems = [
    { href: "/artist", label: "Dashboard", icon: LayoutDashboard },
    { href: "/artist/songs", label: "My Songs", icon: Music },
    { href: "/artist/upload", label: "Upload Music", icon: Upload },
    { href: "/artist/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/artist/earnings", label: "Earnings", icon: DollarSign },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/credits", label: "Credits", icon: Coins },
    { href: "/referrals", label: "Refer & Earn", icon: Gift },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const inSection = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const isCreating = /\/(?:new|create|upload|edit)(?:\/|$)/.test(pathname);
  const action =
    !session?.user || isCreating
      ? null
      : inSection("/library") || inSection("/playlists")
        ? {
            label: "Playlist",
            title: "Create playlist",
            kind: "playlist",
          }
        : pathname === "/edula" && g?.edula_enabled
          ? { label: "Post", title: "Create post", kind: "post" }
          : inSection("/artist") && hasArtistAccess
            ? {
                label: "Create",
                title: "Create in Studio",
                kind: "studio",
              }
            : inSection("/forums") && g?.forums_enabled
              ? {
                  label: "Topic",
                  title: "New topic",
                  kind: "link",
                  href: "/forums/new",
                }
              : inSection("/polls") && g?.polls_enabled
                ? {
                    label: "Poll",
                    title: "Create poll",
                    kind: "link",
                    href: "/polls/create",
                  }
                : inSection("/promoter") && hasPromoterAccess
                  ? {
                      label: "Service",
                      title: "Add promotion service",
                      kind: "link",
                      href: "/promoter/services/new",
                    }
                  : null;
  const studioActions = [
    { href: "/artist/upload", label: "Upload music", icon: Upload },
    {
      href: "/artist/events/create",
      label: "Create event",
      icon: Calendar,
    },
    ...(g?.promotions_enabled
      ? [
          {
            href: "/promotions/requests/new",
            label: "Promote music",
            icon: Megaphone,
          },
        ]
      : []),
  ];

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--mobile-dock-height",
        `${dock.getBoundingClientRect().height}px`,
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--mobile-dock-height");
    };
  }, []);

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
            className="absolute bottom-[calc(var(--mobile-dock-height,4rem)+2.25rem)] left-4 right-4 rounded-2xl border border-black/10 bg-white/95 shadow-[0_20px_48px_rgba(0,0,0,0.35)] dark:border-white/12 dark:bg-[#070d17]/98 dark:shadow-[0_24px_56px_rgba(0,0,0,0.65)] backdrop-blur-xl animate-in slide-in-from-bottom duration-300"
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
                  <p className="text-xs text-foreground/70 dark:text-foreground/82">
                    Browse faster on mobile
                  </p>
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
            <div className="relative max-h-[calc(100dvh-var(--mobile-dock-height,4rem)-7rem)] overflow-y-auto px-4 pb-4 space-y-4">
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
                  {visibleBrowseItems.map((item) => (
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

              {/* User Section — account links live in the header profile menu,
                  so here we surface only the "grow with us" CTAs. */}
              {session && artistApprovedPendingSession && (
                <div className="border-t border-border/70 pt-3 dark:border-white/12">
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">Artist access approved</span>
                      <span className="block text-xs text-muted-foreground">
                        Sign out and back in to open your studio.
                      </span>
                    </span>
                  </Link>
                </div>
              )}

              {session ? (
                !isAdmin &&
                !artistApprovedPendingSession && (
                  <div className="border-t border-border/70 pt-3 dark:border-white/12">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {!hasArtistAccess && (
                        <Link
                          href="/become-artist"
                          onClick={closeMenu}
                          className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-primary via-rose-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(220,38,90,0.28)]"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <span>Become an Artist</span>
                        </Link>
                      )}
                      <Link
                        href={hasPromoterAccess ? "/promoter/services/new" : "/become-promoter"}
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-indigo-500 via-blue-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(37,99,235,0.28)]"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                          <Megaphone className="h-4 w-4" />
                        </div>
                        <span>
                          {hasPromoterAccess ? "Add Promotion Service" : "Become a Promoter"}
                        </span>
                      </Link>
                    </div>
                  </div>
                )
              ) : (
                <div className="border-t border-border/70 pt-3 dark:border-white/12">
                  <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4">
                    <MenuItem href="/login" label="Sign In" icon={User} onClick={closeMenu} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={fabExpanded}
        onClose={() => setFabExpanded(false)}
        labelledBy="studio-actions-title"
        className="self-end rounded-b-none rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:mb-4 sm:self-center sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="studio-actions-title" className="text-lg font-semibold">
            Create in Studio
          </h2>
          <button
            onClick={() => setFabExpanded(false)}
            aria-label="Close creation actions"
            className="flex h-11 w-11 items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {studioActions.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setFabExpanded(false)}
              className="flex min-h-14 items-center gap-3 rounded-xl bg-muted px-4 font-medium"
            >
              <item.icon className="h-5 w-5 text-primary" />
              {item.label}
            </Link>
          ))}
        </div>
      </Modal>
      {createPlaylist && <CreatePlaylistModal open onClose={() => setCreatePlaylist(false)} />}

      {/* One dock owns playback, navigation, and contextual creation. */}
      <nav
        ref={dockRef}
        aria-label="Mobile navigation"
        className={cn(
          "fixed bottom-6 left-1/2 w-[min(92vw,22rem)] -translate-x-1/2 overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.1] dark:bg-[#070d17]/96 dark:shadow-[0_14px_36px_rgba(0,0,0,0.55)] lg:hidden",
          menuOpen ? "z-[60]" : "z-30",
        )}
      >
        <PlayerBar surface="mobile" />
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around gap-1 px-2">
          {mainTabs.slice(0, 2).map((tab) => (
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
          {action &&
            (action.kind === "link" ? (
              <Link
                href={action.href!}
                aria-label={action.title}
                className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-2 text-primary"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{action.label}</span>
              </Link>
            ) : (
              <button
                aria-label={action.title}
                onClick={() => {
                  setMenuOpen(false);
                  if (action.kind === "playlist") setCreatePlaylist(true);
                  else if (action.kind === "post") openModal("edula-compose");
                  else setFabExpanded(true);
                }}
                className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-2 text-primary"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{action.label}</span>
              </button>
            ))}
          {mainTabs.slice(2).map((tab) => (
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
