"use client";

import { Search, Bell, User, Mail, MessageSquare, Sparkles, LogOut, Settings, ChevronDown } from "lucide-react";
import { useUIStore } from "@/stores";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

function formatRoleLabel(role: string | undefined): string {
  if (!role) return "Listener";

  const normalized = role.replace(/[_-]+/g, " ").trim();
  if (!normalized) return "Listener";

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Header() {
  const { sidebarCollapsed, setSearchOpen } = useUIStore();
  const { data: session } = useSession();
  const router = useRouter();
  const roleLabel = formatRoleLabel(session?.user?.role);

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
        // On mobile: full width (left-0 right-0)
        // On desktop: adjust for sidebar
        "left-0 right-0",
        "lg:left-16 lg:right-0", // collapsed sidebar on desktop
        !sidebarCollapsed && "lg:left-64" // expanded sidebar on desktop
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <Link
          href="/search"
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground hover:bg-muted/80 md:w-64"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search songs, artists, albums...</span>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {session?.user ? (
          <>
            {/* Notifications */}
            <Link href="/notifications" className="relative rounded-full p-2 hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </Link>

            {/* User Menu */}
            <DropdownMenu
              align="end"
              className="w-[20rem] rounded-2xl border border-border/80 bg-background p-0 shadow-xl"
              trigger={
                <button className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-muted">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted ring-2 ring-background">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
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
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
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
                <DropdownMenuItem
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  onClick={() => router.push("/notifications")}
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left">Inbox</span>
                  <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    1
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  onClick={() => router.push("/messages")}
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>Chat</span>
                </DropdownMenuItem>
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
          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
