"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowRight,
    Disc3,
    Headphones,
    ListMusic,
    Loader2,
    Mic2,
    Music2,
    Play,
    Search as SearchIcon,
    Sparkles,
    X,
} from "lucide-react";
import { useGenres, useSearch } from "@/hooks";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlayerStore } from "@/stores";
import { cn } from "@/lib/utils";

type SearchType = "all" | "songs" | "artists" | "albums" | "playlists";

const SEARCH_TYPES: Array<{
    value: SearchType;
    label: string;
    icon: typeof Music2;
}> = [
    { value: "all", label: "All", icon: Sparkles },
    { value: "songs", label: "Songs", icon: Music2 },
    { value: "artists", label: "Artists", icon: Mic2 },
    { value: "albums", label: "Albums", icon: Disc3 },
    { value: "playlists", label: "Playlists", icon: ListMusic },
];

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchPageContent />
        </Suspense>
    );
}

function SearchPageSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="h-10 w-52 animate-pulse rounded-md bg-muted" />
            <div className="mt-6 h-14 animate-pulse rounded-lg bg-muted" />
            <div className="mt-8 grid gap-3 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-20 animate-pulse rounded-lg bg-muted"
                    />
                ))}
            </div>
        </div>
    );
}

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);
    const initialType = searchParams.get("type");
    const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
    const [activeType, setActiveType] = useState<SearchType>(
        SEARCH_TYPES.some((item) => item.value === initialType)
            ? (initialType as SearchType)
            : "all",
    );
    const debouncedQuery = useDebounce(query.trim(), 280);
    const { play } = usePlayerStore();
    const { data, isLoading, isFetching, isError, refetch } =
        useSearch(debouncedQuery);
    const { data: genres = [] } = useGenres();

    const songs = data?.songs ?? [];
    const artists = data?.artists ?? [];
    const albums = data?.albums ?? [];
    const playlists = data?.playlists ?? [];
    const totalResults =
        songs.length + artists.length + albums.length + playlists.length;
    const hasQuery = debouncedQuery.length >= 2;

    const visibleCounts = useMemo(
        () => ({
            all: totalResults,
            songs: songs.length,
            artists: artists.length,
            albums: albums.length,
            playlists: playlists.length,
        }),
        [
            albums.length,
            artists.length,
            playlists.length,
            songs.length,
            totalResults,
        ],
    );

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (activeType !== "all") params.set("type", activeType);
        router.replace(
            params.size > 0 ? `/search?${params.toString()}` : "/search",
            { scroll: false },
        );
    }, [activeType, debouncedQuery, router]);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            if (
                event.key !== "/" ||
                event.ctrlKey ||
                event.metaKey ||
                event.altKey
            )
                return;
            const target = event.target as HTMLElement | null;
            if (
                target?.matches(
                    "input, textarea, select, [contenteditable='true']",
                )
            )
                return;
            event.preventDefault();
            inputRef.current?.focus();
        };

        window.addEventListener("keydown", handleShortcut);
        return () => window.removeEventListener("keydown", handleShortcut);
    }, []);

    const show = (type: Exclude<SearchType, "all">) =>
        activeType === "all" || activeType === type;

    return (
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
            <header className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Find it fast
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Search TesoTunes
                </h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Songs, artists, albums and playlists—one search, with every
                    result opening the right place.
                </p>
            </header>

            <div className="sticky top-16 z-20 -mx-4 mt-7 border-y bg-background/95 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-xl sm:border sm:px-3">
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by title, artist or playlist…"
                        aria-label="Search songs, artists, albums and playlists"
                        className="h-12 w-full rounded-lg border bg-muted/30 pl-12 pr-20 text-base outline-none transition-colors duration-100 placeholder:text-muted-foreground focus:border-primary/45 focus:bg-background focus:ring-2 focus:ring-primary/10 [&::-webkit-search-cancel-button]:appearance-none"
                    />
                    <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                        {isFetching && hasQuery && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {query ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery("");
                                    inputRef.current?.focus();
                                }}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : (
                            <kbd className="hidden rounded border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground sm:block">
                                /
                            </kbd>
                        )}
                    </div>
                </div>

                <div
                    className="mt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide"
                    aria-label="Search categories"
                >
                    {SEARCH_TYPES.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setActiveType(value)}
                            className={cn(
                                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors duration-100",
                                activeType === value
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                            {hasQuery && visibleCounts[value] > 0 && (
                                <span
                                    className={cn(
                                        "tabular-nums",
                                        activeType === value
                                            ? "text-primary-foreground/75"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {visibleCounts[value]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {!hasQuery ? (
                <BrowseState genres={genres} />
            ) : isLoading ? (
                <ResultsSkeleton />
            ) : isError ? (
                <div className="mt-10 rounded-xl border border-dashed p-8 text-center">
                    <p className="font-medium">Search could not connect</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your query is safe. Try the request again.
                    </p>
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Try again
                    </button>
                </div>
            ) : totalResults === 0 ? (
                <EmptyResults query={debouncedQuery} />
            ) : (
                <div className="mt-8 space-y-10">
                    <div className="flex items-center justify-between border-b pb-3">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold tabular-nums text-foreground">
                                {totalResults}
                            </span>{" "}
                            results for “{debouncedQuery}”
                        </p>
                        {isFetching && (
                            <span className="text-xs text-muted-foreground">
                                Updating…
                            </span>
                        )}
                    </div>

                    {show("songs") && songs.length > 0 && (
                        <ResultSection
                            title="Songs"
                            count={songs.length}
                            icon={Music2}
                        >
                            <div className="overflow-hidden rounded-lg border bg-card">
                                {songs.map((song, index) => (
                                    <div
                                        key={song.id}
                                        className="group flex min-h-16 items-center gap-3 border-b px-3 py-2 last:border-b-0 hover:bg-muted/45"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => play(song, songs)}
                                            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted"
                                            aria-label={`Play ${song.title}`}
                                        >
                                            {song.artwork_url ? (
                                                <Image
                                                    src={song.artwork_url}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Music2 className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                                            )}
                                            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                                                <Play className="h-4 w-4 fill-white text-white" />
                                            </span>
                                        </button>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/songs/${song.slug}`}
                                                className="block truncate font-medium hover:text-primary"
                                            >
                                                {song.title}
                                            </Link>
                                            <Link
                                                href={`/artists/${song.artist.slug}`}
                                                className="block truncate text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                {song.artist.name}
                                            </Link>
                                        </div>
                                        <span className="hidden w-8 text-right text-xs tabular-nums text-muted-foreground sm:block">
                                            {index + 1}
                                        </span>
                                        <Link
                                            href={`/songs/${song.slug}`}
                                            className="rounded-md p-2 text-muted-foreground opacity-100 hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
                                            aria-label={`Open ${song.title}`}
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </ResultSection>
                    )}

                    {show("artists") && artists.length > 0 && (
                        <ResultSection
                            title="Artists"
                            count={artists.length}
                            icon={Mic2}
                        >
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {artists.map((artist) => (
                                    <Link
                                        key={artist.id}
                                        href={`/artists/${artist.slug}`}
                                        className="group rounded-lg border bg-card p-3 hover:bg-muted/40"
                                    >
                                        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                                            {artist.avatar_url ? (
                                                <Image
                                                    src={artist.avatar_url}
                                                    alt={artist.name}
                                                    fill
                                                    className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
                                                />
                                            ) : (
                                                <Mic2 className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <p className="mt-3 truncate font-medium group-hover:text-primary">
                                            {artist.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Artist
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </ResultSection>
                    )}

                    {show("albums") && albums.length > 0 && (
                        <ResultSection
                            title="Albums"
                            count={albums.length}
                            icon={Disc3}
                        >
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {albums.map((album) => (
                                    <Link
                                        key={album.id}
                                        href={`/albums/${album.slug}`}
                                        className="group rounded-lg border bg-card p-3 hover:bg-muted/40"
                                    >
                                        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                                            {album.artwork_url ? (
                                                <Image
                                                    src={album.artwork_url}
                                                    alt={album.title}
                                                    fill
                                                    className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
                                                />
                                            ) : (
                                                <Disc3 className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <p className="mt-3 truncate font-medium group-hover:text-primary">
                                            {album.title}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                            {album.artist?.name || "Album"}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </ResultSection>
                    )}

                    {show("playlists") && playlists.length > 0 && (
                        <ResultSection
                            title="Playlists"
                            count={playlists.length}
                            icon={ListMusic}
                        >
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {playlists.map((playlist) => (
                                    <Link
                                        key={playlist.id}
                                        href={`/playlists/${playlist.slug}`}
                                        className="group rounded-lg border bg-card p-3 hover:bg-muted/40"
                                    >
                                        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                                            {playlist.artwork_url ? (
                                                <Image
                                                    src={playlist.artwork_url}
                                                    alt={playlist.name}
                                                    fill
                                                    className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
                                                />
                                            ) : (
                                                <ListMusic className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <p className="mt-3 truncate font-medium group-hover:text-primary">
                                            {playlist.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {playlist.song_count ?? 0} songs
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </ResultSection>
                    )}
                </div>
            )}
        </div>
    );
}

function ResultSection({
    title,
    count,
    icon: Icon,
    children,
}: {
    title: string;
    count: number;
    icon: typeof Music2;
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">{title}</h2>
                <span className="text-xs tabular-nums text-muted-foreground">
                    {count}
                </span>
            </div>
            {children}
        </section>
    );
}

function BrowseState({
    genres,
}: {
    genres: Array<{
        id: number;
        name: string;
        slug: string;
        song_count?: number;
        songs_count?: number;
    }>;
}) {
    return (
        <div className="mt-9 space-y-10">
            <section>
                <div className="mb-4 flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Browse genres</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Real catalog routes, ordered by what is available.
                        </p>
                    </div>
                    <Link
                        href="/genres"
                        className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex"
                    >
                        All genres <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                {genres.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {genres.slice(0, 12).map((genre, index) => (
                            <Link
                                key={genre.id}
                                href={`/genres/${genre.slug}`}
                                className="group flex min-h-24 items-end justify-between rounded-lg border bg-card p-4 hover:border-primary/30 hover:bg-muted/35"
                            >
                                <div>
                                    <p className="font-semibold group-hover:text-primary">
                                        {genre.name}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {genre.song_count ??
                                            genre.songs_count ??
                                            0}{" "}
                                        songs
                                    </p>
                                </div>
                                <span
                                    className={cn(
                                        "h-2 w-2 rounded-full",
                                        index === 0
                                            ? "bg-primary"
                                            : "bg-muted-foreground/35",
                                    )}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-24 animate-pulse rounded-lg bg-muted"
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-5 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                        <Headphones className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold">
                            Looking for music uploaded on your behalf?
                        </h2>
                        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                            Find placeholder artist profiles and request
                            ownership through the catalog claim flow.
                        </p>
                    </div>
                </div>
                <Link
                    href="/claim-artist"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                    Find my artist profile <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}

function EmptyResults({ query }: { query: string }) {
    return (
        <div className="mt-10 rounded-xl border border-dashed px-5 py-14 text-center">
            <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 font-semibold">No results for “{query}”</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Try a shorter artist name, remove punctuation, or browse the
                catalog by genre.
            </p>
            <Link
                href="/genres"
                className="mt-5 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
                Browse genres <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

function ResultsSkeleton() {
    return (
        <div className="mt-8 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="h-16 animate-pulse rounded-lg bg-muted"
                />
            ))}
        </div>
    );
}
