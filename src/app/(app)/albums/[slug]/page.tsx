import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Heart,
  Share2,
  MoreHorizontal,
  Clock,
  Disc,
  Calendar,
  Music,
} from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Album, Song } from "@/types";
import { formatDuration, formatNumber } from "@/lib/utils";

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

async function getAlbum(slug: string): Promise<Album | null> {
  try {
    const res = await serverFetch<Album | { data?: Album; success?: boolean }>(`/albums/${slug}`);
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      return (res as { data: Album }).data;
    }
    return res as Album;
  } catch {
    return null;
  }
}

async function getAlbumTracks(albumId: number) {
  try {
    return await serverFetch<{ data: Song[] }>(`/albums/${albumId}/tracks`);
  } catch {
    return { data: [] };
  }
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  const album = await getAlbum(slug);

  if (!album) {
    notFound();
  }

  const { data: tracks } = await getAlbumTracks(album.id);

  // Calculate total duration
  const totalDuration = tracks.reduce((acc, track) => acc + (track.duration || 0), 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 h-80 bg-linear-to-b from-primary/20 via-primary/10 to-background" />

        {/* Content */}
        <div className="relative p-6 pt-8 flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Album Art */}
          <div className="relative h-48 w-48 md:h-56 md:w-56 shrink-0 overflow-hidden rounded-lg bg-muted shadow-2xl">
            {album.artwork_url ? (
              <Image
                src={album.artwork_url}
                alt={album.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Disc className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Album Info */}
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium">Album</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-2 mb-4">
              {album.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {album.artist && (
                <>
                  <Link
                    href={`/artists/${album.artist.slug || album.artist.id}`}
                    className="font-medium hover:underline"
                  >
                    {album.artist.name}
                  </Link>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              {album.release_date && (
                <>
                  <span className="text-muted-foreground">
                    {new Date(album.release_date).getFullYear()}
                  </span>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              <span className="text-muted-foreground">
                {tracks.length} songs, {totalMinutes} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 flex items-center gap-4">
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-lg">
          <Play className="h-6 w-6 ml-1" />
        </button>
        <button className="p-3 text-muted-foreground hover:text-foreground">
          <Heart className="h-7 w-7" />
        </button>
        <button className="p-3 text-muted-foreground hover:text-foreground">
          <Share2 className="h-6 w-6" />
        </button>
        <button className="p-3 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      {/* Track List */}
      <div className="px-6 pb-8">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b mb-2">
          <span className="w-8 text-center">#</span>
          <span>Title</span>
          <span className="w-20 text-right">Plays</span>
          <span className="w-12 text-right">
            <Clock className="h-4 w-4 inline" />
          </span>
        </div>

        {/* Tracks */}
        <div className="space-y-1">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div
                key={track.id}
                className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 items-center p-2 md:px-4 rounded-lg hover:bg-muted transition-colors"
              >
                {/* Track Number / Play */}
                <span className="w-8 text-center text-muted-foreground group-hover:hidden">
                  {index + 1}
                </span>
                <button className="w-8 hidden group-hover:flex items-center justify-center text-foreground">
                  <Play className="h-4 w-4" />
                </button>

                {/* Track Info */}
                <div className="min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  {track.featured_artists && track.featured_artists.length > 0 && (
                    <p className="text-sm text-muted-foreground truncate">
                      feat.{" "}
                      {track.featured_artists.map((a) => a.name).join(", ")}
                    </p>
                  )}
                </div>

                {/* Play Count */}
                <span className="hidden md:block w-20 text-right text-sm text-muted-foreground">
                  {formatNumber(track.play_count || 0)}
                </span>

                {/* Duration */}
                <span className="w-12 text-right text-sm text-muted-foreground">
                  {formatDuration(track.duration || 0)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tracks available</p>
            </div>
          )}
        </div>
      </div>

      {/* Album Details */}
      <div className="px-6 pb-8 border-t pt-6">
        <h2 className="text-lg font-bold mb-4">Album Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {album.release_date && (
            <div>
              <p className="text-muted-foreground mb-1">Release Date</p>
              <p className="font-medium">
                {new Date(album.release_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground mb-1">Tracks</p>
            <p className="font-medium">{tracks.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Duration</p>
            <p className="font-medium">{totalMinutes} minutes</p>
          </div>
          {album.genre && (
            <div>
              <p className="text-muted-foreground mb-1">Genre</p>
              <p className="font-medium">{album.genre.name}</p>
            </div>
          )}
        </div>

        {album.description && (
          <div className="mt-6">
            <p className="text-muted-foreground mb-2">Description</p>
            <p className="text-sm max-w-3xl">{album.description}</p>
          </div>
        )}
      </div>

      {/* More from Artist */}
      {album.artist && (
        <div className="px-6 pb-8 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              More from {album.artist.name}
            </h2>
            <Link
              href={`/artists/${album.artist.slug || album.artist.id}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View Artist
            </Link>
          </div>
          {/* This would show other albums from the same artist */}
        </div>
      )}
    </div>
  );
}
