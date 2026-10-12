import type { FeedItem, FeedModule } from "@/types/edula";

export const TIMELINE_CATEGORIES: {
    key: FeedModule;
    label: string;
    description: string;
}[] = [
    {
        key: "music",
        label: "Music",
        description: "Songs, albums and playlists",
    },
    {
        key: "podcasts",
        label: "Podcasts",
        description: "Episodes and local stories",
    },
    {
        key: "forum",
        label: "Conversations",
        description: "Polls and discussions",
    },
    {
        key: "events",
        label: "Events",
        description: "Gatherings and live music",
    },
    {
        key: "store",
        label: "Marketplace",
        description: "Products from the community",
    },
    {
        key: "promotions",
        label: "Opportunities",
        description: "Promotion services, briefs and work",
    },
    {
        key: "awards",
        label: "Awards",
        description: "Recognition and celebrations",
    },
    { key: "social", label: "People", description: "Community posts" },
    {
        key: "ateso",
        label: "Ateso",
        description: "Accepted translations and corpus contributions",
    },
    {
        key: "platform",
        label: "TesoTunes",
        description: "Platform announcements",
    },
];

export interface TimelinePresentation {
    kind:
        | "song"
        | "podcast"
        | "poll"
        | "event"
        | "product"
        | "promotion"
        | "service"
        | "corpus"
        | "translation"
        | "update";
    title: string;
    href?: string;
    image?: string | null;
    subtitle?: string | null;
    song_id?: number;
    poll_id?: number;
    duration_seconds?: number | null;
    episode_number?: number | null;
    genre?: string | null;
    starts_at?: string | null;
    ends_at?: string | null;
    location?: string | null;
    price_ugx?: number | null;
    price_credits?: number | null;
    budget_min_ugx?: number | null;
    budget_max_ugx?: number | null;
    deadline_at?: string | null;
    platforms?: string[];
    is_free?: boolean;
    waveform?: number[];
    state?: "open" | "closed" | "upcoming" | "ended";
    delivery_days?: number | null;
    ateso_text?: string;
    english_text?: string;
    dialect?: string | null;
    license?: string;
    pair_uuid?: string;
    accepted_pairs?: number;
    open_tasks?: number;
}

export interface TimelinePreferences {
    interests: FeedModule[];
    saved: string[];
    hidden: string[];
}

export function safeTimelineLink(url: string): boolean {
    return (
        url.startsWith("/") &&
        !url.startsWith("//") &&
        !url.includes("\\") &&
        !/[\u0000-\u001f]/.test(url)
    );
}

export function presentationFor(item: FeedItem): TimelinePresentation {
    if (item.presentation) return item.presentation;
    const songId =
        typeof item.extras?.song_id === "number"
            ? item.extras.song_id
            : undefined;
    const kind = songId
        ? "song"
        : item.type === "episode_published"
          ? "podcast"
          : item.type === "poll_created"
            ? "poll"
            : item.module === "events"
              ? "event"
              : item.module === "store"
                ? "product"
                : item.module === "promotions"
                  ? "promotion"
                  : "update";
    const href = item.actions?.find((action) =>
        safeTimelineLink(action.url),
    )?.url;
    return {
        kind,
        title: item.title ?? "Community update",
        href,
        song_id: songId,
        image: item.media?.thumbnail_url ?? item.media?.url,
        duration_seconds: item.media?.duration_seconds,
    };
}

export function durationLabel(seconds?: number | null): string | null {
    if (!seconds || seconds < 0) return null;
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function relativeDate(value: string, now = Date.now()): string {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) return "Date unavailable";
    const seconds = Math.round((timestamp - now) / 1000);
    if (Math.abs(seconds) < 60) return seconds > 0 ? "Soon" : "Just now";
    const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (Math.abs(seconds) < 3600)
        return format.format(Math.round(seconds / 60), "minute");
    if (Math.abs(seconds) < 86400)
        return format.format(Math.round(seconds / 3600), "hour");
    if (Math.abs(seconds) < 604800)
        return format.format(Math.round(seconds / 86400), "day");
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Kampala",
    }).format(timestamp);
}

export function moneyLabel(value?: number | null): string | null {
    return typeof value === "number" && Number.isFinite(value)
        ? `UGX ${new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 }).format(value)}`
        : null;
}
