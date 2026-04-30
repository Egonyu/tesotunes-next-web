"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Library,
  Radio,
  Disc3,
  Users,
  Calendar,
  ShoppingBag,
  Mic2,
  BookOpen,
  Wallet,
  MessageSquare,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Rss,
  Music,
  TrendingUp,
  Heart,
  Coins,
  Megaphone,
  ThumbsUp,
} from "lucide-react";
import { useUIStore } from "@/stores";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { STORE_ENABLED } from "@/lib/features";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useNavigationAvailability } from "@/hooks/useNavigationAvailability";
import { InitialsAvatar, SafeImage } from "@/components/ui/safe-image";

const mainNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your Library", icon: Library },
];

const browseItems = [
  { href: "/genres", label: "Genres", icon: Disc3 },
  { href: "/artists", label: "Artists", icon: Users },
  { href: "/albums", label: "Albums", icon: Disc3 },
  { href: "/songs", label: "Songs", icon: Music },
  { href: "/playlists", label: "Playlists", icon: Library },
  { href: "/charts", label: "Charts", icon: TrendingUp },
  { href: "/new-releases", label: "New Releases", icon: Sparkles },
  { href: "/moods", label: "Moods", icon: Heart },
  { href: "/radio", label: "Radio", icon: Radio },
];

const moduleItems = [
  { href: "/edula", label: "Edula", icon: Rss },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/campaigns", label: "Campaigns", icon: Heart },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/podcasts", label: "Podcasts", icon: Mic2 },
  { href: "/polls", label: "Polls", icon: ThumbsUp },
  { href: "/promotions", label: "Promotions", icon: Megaphone },
  { href: "/ojokotau", label: "Ojokotau", icon: BookOpen },
  { href: "/sacco", label: "SACCO", icon: Wallet },
  { href: "/forums", label: "Forums", icon: MessageSquare },
];


interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  collapsed?: boolean;
}

function NavItem({ href, label, icon: Icon, collapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { data: session } = useSession();
  const { data: platformSettings } = usePlatformSettings();
  const { hasAlbums, hasRadioStations } = useNavigationAvailability();

  const userRole = (session?.user as { role?: string } | undefined)?.role || "";
  const isArtist = userRole.toLowerCase().includes("artist");
  const isAdmin = ["admin", "super_admin", "Admin", "Super Admin"].some((r) =>
    userRole.toLowerCase().includes(r.toLowerCase())
  );

  const { data: artistStatus } = useQuery({
    queryKey: ["artist", "application-status", "sidebar"],
    queryFn: () => apiGet<{ data?: { status?: string; is_artist?: boolean } }>("/artist/application-status"),
    enabled: !!session?.user && !isAdmin,
    staleTime: 30 * 1000,
    retry: false,
  });

  const isArtistByStatus = !!artistStatus?.data?.is_artist || artistStatus?.data?.status === "approved";
  const hasArtistAccess = isArtist || isArtistByStatus;

  const brand = platformSettings?.appearance;
  const brandName = brand?.app_name || platformSettings?.general.platform_name || "TesoTunes";
  const brandAlt = brand?.logo_alt || brandName;
  const compactLabel = brand?.logo_compact_label || brandName.charAt(0);
  const logoSrc = brand?.logo_light || brand?.logo_dark || "";

  const g = platformSettings?.general;
  const visibleModuleItems = moduleItems.filter((item) => {
    if (item.href === "/sacco") return false;
    if (item.href === "/store" && !(g?.store_enabled ?? STORE_ENABLED)) return false;
    if (item.href === "/podcasts" && !(g?.podcasts_enabled ?? false)) return false;
    if (item.href === "/awards" && !(g?.awards_system_enabled ?? false)) return false;
    if (item.href === "/campaigns" && !(g?.campaigns_enabled ?? false)) return false;
    if (item.href === "/ojokotau" && !(g?.ojokotau_enabled ?? false)) return false;
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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex-col border-r bg-background transition-all duration-300",
        "hidden lg:flex",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/10">
              <SafeImage
                src={logoSrc}
                alt={brandAlt}
                fill
                className="object-contain p-1"
                fallback={<InitialsAvatar name={compactLabel} textClassName="text-sm" className="bg-primary text-primary-foreground" />}
              />
            </div>
            <span className="text-xl font-bold">{brandName}</span>
          </Link>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Artist Studio — replaces Home for artists, single button linking to the studio hub */}
        {hasArtistAccess && (
          <div className="space-y-1">
            <Link
              href="/artist"
              className={cn(
                "flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm",
                sidebarCollapsed && "justify-center px-2"
              )}
              title={sidebarCollapsed ? "Artist Studio" : undefined}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>Artist Studio</span>}
            </Link>
            <NavItem href="/search" label="Search" icon={Search} collapsed={sidebarCollapsed} />
            <NavItem href="/library" label="Your Library" icon={Library} collapsed={sidebarCollapsed} />
          </div>
        )}

        {/* Standard nav for non-artists */}
        {!hasArtistAccess && (
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} />
            ))}
          </div>
        )}

        {/* Browse */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Browse
            </h3>
          )}
          {visibleBrowseItems.map((item) => (
            <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} />
          ))}
        </div>

        {/* Modules — only rendered when at least one is enabled */}
        {visibleModuleItems.length > 0 && (
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                Explore
              </h3>
            )}
            {visibleModuleItems.map((item) => (
              <NavItem key={item.href} {...item} collapsed={sidebarCollapsed} />
            ))}
          </div>
        )}

      </nav>

      {/* Bottom — sign in/out only */}
      <div className="border-t p-4">
        {session?.user ? (
          <div className={cn("space-y-1", sidebarCollapsed && "space-y-2")}>
            {/* Become an Artist CTA for non-artists */}
            {!hasArtistAccess && !isAdmin && (
              <Link
                href="/become-artist"
                className={cn(
                  "flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-purple-600 px-3 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm mb-2",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? "Become an Artist" : undefined}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>Become an Artist</span>}
              </Link>
            )}

            {/* Admin panel link */}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? "Admin Panel" : undefined}
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>Admin Panel</span>}
              </Link>
            )}

            <button
              onClick={() => signOut()}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
              sidebarCollapsed && "px-2"
            )}
          >
            {sidebarCollapsed ? <User className="h-5 w-5" /> : "Sign In"}
          </Link>
        )}

        {/* Legal links */}
        {!sidebarCollapsed && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t pt-3">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:underline">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:underline">Terms</Link>
            <Link href="/legal" className="text-xs text-muted-foreground hover:underline">Legal</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
