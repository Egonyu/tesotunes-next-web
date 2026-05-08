import type { Song } from "@/types";
import { resolveDurationSeconds } from "@/lib/utils";

const VALID_SONG_STATUSES = new Set<Song["status"]>([
  "draft",
  "pending",
  "approved",
  "published",
  "rejected",
]);

type ArtistSongWithPlayback = {
  id: number;
  title: string;
  slug?: string;
  duration_seconds?: number;
  plays: number;
  downloads: number;
  status: string;
  audio_url?: string | null;
  stream_url?: string | null;
  preview_url?: string | null;
  artwork_url?: string | null;
  release_date?: string;
  created_at?: string;
  artist?: {
    id: number;
    name: string;
    slug: string;
  };
};

function normalizeSongStatus(status: string): Song["status"] {
  return VALID_SONG_STATUSES.has(status as Song["status"])
    ? (status as Song["status"])
    : "draft";
}

export function mapArtistSongToPlayerSong(song: ArtistSongWithPlayback): Song {
  const artistName = song.artist?.name ?? "Artist";
  const artistSlug = song.artist?.slug ?? String(song.artist?.id ?? song.id);
  const durationSeconds = resolveDurationSeconds(undefined, song.duration_seconds);

  return {
    id: song.id,
    title: song.title,
    slug: song.slug ?? String(song.id),
    artist_id: song.artist?.id ?? 0,
    duration_seconds: durationSeconds,
    play_count: song.plays,
    download_count: song.downloads,
    like_count: 0,
    status: normalizeSongStatus(song.status),
    audio_url: song.audio_url ?? song.stream_url ?? song.preview_url ?? null,
    stream_url: song.stream_url ?? song.audio_url ?? null,
    preview_url: song.preview_url ?? null,
    artwork_url: song.artwork_url ?? undefined,
    artist: {
      id: song.artist?.id ?? 0,
      name: artistName,
      slug: artistSlug,
      follower_count: 0,
      monthly_listeners: 0,
      is_verified: false,
      status: "active",
      genres: [],
    },
    created_at: song.created_at ?? new Date().toISOString(),
    release_date: song.release_date,
  };
}
