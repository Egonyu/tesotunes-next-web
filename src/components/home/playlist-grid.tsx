import Link from "next/link";
import Image from "next/image";
import { ListMusic, Users } from "lucide-react";
import { serverFetch } from "@/lib/api";
import type { Playlist } from "@/types";

async function getFeaturedPlaylists(): Promise<Playlist[]> {
  try {
    const res = await serverFetch<{ data: Playlist[] }>("/playlists?limit=5&sort=-follower_count");
    return res.data ?? [];
  } catch {
    return [];
  }
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const owner = playlist.owner ?? playlist.user;

  return (
    <Link
      href={`/playlists/${playlist.slug ?? playlist.id}`}
      className="group min-w-0"
    >
      <div className="overflow-hidden rounded-lg bg-card transition hover:bg-accent/40">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {playlist.artwork_url ? (
            <Image
              src={playlist.artwork_url}
              alt={playlist.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="280px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <ListMusic className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 font-semibold group-hover:text-primary transition-colors">
            {playlist.name}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{playlist.song_count ?? 0} songs</span>
            {playlist.follower_count > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {playlist.follower_count.toLocaleString()}
              </span>
            )}
          </div>
          {owner && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              by {owner.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export async function PlaylistGrid() {
  const playlists = await getFeaturedPlaylists();

  if (playlists.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}
