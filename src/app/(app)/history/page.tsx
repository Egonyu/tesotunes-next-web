"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Music,
  Trash2,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { apiGet, apiDelete } from "@/lib/api";
import { formatDuration, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface HistoryEntry {
  id: number;
  played_at: string;
  duration_listened: number;
  song: {
    id: number;
    title: string;
    slug: string;
    duration: number;
    cover_url: string | null;
    artist: {
      id: number;
      name: string;
      slug: string;
    };
    album?: {
      id: number;
      title: string;
      slug: string;
    };
  };
}

interface HistoryGroup {
  date: string;
  entries: HistoryEntry[];
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["listening-history", filter],
    queryFn: () =>
      apiGet<HistoryEntry[]>(`/music/history${filter !== "all" ? `?period=${filter}` : ""}`),
  });

  const clearHistory = useMutation({
    mutationFn: () => apiDelete("/music/history"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listening-history"] });
      toast.success("History cleared");
    },
  });

  const removeEntry = useMutation({
    mutationFn: (id: number) => apiDelete(`/music/history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listening-history"] });
      toast.success("Removed from history");
    },
  });

  // Group history by date
  const groupedHistory = historyData?.reduce<HistoryGroup[]>((groups, entry) => {
    const date = new Date(entry.played_at).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const existingGroup = groups.find((g) => g.date === date);
    if (existingGroup) {
      existingGroup.entries.push(entry);
    } else {
      groups.push({ date, entries: [entry] });
    }
    return groups;
  }, []);

  // Filter by search
  const filteredGroups = groupedHistory?.map((group) => ({
    ...group,
    entries: group.entries.filter(
      (entry) =>
        entry.song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.song.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.entries.length > 0);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Clock className="h-8 w-8" />
            Listening History
          </h1>
          <p className="text-muted-foreground mt-1">
            {historyData?.length || 0} songs played
          </p>
        </div>
        {historyData && historyData.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all listening history?")) {
                clearHistory.mutate();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setFilter(period.id as typeof filter)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === period.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {!filteredGroups?.length ? (
        <div className="text-center py-16 bg-card rounded-lg border">
          <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No listening history</h2>
          <p className="text-muted-foreground mb-6">
            Start playing music to see your history here
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            <Play className="h-5 w-5" />
            Browse Music
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-bold text-lg">{group.date}</h2>
                <span className="text-sm text-muted-foreground">
                  ({group.entries.length} songs)
                </span>
              </div>

              {/* Songs */}
              <div className="bg-card rounded-lg border overflow-hidden">
                {group.entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 group ${
                      index > 0 ? "border-t" : ""
                    }`}
                  >
                    {/* Time */}
                    <div className="w-16 text-sm text-muted-foreground">
                      {new Date(entry.played_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* Cover */}
                    <div className="relative w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                      {entry.song.cover_url ? (
                        <Image
                          src={entry.song.cover_url}
                          alt={entry.song.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Music className="w-5 h-5 m-3.5 text-muted-foreground" />
                      )}
                      <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-4 w-4 text-white" />
                      </button>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/songs/${entry.song.slug}`}
                        className="font-medium truncate block hover:underline"
                      >
                        {entry.song.title}
                      </Link>
                      <Link
                        href={`/artists/${entry.song.artist.slug}`}
                        className="text-sm text-muted-foreground truncate block hover:underline"
                      >
                        {entry.song.artist.name}
                      </Link>
                    </div>

                    {/* Album */}
                    <div className="hidden md:block w-48 truncate text-sm text-muted-foreground">
                      {entry.song.album && (
                        <Link
                          href={`/albums/${entry.song.album.slug}`}
                          className="hover:underline"
                        >
                          {entry.song.album.title}
                        </Link>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="w-16 text-sm text-muted-foreground text-right">
                      {formatDuration(entry.song.duration)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeEntry.mutate(entry.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {historyData && historyData.length > 0 && (
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-6 text-center">
            <p className="text-3xl font-bold text-primary">{historyData.length}</p>
            <p className="text-sm text-muted-foreground">Songs Played</p>
          </div>
          <div className="bg-card rounded-lg border p-6 text-center">
            <p className="text-3xl font-bold text-primary">
              {formatDuration(
                historyData.reduce((sum, entry) => sum + entry.duration_listened, 0)
              )}
            </p>
            <p className="text-sm text-muted-foreground">Total Time</p>
          </div>
          <div className="bg-card rounded-lg border p-6 text-center">
            <p className="text-3xl font-bold text-primary">
              {new Set(historyData.map((e) => e.song.artist.id)).size}
            </p>
            <p className="text-sm text-muted-foreground">Different Artists</p>
          </div>
        </div>
      )}
    </div>
  );
}
