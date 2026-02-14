import { notFound } from "next/navigation";
import Image from "next/image";
import { Play, Heart, Share2, MoreHorizontal, Clock, User } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Artist, Song, Album, PaginatedResponse } from "@/types";
import { formatNumber } from "@/lib/utils";

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

async function getArtist(slug: string) {
  try {
    const res = await serverFetch<{ data: Artist }>(`/artists/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

async function getArtistSongs(artistId: number) {
  try {
    return await serverFetch<PaginatedResponse<Song>>(`/artists/${artistId}/songs?limit=10`);
  } catch {
    return { data: [] };
  }
}

async function getArtistAlbums(artistId: number) {
  try {
    return await serverFetch<PaginatedResponse<Album>>(`/artists/${artistId}/albums`);
  } catch {
    return { data: [] };
  }
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const artist = await getArtist(slug);

  if (!artist) {
    notFound();
  }

  const [songsData, albumsData] = await Promise.all([
    getArtistSongs(artist.id),
    getArtistAlbums(artist.id),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 lg:h-96">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/20 to-background">
          {artist.cover_image_url && (
            <Image
              src={artist.cover_image_url}
              alt=""
              fill
              className="object-cover opacity-30"
              priority
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6">
          {/* Profile Image */}
          <div className="relative h-32 w-32 md:h-48 md:w-48 shrink-0 overflow-hidden rounded-full bg-muted shadow-xl">
            {artist.profile_image_url ? (
              <Image
                src={artist.profile_image_url}
                alt={artist.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium">Artist</span>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mt-1 mb-4">
              {artist.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatNumber(artist.follower_count || 0)} followers</span>
              <span>•</span>
              <span>{artist.song_count || 0} songs</span>
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

      {/* Bio */}
      {artist.bio && (
        <section className="px-6 pb-8">
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="text-muted-foreground max-w-3xl">{artist.bio}</p>
        </section>
      )}

      {/* Popular Songs */}
      {songsData.data.length > 0 && (
        <section className="px-6 pb-8">
          <h2 className="text-xl font-bold mb-4">Popular</h2>
          <div className="space-y-2">
            {songsData.data.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors group"
              >
                <span className="w-6 text-center text-muted-foreground text-sm">
                  {index + 1}
                </span>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                  {song.artwork_url && (
                    <Image
                      src={song.artwork_url}
                      alt={song.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{song.title}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(song.play_count || 0)}
                </span>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.floor((song.duration || 0) / 60)}:
                  {String((song.duration || 0) % 60).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {albumsData.data.length > 0 && (
        <section className="px-6 pb-8">
          <h2 className="text-xl font-bold mb-4">Discography</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albumsData.data.map((album) => (
              <a
                key={album.id}
                href={`/albums/${album.slug || album.id}`}
                className="group p-3 rounded-lg bg-card/50 hover:bg-card transition-colors"
              >
                <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-muted">
                  {album.artwork_url && (
                    <Image
                      src={album.artwork_url}
                      alt={album.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <p className="font-medium truncate">{album.title}</p>
                <p className="text-sm text-muted-foreground">
                  {album.release_date
                    ? new Date(album.release_date).getFullYear()
                    : "Album"}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
