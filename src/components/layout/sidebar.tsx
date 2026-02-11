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
} from "lucide-react";
import { useUIStore } from "@/stores";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your Library", icon: Library },
];

const browseItems = [
  { href: "/genres", label: "Genres", icon: Disc3 },
  { href: "/artists", label: "Artists", icon: Users },
  { href: "/albums", label: "Albums", icon: Disc3 },
  { href: "/playlists", label: "Playlists", icon: Library },
  { href: "/radio", label: "Radio", icon: Radio },
];

const moduleItems = [
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/podcasts", label: "Podcasts", icon: Mic2 },
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
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex-col border-r bg-background transition-all duration-300",
        "hidden lg:flex", // Hide on mobile, show on desktop
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              T
            </div>
            <span className="text-xl font-bold">TesoTunes</span>
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
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Main Nav */}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* Browse */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Browse
            </h3>
          )}
          {browseItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* Modules */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Explore
            </h3>
          )}
          {moduleItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        {session?.user ? (
          <div className={cn("space-y-1", sidebarCollapsed && "space-y-2")}>
            {/* Become an Artist CTA - only for non-artist users */}
            {!(session.user as { role?: string }).role?.includes("artist") && (
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
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <User className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Profile</span>}
            </Link>
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
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
            {sidebarCollapsed ? (
              <User className="h-5 w-5" />
            ) : (
              "Sign In"
            )}
          </Link>
        )}
      </div>
    </aside>
  );
}
