"use client";

import { Bell, User, MessageSquare, Sparkles, LogOut, Settings, ChevronDown, Clock, Wallet, LayoutDashboard } from "lucide-react";
import { useUIStore } from "@/stores";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { InitialsAvatar, SafeImage } from "@/components/ui/safe-image";
import { pickMediaUrl } from "@/lib/media";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUnreadCount } from "@/hooks/useNotifications";
import { HeaderSearch } from "@/components/layout/header-search";
import { useUserProfile } from "@/hooks/useSettings";

function formatRoleLabel(role: string | undefined): string {
  if (!role) return "Listener";

  const normalized = role.replace(/[_-]+/g, " ").trim();
  if (!normalized) return "Listener";

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Header() {
  const { sidebarCollapsed } = useUIStore();
  const { data: session } = useSession();
  const router = useRouter();
  const roleLabel = formatRoleLabel(session?.user?.role);
  const userRole = (session?.user as { role?: string } | undefined)?.role || "";
  const isAdmin = ["admin", "super_admin", "Admin", "Super Admin"].some((r) =>
    userRole.toLowerCase().includes(r.toLowerCase())
  );

  const { data: artistStatus } = useQuery({
    queryKey: ["artist", "application-status", "header"],
    queryFn: () => apiGet<{ data?: { status?: string; is_artist?: boolean } }>("/artist/application-status"),
    enabled: !!session?.user && !isAdmin,
    staleTime: 30 * 1000,
    retry: false,
  });

  const isArtistByRole = userRole.toLowerCase().includes("artist");
  const isArtistByStatus = !!artistStatus?.data?.is_artist || artistStatus?.data?.status === "approved";
  const hasArtistAccess = isArtistByRole || isArtistByStatus;

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.total ?? 0;

  // Resolve the avatar from the session first, then fall back to the uploaded
  // avatar on the profile API so a freshly uploaded image always shows.
  const { data: userProfile } = useUserProfile();
  const sessionImage = pickMediaUrl(
    session?.user?.image,
    (session?.user as { avatar_url?: string } | undefined)?.avatar_url,
    userProfile?.avatar,
    userProfile?.avatar_url
  );

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-3 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
        // On mobile: full width (left-0 right-0)
        // On desktop: adjust for sidebar
        "left-0 right-0",
        "lg:left-16 lg:right-0", // collapsed sidebar on desktop
        !sidebarCollapsed && "lg:left-64" // expanded sidebar on desktop
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <HeaderSearch />

        {/* Mobile quick actions — fills the otherwise-empty top bar on phones */}
        {session?.user && (
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => router.push("/messages")}
              aria-label="Messages"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MessageSquare className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => router.push(hasArtistAccess ? "/artist/wallet" : "/wallet")}
              aria-label="Wallet"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Wallet className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => router.push("/settings/subscription")}
              aria-label="Upgrade to Pro"
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
            >
              <Sparkles className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {session?.user ? (
          <>
            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <DropdownMenu
              align="end"
              className="w-[20rem] rounded-2xl border border-border/80 bg-background p-0 shadow-xl"
              trigger={
                <button className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-muted">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted ring-2 ring-background">
                    {sessionImage ? (
                      <SafeImage
                        src={sessionImage}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
                        fallback={<InitialsAvatar name={session.user.name} textClassName="text-xs" />}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                  </div>
                  <span className="hidden text-sm font-medium md:inline">
                    {session.user.name}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:inline" />
                </button>
              }
            >
              <div className="rounded-t-2xl bg-linear-to-br from-muted/70 via-background to-primary/5 px-4 py-4">
                <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
                <button
                  onClick={() => router.push("/profile")}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {sessionImage ? (
                      <SafeImage
                        src={sessionImage}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
                        fallback={<InitialsAvatar name={session.user.name} textClassName="text-sm" />}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{session.user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{roleLabel}</p>
                  </div>
                </button>
              </div>

              <div className="p-2">
                {!hasArtistAccess && (
                  <DropdownMenuItem
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    onClick={() => router.push("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  onClick={() => router.push("/notifications")}
                >
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  onClick={() => router.push("/messages")}
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>Messages</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  onClick={() => router.push("/history")}
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>History</span>
                </DropdownMenuItem>
                {!hasArtistAccess && (
                  <DropdownMenuItem
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    onClick={() => router.push("/wallet")}
                  >
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">Wallet</span>
                    <span className="text-xs text-muted-foreground">Credits & balance</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  onClick={() => router.push("/settings/subscription")}
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span>Upgrade Pro</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-foreground"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/claim-artist"
              className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground min-[380px]:inline-flex sm:px-4 sm:py-2 sm:text-sm"
            >
              Claim Artist
            </Link>
            <Link
              href="/register"
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground sm:px-4 sm:py-2 sm:text-sm"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 sm:px-4 sm:py-2 sm:text-sm"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
