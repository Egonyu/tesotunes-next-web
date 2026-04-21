import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  ListMusic,
  Shuffle,
  Globe,
  Lock,
  User,
} from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Playlist, Song } from "@/types";
import { formatDuration, formatNumber, resolveDurationSeconds } from "@/lib/utils";
import PlaylistCollaboration from "@/components/PlaylistCollaboration";
import { SocialActions } from "@/components/social/SocialActions";
import { PlaylistShareButton } from "@/components/playlists/PlaylistShareButton";
import { PlaylistOwnerMenu } from "@/components/playlists/PlaylistOwnerMenu";
import { PlaylistTracksSection } from "@/components/playlists/PlaylistTracksSection";

interface PlaylistPageProps {
  params: Promise<{ slug: string }>;
}

async function getPlaylist(slug: string): Promise<Playlist | null> {
  try {
    const res = await serverFetch<{ data: Playlist }>(`/playlists/${slug}`);
    return res.data;
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

export async function generateMetadata({ params }: PlaylistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const playlist = await getPlaylist(slug);

  if (!playlist) return { title: 'Playlist Not Found' };

  const title = playlist.name;
  const description = playlist.description || `${playlist.name} — a curated playlist on TesoTunes.`;
  const image = playlist.artwork_url;

  return {
    title,
    description,
    alternates: { canonical: `/playlists/${slug}` },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description },
  };
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
    (acc, track) => acc + resolveDurationSeconds(undefined, track.duration_seconds),
    0
  );
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const isPublic = playlist.visibility === "public" || playlist.is_public === true;
  const owner = playlist.owner ?? playlist.user;

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
              {isPublic ? (
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
              {owner && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted overflow-hidden">
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <span className="font-medium">{owner.name}</span>
                  </div>
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
        <SocialActions
          entityType="playlist"
          entityId={playlist.id}
          showLike
          likeVariant="inline"
          showFollow
          followType="playlist"
          followVariant="compact"
          initialFollowerCount={playlist.follower_count || 0}
          showComments={false}
        />
        <PlaylistShareButton slug={playlist.slug || String(playlist.id)} name={playlist.name} />
        <PlaylistCollaboration
          playlistId={playlist.id}
          isOwner={playlist.is_owner === true}
          isCollaborative={playlist.is_collaborative}
          collaborationRequiresApproval={playlist.collaboration_requires_approval}
        />
        <PlaylistOwnerMenu playlist={playlist} />
      </div>

      <PlaylistTracksSection playlist={playlist} tracks={tracks} />

      {/* Comments Section */}
      <div className="px-6 pb-8">
        <SocialActions
          entityType="playlist"
          entityId={playlist.id}
          showLike={false}
          showComments
          commentTitle={`Comments on ${playlist.name}`}
        />
      </div>
    </div>
  );
}
