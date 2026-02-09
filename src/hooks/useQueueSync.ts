import { useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/api";
import { usePlayerStore } from "@/stores";
import type { Song } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface ServerQueue {
  queue: Song[];
  current_index: number;
  current_song_id: number | null;
  repeat_mode: string;
  is_shuffled: boolean;
}

// ============================================================================
// Save Queue to Server (debounced)
// ============================================================================

export function useSaveQueue() {
  return useMutation({
    mutationFn: (data: {
      queue_song_ids: number[];
      current_index: number;
      current_song_id: number | null;
      repeat_mode: string;
      is_shuffled: boolean;
    }) => apiPut("/player/queue", data),
  });
}

// ============================================================================
// Restore Queue from Server
// ============================================================================

export function useRestoreQueue() {
  return useQuery({
    queryKey: ["player-queue"],
    queryFn: () =>
      apiGet<{ data: ServerQueue }>("/player/queue").then((res) => res.data),
    staleTime: Infinity, // Only fetch once per session
    retry: 1,
  });
}

// ============================================================================
// Queue Sync Hook (use in app layout)
// ============================================================================

export function useQueueSync() {
  const saveQueue = useSaveQueue();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  // Debounced save - saves queue to server 5s after last change
  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const state = usePlayerStore.getState();
      const payload = {
        queue_song_ids: state.queue.map((s) => s.id),
        current_index: state.queueIndex,
        current_song_id: state.currentSong?.id ?? null,
        repeat_mode: state.repeatMode,
        is_shuffled: state.isShuffled,
      };

      const hash = JSON.stringify(payload);
      if (hash === lastSavedRef.current) return;
      lastSavedRef.current = hash;

      saveQueue.mutate(payload);
    }, 5000);
  }, [saveQueue]);

  // Subscribe to queue changes in store
  useEffect(() => {
    const unsub = usePlayerStore.subscribe(
      (state, prevState) => {
        // Only save when queue-related state changes
        if (
          state.queue !== prevState.queue ||
          state.queueIndex !== prevState.queueIndex ||
          state.currentSong?.id !== prevState.currentSong?.id
        ) {
          debouncedSave();
        }
      }
    );

    return () => {
      unsub();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [debouncedSave]);
}
