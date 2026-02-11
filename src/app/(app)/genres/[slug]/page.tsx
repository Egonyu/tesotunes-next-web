import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Music, Shuffle, ChevronRight } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Genre, Song, Artist, Album, PaginatedResponse } from "@/types";
import { formatDuration, formatNumber } from "@/lib/utils";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
}

async function getGenre(slug: string): Promise<Genre | null> {
  try {
    const res = await serverFetch<Genre | { data?: Genre; success?: boolean }>(`/genres/${slug}`);
    if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
      return (res as { data: Genre }).data;
    }
    return res as Genre;
  } catch {
    return null;
  }
}

async function getGenreSongs(genreId: number, limit = 20) {
  try {
    return await serverFetch<PaginatedResponse<Song>>(
      `/genres/${genreId}/songs?limit=${limit}`
    );
  } catch {
    return { data: [] };
  }
}

async function getGenreArtists(genreId: number, limit = 10) {
  try {
    return await serverFetch<PaginatedResponse<Artist>>(
      `/genres/${genreId}/artists?limit=${limit}`
    );
  } catch {
    return { data: [] };
  }
}

async function getGenreAlbums(genreId: number, limit = 10) {
  try {
    return await serverFetch<PaginatedResponse<Album>>(
      `/genres/${genreId}/albums?limit=${limit}`
    );
  } catch {
    return { data: [] };
  }
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = await params;
  const genre = await getGenre(slug);

  if (!genre) {
    notFound();
  }

  const [songsData, artistsData, albumsData] = await Promise.all([
    getGenreSongs(genre.id),
    getGenreArtists(genre.id),
    getGenreAlbums(genre.id),
  ]);

  const songs = songsData.data || [];
  const artists = artistsData.data || [];
  const albums = albumsData.data || [];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-64 md:h-80">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary/80 to-primary/60">
          {genre.image_url && (
            <Image
              src={genre.image_url}
              alt={genre.name}
              fill
              className="object-cover opacity-30"
              priority
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="text-sm font-medium text-white/70">Genre</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mt-2">
            {genre.name}
          </h1>
          <p className="text-white/70 mt-2">
            {formatNumber(genre.song_count || songs.length)} songs
          </p>
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
      </div>

      {/* Top Songs */}
      {songs.length > 0 && (
        <section className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Songs</h2>
            <Link
              href={`/genres/${slug}/songs`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {songs.slice(0, 10).map((song, index) => (
              <div
                key={song.id}
                className="group grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center p-2 px-4 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="w-6 text-center text-muted-foreground text-sm">
                  {index + 1}
                </span>
                <div className="flex items-center gap-3 min-w-0">
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
                  <div className="min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    {song.artist && (
                      <Link
                        href={`/artists/${song.artist.slug || song.artist.id}`}
                        className="text-sm text-muted-foreground hover:underline truncate block"
                      >
                        {song.artist.name}
                      </Link>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(song.play_count || 0)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDuration(song.duration || 0)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Artists */}
      {artists.length > 0 && (
        <section className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Popular {genre.name} Artists</h2>
            <Link
              href={`/genres/${slug}/artists`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.slug || artist.id}`}
                className="shrink-0 w-36 text-center group"
              >
                <div className="relative aspect-square mb-3 overflow-hidden rounded-full bg-muted">
                  {artist.profile_image_url ? (
                    <Image
                      src={artist.profile_image_url}
                      alt={artist.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {artist.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{genre.name} Albums</h2>
            <Link
              href={`/genres/${slug}/albums`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albums.slice(0, 5).map((album) => (
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
                      <Music className="h-8 w-8 text-muted-foreground" />
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
        </section>
      )}
    </div>
  );
}
