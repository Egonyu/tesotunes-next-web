"use client";

import { Sidebar, Header } from "@/components/layout";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AudioPlayer, PlayerBar, FullScreenPlayer } from "@/components/player";
import { useUIStore } from "@/stores";
import { useQueueSync } from "@/hooks/useQueueSync";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  // Sync queue changes to server (debounced)
  useQueueSync();

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden audio element for playback */}
      <AudioPlayer />

      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          "pb-32 lg:pb-24", // Extra padding on mobile for bottom nav + player
          "lg:pl-16", // Desktop: collapsed sidebar
          !sidebarCollapsed && "lg:pl-64" // Desktop: expanded sidebar
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="pt-16 px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Player Bar */}
      <PlayerBar />

      {/* Full Screen Player */}
      <FullScreenPlayer />
    </div>
  );
}
