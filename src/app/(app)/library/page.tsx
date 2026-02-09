"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Music,
  Disc,
  User,
  ListMusic,
  Clock,
  Grid,
  List,
  Heart,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLibrary } from "@/hooks";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores";
import type { Song, Album, Artist, Playlist } from "@/types";

type LibraryTab = "playlists" | "songs" | "albums" | "artists";
type ViewMode = "grid" | "list";

export default function LibraryPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<LibraryTab>("playlists");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { play } = usePlayerStore();

  const {
    playlists,
    likedSongs,
    savedAlbums,
    followedArtists,
    isLoading,
  } = useLibrary();

  if (!session) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Music className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Library</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Sign in to see your saved songs, albums, playlists, and followed
          artists.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const tabs: { id: LibraryTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "playlists", label: "Playlists", icon: ListMusic },
    { id: "songs", label: "Liked Songs", icon: Heart },
    { id: "albums", label: "Albums", icon: Disc },
    { id: "artists", label: "Artists", icon: User },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "grid" ? "bg-muted" : "hover:bg-muted"
            )}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "list" ? "bg-muted" : "hover:bg-muted"
            )}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "playlists" && (
        <PlaylistsSection
          playlists={playlists}
          viewMode={viewMode}
          isLoading={isLoading}
        />
      )}

      {activeTab === "songs" && (
        <LikedSongsSection
          songs={likedSongs}
          viewMode={viewMode}
          isLoading={isLoading}
          onPlay={play}
        />
      )}

      {activeTab === "albums" && (
        <SavedAlbumsSection
          albums={savedAlbums}
          viewMode={viewMode}
          isLoading={isLoading}
        />
      )}

      {activeTab === "artists" && (
        <FollowedArtistsSection
          artists={followedArtists}
          viewMode={viewMode}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

function PlaylistsSection({
  playlists,
  viewMode,
  isLoading,
}: {
  playlists: Playlist[];
  viewMode: ViewMode;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  return (
    <div>
      {/* Create Playlist Card */}
      <div className="mb-6">
        <button className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-colors w-full md:w-auto">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-medium">Create Playlist</p>
            <p className="text-sm text-muted-foreground">
              Start a new playlist
            </p>
          </div>
        </button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No playlists yet"
          description="Create your first playlist to start organizing your music"
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlists/${playlist.slug || playlist.id}`}
              className="group p-3 rounded-lg bg-card/50 hover:bg-card transition-colors"
            >
              <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted">
                {playlist.artwork_url ? (
                  <Image
                    src={playlist.artwork_url}
                    alt={playlist.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                    <ListMusic className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="font-medium truncate">{playlist.name}</p>
              <p className="text-sm text-muted-foreground">
                {playlist.song_count || 0} songs
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlists/${playlist.slug || playlist.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {playlist.artwork_url ? (
                  <Image
                    src={playlist.artwork_url}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ListMusic className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{playlist.name}</p>
                <p className="text-sm text-muted-foreground">
                  {playlist.song_count || 0} songs
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function LikedSongsSection({
  songs,
  viewMode,
  isLoading,
  onPlay,
}: {
  songs: Song[];
  viewMode: ViewMode;
  isLoading: boolean;
  onPlay: (song: Song, queue?: Song[]) => void;
}) {
  if (isLoading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  if (songs.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No liked songs"
        description="Songs you like will appear here"
      />
    );
  }

  return (
    <div className="space-y-2">
      {songs.map((song, index) => (
        <button
          key={song.id}
          onClick={() => onPlay(song, songs)}
          className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-left"
        >
          <span className="w-6 text-center text-muted-foreground text-sm">
            {index + 1}
          </span>
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
            {song.artwork_url ? (
              <Image
                src={song.artwork_url}
                alt={song.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{song.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {song.artist?.name}
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDuration(song.duration || 0)}
          </span>
        </button>
      ))}
    </div>
  );
}

function SavedAlbumsSection({
  albums,
  viewMode,
  isLoading,
}: {
  albums: Album[];
  viewMode: ViewMode;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  if (albums.length === 0) {
    return (
      <EmptyState
        icon={Disc}
        title="No saved albums"
        description="Albums you save will appear here"
      />
    );
  }

  return viewMode === "grid" ? (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/albums/${album.slug || album.id}`}
          className="group p-3 rounded-lg bg-card/50 hover:bg-card transition-colors"
        >
          <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted">
            {album.artwork_url ? (
              <Image
                src={album.artwork_url}
                alt={album.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Disc className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="font-medium truncate">{album.title}</p>
          <p className="text-sm text-muted-foreground truncate">
            {album.artist?.name}
          </p>
        </Link>
      ))}
    </div>
  ) : (
    <div className="space-y-2">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/albums/${album.slug || album.id}`}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
            {album.artwork_url ? (
              <Image
                src={album.artwork_url}
                alt={album.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Disc className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{album.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {album.artist?.name}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function FollowedArtistsSection({
  artists,
  viewMode,
  isLoading,
}: {
  artists: Artist[];
  viewMode: ViewMode;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  if (artists.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="No followed artists"
        description="Artists you follow will appear here"
      />
    );
  }

  return viewMode === "grid" ? (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={`/artists/${artist.slug || artist.id}`}
          className="text-center group"
        >
          <div className="relative aspect-square mb-3 overflow-hidden rounded-full bg-muted mx-auto">
            {artist.profile_image_url ? (
              <Image
                src={artist.profile_image_url}
                alt={artist.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="font-medium truncate group-hover:text-primary transition-colors">
            {artist.name}
          </p>
          <p className="text-sm text-muted-foreground">Artist</p>
        </Link>
      ))}
    </div>
  ) : (
    <div className="space-y-2">
      {artists.map((artist) => (
        <Link
          key={artist.id}
          href={`/artists/${artist.slug || artist.id}`}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
            {artist.profile_image_url ? (
              <Image
                src={artist.profile_image_url}
                alt={artist.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{artist.name}</p>
            <p className="text-sm text-muted-foreground">Artist</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LoadingSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-3 animate-pulse">
            <div className="aspect-square bg-muted rounded-md mb-3" />
            <div className="h-4 w-3/4 bg-muted rounded mb-2" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
          <div className="h-12 w-12 bg-muted rounded" />
          <div className="flex-1">
            <div className="h-4 w-1/3 bg-muted rounded mb-2" />
            <div className="h-3 w-1/4 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <Icon className="h-16 w-16 mx-auto mb-4 opacity-50" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}
