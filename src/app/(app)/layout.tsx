"use client";

import { Sidebar, Header } from "@/components/layout";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AudioPlayer, PlayerBar, FullScreenPlayer } from "@/components/player";
import { AdBanner, AudioAdManager } from "@/components/ads";
import { PlaylistPickerModal } from "@/components/playlists/PlaylistPickerModal";
import { useUIStore, usePlayerStore } from "@/stores";
import { useQueueSync } from "@/hooks/useQueueSync";
import { cn } from "@/lib/utils";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed, playerMinimized } = useUIStore();
  const { currentSong } = usePlayerStore();

  // Sync queue changes to server (debounced)
  useQueueSync();

  const hasActivePlayer = !!currentSong && !playerMinimized;

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden audio element for playback */}
      <AudioPlayer />

      {/* Audio ad manager — inserts ads between songs for free-tier */}
      <AudioAdManager />

      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          hasActivePlayer
            ? "pb-44 lg:pb-24" // Mobile: nav(4.5rem) + player(~5rem) + spacing; Desktop: player bar only
            : "pb-20 lg:pb-4", // Floating nav padding (mobile) or minimal (desktop)
          "lg:pl-16", // Desktop: collapsed sidebar
          !sidebarCollapsed && "lg:pl-64" // Desktop: expanded sidebar
        )}
      >
        {/* Header */}
        <Header />

        {/* Top banner ad for free-tier users */}
        <div className="pt-16 px-5 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <AdBanner placement="web_top_banner" className="mb-4" />
          </div>
        </div>

        {/* Page Content */}
        <main className="px-5 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* Site footer — legal links required for Google OAuth verification */}
        <footer className="mt-8 border-t px-5 py-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} TesoTunes</span>
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
            <a href="/legal" className="hover:underline">Legal</a>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Player Bar */}
      <PlayerBar />

      {/* Full Screen Player */}
      <FullScreenPlayer />

      {/* Global playlist picker — rendered outside any dropdown tree */}
      <PlaylistPickerModal />
    </div>
  );
}
