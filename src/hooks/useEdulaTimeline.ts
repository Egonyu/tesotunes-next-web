"use client";

import {
    useInfiniteQuery,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { MixedFeedContent, FeedModule } from "@/types/edula";
import { classifyFeedContent } from "@/types/edula";

export type TimelineView =
    | "for-you"
    | "interests"
    | "latest"
    | "following"
    | "saved";
export type TimelineEntry = MixedFeedContent & {
    section: "recent" | "discovery";
    reason: string;
};
export interface TimelineResponse {
    data: (Record<string, unknown> & {
        section: "recent" | "discovery";
        reason: string;
    })[];
    meta: {
        next_cursor: string | null;
        snapshot_at: string;
        recent_count: number;
        discovery_count: number;
        fresh_hours: number;
        window_days: number | null;
        window_limited: boolean;
    };
    pulse: { type: string; count: number; period: string }[];
}

export function timelineFingerprint(response?: TimelineResponse): string {
    if (!response) return "";
    return JSON.stringify([
        response.meta.recent_count,
        response.data
            .filter((item) => item.section === "recent")
            .map((item) => `${item.source}:${item.uuid ?? item.id}`),
    ]);
}

export function useEdulaTimeline(options: {
    view: TimelineView;
    module: FeedModule | "all";
    interests: FeedModule[];
    userId: string;
    enabled: boolean;
}) {
    const client = useQueryClient();
    const interests = [...options.interests].sort();
    const params = {
        view: options.view,
        module: options.module === "all" ? undefined : options.module,
        interests,
    };
    const key = [
        "edula-timeline",
        options.userId,
        options.view,
        options.module,
        interests,
    ];
    const feed = useInfiniteQuery({
        queryKey: key,
        queryFn: ({ pageParam }) =>
            apiGet<TimelineResponse>("/feed/timeline", {
                params: { ...params, cursor: pageParam ?? undefined },
            }),
        initialPageParam: null as string | null,
        getNextPageParam: (page) => page.meta.next_cursor ?? undefined,
        enabled: options.enabled,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    const updates = useQuery({
        queryKey: ["edula-update-check", ...key.slice(1)],
        queryFn: () => apiGet<TimelineResponse>("/feed/timeline", { params }),
        enabled: options.enabled && !!feed.data && options.view !== "saved",
        refetchInterval: 60_000,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
    });
    const seen = new Set<string>();
    const entries: TimelineEntry[] = (feed.data?.pages ?? [])
        .flatMap((page) => page.data)
        .filter((item) => {
            const identity = `${item.source}:${item.uuid ?? item.id}`;
            if (seen.has(identity)) return false;
            seen.add(identity);
            return true;
        })
        .map((raw) => ({
            ...classifyFeedContent(raw),
            section: raw.section,
            reason: raw.reason,
        }));
    return {
        ...feed,
        entries,
        meta: feed.data?.pages[0]?.meta,
        pulse: feed.data?.pages[0]?.pulse ?? [],
        hasUpdates:
            !!updates.data &&
            !!feed.data &&
            timelineFingerprint(updates.data) !==
                timelineFingerprint(feed.data.pages[0]),
        refresh: () => client.resetQueries({ queryKey: key, exact: true }),
        patchPost: (id: number, changes: Record<string, unknown>) =>
            client.setQueriesData<{
                pages: TimelineResponse[];
                pageParams: unknown[];
            }>({ queryKey: ["edula-timeline", options.userId] }, (old) =>
                old
                    ? {
                          ...old,
                          pages: old.pages.map((page) => ({
                              ...page,
                              data: page.data.map((item) =>
                                  item.source === "post" && item.id === id
                                      ? { ...item, ...changes }
                                      : item,
                              ),
                          })),
                      }
                    : old,
            ),
    };
}
