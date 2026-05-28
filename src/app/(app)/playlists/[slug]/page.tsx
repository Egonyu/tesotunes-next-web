import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { Play, ListMusic, Globe, Lock, User } from "lucide-react";
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
    return await serverFetch<{ data: Song[] }>(`/playlists/${playlistId}/tracks`);
  } catch {
    return { data: [] };
  }
}

export async function generateMetadata({ params }: PlaylistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const playlist = await getPlaylist(slug);

  if (!playlist) return { title: "Playlist Not Found" };

  const title = playlist.name;
  const description =
    playlist.description || `${playlist.name} — a curated playlist on TesoTunes.`;
  const image = playlist.artwork_url;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: absoluteUrl(`/playlists/${slug}`) },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { title, description },
  };
}

function PodiumCard({
  track,
  rank,
  featured,
}: {
  track: Song;
  rank: number;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative group flex flex-col items-center text-center rounded-3xl border transition-all ${
        featured
          ? "bg-linear-to-br from-primary/15 to-card border-primary/30 hover:border-primary/50 p-8 scale-105 z-10"
          : "bg-card/60 border-border hover:border-border/80 p-6 mt-8"
      }`}
    >
      {/* Rank watermark */}
      <div
        className={`absolute select-none font-black italic pointer-events-none ${
          featured
            ? "-top-10 left-1/2 -translate-x-1/2 text-9xl text-primary/10"
            : "-top-7 left-1/2 -translate-x-1/2 text-7xl text-foreground/8"
        }`}
      >
        {rank}
      </div>

      {/* Artwork */}
      <div
        className={`relative mb-5 overflow-hidden rounded-2xl shadow-2xl group-hover:scale-[1.03] transition-transform duration-500 ${
          featured ? "h-52 w-52 border-2 border-primary/20" : "h-44 w-44"
        }`}
      >
        {track.artwork_url ? (
          <Image src={track.artwork_url} alt={track.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ListMusic className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {/* Play count badge */}
        <div
          className={`absolute -bottom-2.5 -right-2.5 px-2.5 py-1 rounded-lg shadow-lg text-[10px] font-black uppercase tracking-wide ${
            featured
              ? "bg-primary text-primary-foreground"
              : track.play_count > 1000000
              ? "bg-amber-500 text-black"
              : "bg-blue-500 text-white"
          }`}
        >
          {formatNumber(track.play_count || 0)}
        </div>
      </div>

      {/* Title */}
      <h3
        className={`font-black truncate w-full mb-1 ${
          featured ? "text-xl text-primary" : "text-lg"
        }`}
      >
        {track.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-1 truncate w-full">
        {track.artist?.name}
      </p>
      <p className="text-[10px] text-muted-foreground/50 font-mono mb-5">
        {formatDuration(resolveDurationSeconds(undefined, track.duration_seconds))}
      </p>

      {/* Play button */}
      <div
        className={`flex items-center justify-center rounded-full text-primary-foreground transition-all shadow-lg group-hover:scale-110 ${
          featured
            ? "h-14 w-14 bg-primary shadow-primary/30"
            : "h-12 w-12 bg-foreground/10 hover:bg-primary"
        }`}
      >
        <svg className="h-6 w-6 fill-current ml-0.5" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { slug } = await params;
  const playlist = await getPlaylist(slug);

  if (!playlist) notFound();

  const { data: tracks } = await getPlaylistTracks(playlist.id);

  const totalDuration = tracks.reduce(
    (acc, track) => acc + resolveDurationSeconds(undefined, track.duration_seconds),
    0
  );
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const totalPlays = tracks.reduce((sum, t) => sum + (t.play_count || 0), 0);

  const isPublic = playlist.visibility === "public" || playlist.is_public === true;
  const owner = playlist.owner ?? playlist.user;

  // Top 3 for the podium
  const topThree = tracks.slice(0, 3);
  const podiumOrder =
    topThree.length === 3
      ? [topThree[1], topThree[0], topThree[2]]
      : topThree;

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative h-[48vh] min-h-100 flex items-end px-8 pb-8 overflow-hidden">
        {/* Blurred artwork background */}
        {playlist.artwork_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{
              backgroundImage: `url(${playlist.artwork_url})`,
              filter: "blur(2px) brightness(0.35)",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-primary/10 to-background" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/10" />

        <div className="relative z-10 w-full flex flex-col md:flex-row items-end justify-between gap-6">
          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              {isPublic ? (
                <>
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Public Playlist
                  </span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Private Playlist
                  </span>
                </>
              )}
              <span className="text-muted-foreground/30 text-xs">·</span>
              <span className="text-[10px] text-muted-foreground/60 font-medium">
                {tracks.length} tracks
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4 truncate">
              {playlist.name}
            </h1>

            {playlist.description && (
              <p className="text-sm text-muted-foreground mb-4 max-w-xl line-clamp-2">
                {playlist.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {owner && (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-2.5 w-2.5" />
                    </div>
                    <span className="font-semibold text-foreground">{owner.name}</span>
                  </div>
                  <span className="text-muted-foreground/40">·</span>
                </>
              )}
              <span>{formatNumber(playlist.follower_count || 0)} followers</span>
              {(hours > 0 || minutes > 0) && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span>
                    {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: total plays stat */}
          {totalPlays > 0 && (
            <div className="hidden md:block text-right pb-1 shrink-0">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mb-1">
                Total Plays
              </p>
              <p className="text-4xl font-black text-primary">{formatNumber(totalPlays)}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Sticky action bar ──────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-full font-bold text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-primary/20">
              <Play className="h-4 w-4 fill-current" />
              Play All
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

            <PlaylistShareButton
              slug={playlist.slug || String(playlist.id)}
              name={playlist.name}
            />

            <PlaylistCollaboration
              playlistId={playlist.id}
              isOwner={playlist.is_owner === true}
              isCollaborative={playlist.is_collaborative}
              collaborationRequiresApproval={playlist.collaboration_requires_approval}
            />

            <PlaylistOwnerMenu playlist={playlist} />
          </div>
        </div>
      </div>

      {/* ── Top 3 Podium ───────────────────────────────────────── */}
      {topThree.length >= 3 && (
        <section className="px-8 pt-14 pb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
              Top Tracks
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {/* Render: #2 left, #1 center, #3 right */}
            <div className="order-2 md:order-1">
              <PodiumCard track={podiumOrder[0]} rank={2} />
            </div>
            <div className="order-1 md:order-2">
              <PodiumCard track={podiumOrder[1]} rank={1} featured />
            </div>
            <div className="order-3">
              <PodiumCard track={podiumOrder[2]} rank={3} />
            </div>
          </div>
        </section>
      )}

      {/* ── Track List ─────────────────────────────────────────── */}
      <section className="pt-6">
        <div className="px-8 mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            All Tracks
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <PlaylistTracksSection playlist={playlist} tracks={tracks} />
      </section>

      {/* ── Comments ───────────────────────────────────────────── */}
      <div className="px-8 pb-10">
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
