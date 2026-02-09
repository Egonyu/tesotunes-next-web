"use client";

import { Sidebar, Header } from "@/components/layout";
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

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300 pb-24",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="pt-16">
          {children}
        </main>
      </div>

      {/* Player Bar */}
      <PlayerBar />

      {/* Full Screen Player */}
      <FullScreenPlayer />
    </div>
  );
}
