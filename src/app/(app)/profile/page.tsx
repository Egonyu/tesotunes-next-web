"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  MapPin,

  Music,
  Heart,
  ListMusic,
  Clock,
  Settings,
  Edit,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();

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

  const stats = [
    { label: "Playlists", value: 12, icon: ListMusic },
    { label: "Liked Songs", value: 248, icon: Heart },
    { label: "Following", value: 56, icon: Music },
    { label: "Listening Hours", value: 1240, icon: Clock },
  ];

  const recentActivity = [
    { type: "liked", item: "Blinding Lights", artist: "The Weeknd", time: "2 hours ago" },
    { type: "playlist", item: "Summer Vibes 2026", time: "5 hours ago" },
    { type: "followed", item: "Burna Boy", time: "1 day ago" },
    { type: "liked", item: "Essence", artist: "Wizkid", time: "2 days ago" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="relative rounded-2xl bg-linear-to-r from-primary/20 to-primary/5 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
              {user?.name?.charAt(0) || "U"}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-background border shadow-sm hover:bg-accent transition-colors">
              <Edit className="h-4 w-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user?.name || "User"}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Member since 2024
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Kenya
              </span>
            </div>
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
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-card border p-4 text-center"
          >
            <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {activity.type === "liked" && (
                    <Heart className="h-5 w-5 text-primary" />
                  )}
                  {activity.type === "playlist" && (
                    <ListMusic className="h-5 w-5 text-primary" />
                  )}
                  {activity.type === "followed" && (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.item}</p>
                  {activity.artist && (
                    <p className="text-sm text-muted-foreground">
                      {activity.artist}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Genres */}
        <div>
          <h2 className="text-xl font-bold mb-4">Favorite Genres</h2>
          <div className="space-y-3">
            {["Afrobeats", "R&B", "Hip Hop", "Pop", "Gospel"].map(
              (genre, index) => (
                <div
                  key={genre}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-white"
                    style={{
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                    }}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">{genre}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${100 - index * 15}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
