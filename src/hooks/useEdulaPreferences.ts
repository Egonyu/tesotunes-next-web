"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/api";
import type { FeedModule } from "@/types/edula";
import {
    TIMELINE_CATEGORIES,
    type TimelinePreferences,
} from "@/components/edula/timeline-model";

const DEFAULTS: TimelinePreferences = {
    interests: ["music", "podcasts"],
    saved: [],
    hidden: [],
};
type PreferenceChange = {
    interests?: FeedModule[];
    action?: "save" | "unsave" | "hide" | "unhide" | "restore-hidden";
    identity?: string;
};

export function useEdulaPreferences(
    userId: string,
    authenticated: boolean,
    enabled: boolean,
) {
    const client = useQueryClient();
    const key = ["edula-preferences", userId];
    const [guest, setGuest] = useState(DEFAULTS);
    const [guestReady, setGuestReady] = useState(false);
    useEffect(() => {
        if (!enabled || authenticated) return;
        try {
            const saved = JSON.parse(
                localStorage.getItem("edula-interests:guest") ?? "null",
            );
            if (Array.isArray(saved))
                setGuest({
                    ...DEFAULTS,
                    interests: saved.filter((item) =>
                        TIMELINE_CATEGORIES.some(
                            (category) => category.key === item,
                        ),
                    ),
                });
        } catch {
            /* Browsing still works when storage is unavailable. */
        }
        setGuestReady(true);
    }, [enabled, authenticated]);
    const query = useQuery({
        queryKey: key,
        queryFn: () =>
            apiGet<{ data: TimelinePreferences }>(
                "/feed/timeline/preferences",
            ).then((result) => result.data),
        enabled: enabled && authenticated,
        staleTime: 60_000,
        retry: 1,
    });
    const update = useMutation({
        mutationFn: (change: PreferenceChange) =>
            apiPut<{ data: TimelinePreferences }>(
                "/feed/timeline/preferences",
                change,
            ).then((result) => result.data),
        onSuccess: (data) => client.setQueryData(key, data),
    });
    const change = async (input: PreferenceChange) => {
        if (authenticated) return update.mutateAsync(input);
        if (input.action) throw new Error("Sign in to save or hide items.");
        const next = {
            ...guest,
            interests: input.interests ?? guest.interests,
        };
        setGuest(next);
        try {
            localStorage.setItem(
                "edula-interests:guest",
                JSON.stringify(next.interests),
            );
        } catch {
            /* Selection remains usable for this session. */
        }
        return next;
    };
    return {
        state: authenticated ? (query.data ?? DEFAULTS) : guest,
        ready: enabled && (authenticated ? query.isFetched : guestReady),
        canWrite: !authenticated || query.isSuccess,
        isError: authenticated && query.isError,
        isPending: update.isPending,
        retry: query.refetch,
        change,
    };
}
