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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

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
        className="relative flex flex-col items-center justify-center flex-1 py-2 group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <span className="mt-0.5 text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center flex-1 py-2 group"
    >
      {/* Active indicator pill */}
      {isActive && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-primary" />
      )}
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
          isActive ? "bg-primary/10" : "group-hover:bg-muted"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
      </div>
      <span
        className={cn(
          "mt-0.5 text-[10px] font-medium transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
  const { data: session } = useSession();

  const closeMenu = () => setMenuOpen(false);

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
            className="absolute bottom-16 left-0 right-0 bg-background border-t rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300"
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

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
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
