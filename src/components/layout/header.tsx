"use client";

import { Search, Bell, User, Menu } from "lucide-react";
import { useUIStore } from "@/stores";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Header() {
  const { sidebarCollapsed, setSearchOpen } = useUIStore();
  const { data: session } = useSession();

  return (
    <header
      className={cn(
        "fixed top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
        sidebarCollapsed ? "left-16" : "left-64",
        "right-0"
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button - hidden on desktop */}
        <button className="lg:hidden">
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground hover:bg-muted/80 md:w-64"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search songs, artists, albums...</span>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {session?.user ? (
          <>
            {/* Notifications */}
            <button className="relative rounded-full p-2 hover:bg-muted">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* User Menu */}
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full hover:bg-muted p-1 pr-3"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted">
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
              </div>
              <span className="hidden text-sm font-medium md:inline">
                {session.user.name}
              </span>
            </Link>
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
