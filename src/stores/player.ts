import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song, RepeatMode } from "@/types";

interface PlayerState {
  // State
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  originalQueue: Song[]; // For unshuffling

  // Actions
  play: (song: Song, queue?: Song[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  cycleRepeat: () => void;
  toggle: () => void;
  toggleShuffle: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSong: null,
      queue: [],
      queueIndex: 0,
      isPlaying: false,
      isLoading: false,
      volume: 0.8,
      isMuted: false,
      currentTime: 0,
      duration: 0,
      repeatMode: "off",
      isShuffled: false,
      originalQueue: [],
      playbackRate: 1,

      // Actions
      play: (song, queue) => {
        const newQueue = queue || [song];
        const index = newQueue.findIndex((s) => s.id === song.id);
        set({
          currentSong: song,
          queue: newQueue,
          originalQueue: newQueue,
          queueIndex: index >= 0 ? index : 0,
          isPlaying: true,
          currentTime: 0,
        });
      },

      pause: () => set({ isPlaying: false }),

      resume: () => set({ isPlaying: true }),

      next: () => {
        const { queue, queueIndex, repeatMode, isShuffled } = get();
        if (queue.length === 0) return;

        let nextIndex = queueIndex + 1;

        if (nextIndex >= queue.length) {
          if (repeatMode === "all") {
            nextIndex = 0;
          } else {
            set({ isPlaying: false });
            return;
          }
        }

        set({
          currentSong: queue[nextIndex],
          queueIndex: nextIndex,
          currentTime: 0,
          isPlaying: true,
        });
      },

      previous: () => {
        const { queue, queueIndex, currentTime } = get();
        if (queue.length === 0) return;

        // If more than 3 seconds in, restart song
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }

        let prevIndex = queueIndex - 1;
        if (prevIndex < 0) {
          prevIndex = queue.length - 1;
        }

        set({
          currentSong: queue[prevIndex],
          queueIndex: prevIndex,
          currentTime: 0,
          isPlaying: true,
        });
      },

      seek: (time) => set({ currentTime: time }),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: volume === 0 }),

      toggleMute: () => {
        const { isMuted, volume } = get();
        set({ isMuted: !isMuted });
      },

      toggleRepeat: () => {
        const { repeatMode } = get();
        const modes: RepeatMode[] = ["off", "all", "one"];
        const currentIndex = modes.indexOf(repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        set({ repeatMode: modes[nextIndex] });
      },

      cycleRepeat: () => {
        // Alias for toggleRepeat
        const { repeatMode } = get();
        const modes: RepeatMode[] = ["off", "all", "one"];
        const currentIndex = modes.indexOf(repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        set({ repeatMode: modes[nextIndex] });
      },

      toggle: () => {
        const { isPlaying } = get();
        set({ isPlaying: !isPlaying });
      },

      toggleShuffle: () => {
        const { isShuffled, queue, originalQueue, currentSong } = get();

        if (isShuffled) {
          // Restore original order
          const currentIndex = originalQueue.findIndex(
            (s) => s.id === currentSong?.id
          );
          set({
            isShuffled: false,
            queue: originalQueue,
            queueIndex: currentIndex >= 0 ? currentIndex : 0,
          });
        } else {
          // Shuffle queue
          const shuffled = shuffleArray(queue);
          const currentIndex = shuffled.findIndex(
            (s) => s.id === currentSong?.id
          );
          set({
            isShuffled: true,
            queue: shuffled,
            queueIndex: currentIndex >= 0 ? currentIndex : 0,
          });
        }
      },

      addToQueue: (song) => {
        const { queue, originalQueue } = get();
        set({
          queue: [...queue, song],
          originalQueue: [...originalQueue, song],
        });
      },

      removeFromQueue: (index) => {
        const { queue, queueIndex } = get();
        const newQueue = queue.filter((_, i) => i !== index);
        const newIndex = index < queueIndex ? queueIndex - 1 : queueIndex;
        set({
          queue: newQueue,
          queueIndex: Math.min(newIndex, newQueue.length - 1),
        });
      },

      clearQueue: () => {
        set({
          queue: [],
          originalQueue: [],
          queueIndex: 0,
          currentSong: null,
          isPlaying: false,
        });
      },

      setCurrentTime: (time) => set({ currentTime: time }),

      setDuration: (duration) => set({ duration }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setPlaybackRate: (rate) => set({ playbackRate: rate }),
    }),
    {
      name: "tesotunes-player",
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
        playbackRate: state.playbackRate,
        queue: state.queue,
        originalQueue: state.originalQueue,
        queueIndex: state.queueIndex,
        currentSong: state.currentSong,
      }),
    }
  )
);
