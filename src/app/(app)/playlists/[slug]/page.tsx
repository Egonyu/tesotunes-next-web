import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Heart,
  Share2,
  MoreHorizontal,
  Clock,
  ListMusic,
  Shuffle,
  Pencil,
  Trash2,
  Globe,
  Lock,
  User,
} from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Playlist, Song } from "@/types";
import { formatDuration, formatNumber } from "@/lib/utils";
import PlaylistCollaboration from "@/components/PlaylistCollaboration";

interface PlaylistPageProps {
  params: Promise<{ slug: string }>;
}

async function getPlaylist(slug: string): Promise<Playlist | null> {
  try {
    return await serverFetch<Playlist>(`/playlists/${slug}`);
  } catch {
    return null;
  }
}

async function getPlaylistTracks(playlistId: number) {
  try {
    return await serverFetch<{ data: Song[] }>(
      `/playlists/${playlistId}/tracks`
    );
  } catch {
    return { data: [] };
  }
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { slug } = await params;
  const playlist = await getPlaylist(slug);

  if (!playlist) {
    notFound();
  }

  const { data: tracks } = await getPlaylistTracks(playlist.id);

  // Calculate total duration
  const totalDuration = tracks.reduce(
    (acc, track) => acc + (track.duration || 0),
    0
  );
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        {/* Background */}
        <div className="absolute inset-0 h-80 bg-linear-to-b from-primary/20 via-primary/10 to-background" />

        {/* Content */}
        <div className="relative p-6 pt-8 flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Playlist Cover */}
          <div className="relative h-48 w-48 md:h-56 md:w-56 shrink-0 overflow-hidden rounded-lg bg-muted shadow-2xl">
            {playlist.artwork_url ? (
              <Image
                src={playlist.artwork_url}
                alt={playlist.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/30 to-primary/10">
                <ListMusic className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Playlist Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm">
              {playlist.is_public ? (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Public Playlist</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Private Playlist</span>
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-2 mb-4">
              {playlist.name}
            </h1>

            {playlist.description && (
              <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
                {playlist.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {playlist.user && (
                <>
                  <Link
                    href={`/users/${playlist.user.id}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <div className="h-6 w-6 rounded-full bg-muted overflow-hidden">
                      {playlist.user.profile_image_url ? (
                        <Image
                          src={playlist.user.profile_image_url}
                          alt={playlist.user.name}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{playlist.user.name}</span>
                  </Link>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              <span className="text-muted-foreground">
                {formatNumber(playlist.follower_count || 0)} followers
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {tracks.length} songs
                {hours > 0 && `, ${hours} hr ${minutes} min`}
                {hours === 0 && minutes > 0 && `, ${minutes} min`}
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
        <button className="flex h-12 w-12 items-center justify-center rounded-full border-2 hover:border-foreground hover:scale-105 transition-all">
          <Shuffle className="h-5 w-5" />
        </button>
        <button className="p-3 text-muted-foreground hover:text-foreground">
          <Heart className="h-7 w-7" />
        </button>
        <button className="p-3 text-muted-foreground hover:text-foreground">
          <Share2 className="h-6 w-6" />
        </button>
        <PlaylistCollaboration
          playlistId={playlist.id}
          isOwner={true}
          isCollaborative={playlist.is_collaborative}
        />
        <button className="p-3 text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </div>

      {/* Track List */}
      <div className="px-6 pb-8">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b mb-2">
          <span className="w-8 text-center">#</span>
          <span>Title</span>
          <span>Album</span>
          <span className="w-20 text-right">Added</span>
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
                className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center p-2 md:px-4 rounded-lg hover:bg-muted transition-colors"
              >
                {/* Track Number / Play */}
                <span className="w-8 text-center text-muted-foreground group-hover:hidden">
                  {index + 1}
                </span>
                <button className="w-8 hidden group-hover:flex items-center justify-center text-foreground">
                  <Play className="h-4 w-4" />
                </button>

                {/* Track Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {track.artwork_url && (
                      <Image
                        src={track.artwork_url}
                        alt={track.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    {track.artist && (
                      <Link
                        href={`/artists/${track.artist.slug || track.artist.id}`}
                        className="text-sm text-muted-foreground hover:underline truncate block"
                      >
                        {track.artist.name}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Album */}
                <div className="hidden md:block min-w-0">
                  {track.album && (
                    <Link
                      href={`/albums/${track.album.slug || track.album.id}`}
                      className="text-sm text-muted-foreground hover:underline truncate block"
                    >
                      {track.album.title}
                    </Link>
                  )}
                </div>

                {/* Date Added */}
                <span className="hidden md:block w-20 text-right text-sm text-muted-foreground">
                  {track.pivot?.created_at
                    ? new Date(track.pivot.created_at).toLocaleDateString()
                    : "-"}
                </span>

                {/* Duration */}
                <span className="w-12 text-right text-sm text-muted-foreground">
                  {formatDuration(track.duration || 0)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ListMusic className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>This playlist is empty</p>
              <p className="text-sm mt-2">
                Add songs to start building your playlist
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
