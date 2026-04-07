"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Music,
  Heart,
  ListMusic,
  Settings,
  Edit,
  Loader2,
  Wallet,
  Wifi,
  Volume2,
  CheckCircle,
  ArrowRight,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useLibrary, useRecentlyPlayed, useMyCatalogClaims } from "@/hooks/api";
import { useWallet } from "@/hooks/usePayments";
import { useMySubscription } from "@/hooks/useSubscriptions";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { playlists, likedSongs, followedArtists: libArtists, isLoading: libraryLoading } = useLibrary();
  const { data: recentSongs, isLoading: recentLoading } = useRecentlyPlayed(5);
  const { data: myClaims = [], isLoading: claimsLoading } = useMyCatalogClaims();
  const { data: walletData } = useWallet();
  const { data: currentSub } = useMySubscription();

  if (status === "loading") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const user = session.user;
  const memberSince = user?.id
    ? new Date().getFullYear()
    : new Date().getFullYear();

  const stats = [
    { label: "Playlists", value: playlists.length, icon: ListMusic },
    { label: "Liked Songs", value: likedSongs.length, icon: Heart },
    { label: "Following", value: libArtists.length, icon: Music },
    { label: "Wallet", value: walletData ? `UGX ${(walletData as { balance?: number })?.balance?.toLocaleString() || '0'}` : '—', icon: Wallet },
  ];

  const recentActivity = (recentSongs || []).slice(0, 4).map((song) => ({
    type: "played" as const,
    item: song.title,
    artist: song.artist?.name,
    time: song.created_at
      ? formatTimeAgo(song.created_at)
      : "",
  }));

  const activeClaims = myClaims.filter((claim) => ["pending", "under_review"].includes(claim.status));
  const approvedClaims = myClaims.filter((claim) => claim.status === "approved");

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="relative rounded-2xl bg-linear-to-r from-primary/20 to-primary/5 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
            <Link
              href="/settings/profile"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-background border shadow-sm hover:bg-accent transition-colors"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{user?.name || "User"}</h1>
              {currentSub?.has_subscription && currentSub.tier && (
                <Link
                  href="/settings/subscription"
                  className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize hover:bg-primary/20 transition-colors"
                >
                  {currentSub.tier}
                </Link>
              )}
              {!currentSub?.has_subscription && (
                <Link
                  href="/pricing"
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Free
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Member since {memberSince}
              </span>
              {user?.role === "artist" && (
                <Link
                  href="/artist"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Music className="h-4 w-4" />
                  Artist Studio
                </Link>
              )}
            </div>

            {/* Subscription perks */}
            {currentSub?.has_subscription && (
              <div className="flex flex-wrap gap-2 mt-3">
                {currentSub.ad_free && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    <CheckCircle className="h-3 w-3" />
                    Ad-free
                  </span>
                )}
                {currentSub.offline_access && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    <Wifi className="h-3 w-3" />
                    Offline
                  </span>
                )}
                {currentSub.limits?.audio_quality_kbps && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    <Volume2 className="h-3 w-3" />
                    {currentSub.limits.audio_quality_kbps}kbps
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/settings/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {libraryLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-card border p-4 text-center"
            >
              <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Artist Claims</h2>
            <Link href="/settings/claims" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="rounded-xl bg-card border p-5">
            {claimsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : myClaims.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <ShieldAlert className="h-8 w-8 mx-auto mb-3 opacity-60" />
                <p className="font-medium text-foreground">No artist claims yet</p>
                <p className="text-sm mt-1">
                  If music was uploaded for you, search for your placeholder profile and request ownership.
                </p>
                <Link
                  href="/claim-artist"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Claim an artist
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="text-2xl font-bold">{activeClaims.length}</div>
                    <div className="text-sm text-muted-foreground">Active claims</div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="text-2xl font-bold">{approvedClaims.length}</div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {myClaims.slice(0, 2).map((claim) => (
                    <div key={claim.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{claim.artist?.name || "Unknown artist"}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {claim.status.replace(/_/g, " ")}
                          </p>
                        </div>
                        <BadgeCheck className={`h-5 w-5 ${claim.status === "approved" ? "text-emerald-600" : claim.status === "rejected" ? "text-rose-600" : "text-amber-600"}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/settings/claims"
                    className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Manage claims
                  </Link>
                  <Link
                    href="/claim-artist"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Start another claim
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recently Played</h2>
          {recentLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6 rounded-lg bg-card border text-center text-muted-foreground">
              <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No listening history yet.</p>
              <p className="text-sm mt-1">Start exploring music!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.item}</p>
                    {activity.artist && (
                      <p className="text-sm text-muted-foreground">
                        {activity.artist}
                      </p>
                    )}
                  </div>
                  {activity.time && (
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Playlists */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Playlists</h2>
            <Link href="/library" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {libraryLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="p-6 rounded-lg bg-card border text-center text-muted-foreground">
              <ListMusic className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No playlists yet.</p>
              <p className="text-sm mt-1">Create your first playlist!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlists.slice(0, 5).map((playlist) => (
                <Link
                  key={playlist.id}
                  href={`/playlists/${playlist.slug || playlist.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors"
                >
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {playlist.artwork_url ? (
                      <Image
                        src={playlist.artwork_url}
                        alt={playlist.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <ListMusic className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {playlist.song_count ?? 0} songs
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}
