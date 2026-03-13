"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { usePlayerStore } from "@/stores";
import { useSettings } from "@/hooks/useSettings";
import { useMySubscription } from "@/hooks/useSubscriptions";
import { useRecordPlay } from "@/hooks/api";
import { useSession } from "next-auth/react";

/**
 * Maps subscription audio_quality_kbps to the quality param accepted by
 * the backend stream endpoint.  Free-tier (128 kbps) gets "normal",
 * Premium (320 kbps) gets "very_high", etc.
 */
function qualityParamFromKbps(kbps: number): string {
  if (kbps >= 320) return "very_high";
  if (kbps >= 256) return "high";
  if (kbps >= 192) return "normal";
  return "normal"; // free-tier default
}

/** Append or replace the `quality` query-string param on an audio URL. */
function applyQualityToUrl(url: string, quality: string): string {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.origin);
    u.searchParams.set("quality", quality);
    // Return pathname+search for relative, or full URL for absolute
    return url.startsWith("http") ? u.toString() : `${u.pathname}${u.search}`;
  } catch {
    // If URL parsing fails, append naively
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}quality=${encodeURIComponent(quality)}`;
  }
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const crossfadeAudioRef = useRef<HTMLAudioElement>(null);
  const crossfadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCrossfadingRef = useRef(false);

  // Play tracking refs — persist across renders without causing re-renders
  const playTrackedRef = useRef(false);
  const playStartTimeRef = useRef(0);
  const trackedSongIdRef = useRef<number | null>(null);

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    repeatMode,
    playbackRate,
    queue,
    queueIndex,
    setCurrentTime,
    setDuration,
    setIsLoading,
    next,
    pause,
  } = usePlayerStore();

  const { data: settings } = useSettings();
  const crossfadeEnabled = settings?.audio?.crossfade_enabled ?? false;
  const crossfadeDuration = settings?.audio?.crossfade_duration ?? 3;

  const effectiveVolume = isMuted ? 0 : volume;

  const { mutate: recordPlay } = useRecordPlay();
  const { status: authStatus } = useSession();

  // Subscription-based audio quality enforcement
  const { data: subscription } = useMySubscription();
  const qualityParam = useMemo(
    () => qualityParamFromKbps(subscription?.limits?.audio_quality_kbps ?? 128),
    [subscription?.limits?.audio_quality_kbps]
  );

  /** Resolve the best audio URL for a song, enforcing subscription quality. */
  const resolveAudioUrl = useCallback(
    (song: { audio_url?: string; stream_url?: string; file_url?: string } | null): string => {
      if (!song) return "";
      const raw = song.audio_url || song.stream_url || song.file_url || "";
      if (!raw) return "";
      return applyQualityToUrl(raw, qualityParam);
    },
    [qualityParam]
  );

  // Record a qualified play to the backend (30s+ or 30%+ of duration)
  const maybeRecordPlay = useCallback(() => {
    if (playTrackedRef.current || !trackedSongIdRef.current) return;

    // Skip recording if user is not authenticated (route requires auth:sanctum)
    if (authStatus !== "authenticated") return;

    const audio = audioRef.current;
    if (!audio) return;

    const durationPlayed = Math.floor(audio.currentTime - playStartTimeRef.current);
    const totalDuration = Math.floor(audio.duration) || 0;

    // Backend qualification: 30s+ played OR 30%+ of song completed
    const isQualified =
      durationPlayed >= 30 ||
      (totalDuration > 0 && durationPlayed / totalDuration >= 0.3);

    if (isQualified) {
      playTrackedRef.current = true;
      recordPlay(
        {
          song_id: trackedSongIdRef.current,
          duration_played: durationPlayed,
          total_duration: totalDuration > 0 ? totalDuration : undefined,
          completed: totalDuration > 0 && audio.currentTime >= totalDuration - 1,
        },
        {
          onError: () => {
            // Allow retry on next timeupdate if recording failed
            playTrackedRef.current = false;
          },
        }
      );
    }
  }, [authStatus, recordPlay]);

  // Clean up crossfade timer
  const clearCrossfadeTimer = useCallback(() => {
    if (crossfadeTimerRef.current) {
      clearInterval(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
  }, []);

  // Start crossfade transition
  const startCrossfade = useCallback(() => {
    if (isCrossfadingRef.current) return;

    const nextIndex = queueIndex + 1;
    const nextSong = queue[nextIndex];
    if (!nextSong || !crossfadeAudioRef.current || !audioRef.current) return;

    isCrossfadingRef.current = true;
    const fadeAudio = crossfadeAudioRef.current;
    const mainAudio = audioRef.current;

    // Prepare next track on crossfade element
    fadeAudio.src = resolveAudioUrl(nextSong);
    fadeAudio.volume = 0;
    fadeAudio.playbackRate = playbackRate;
    fadeAudio.load();

    fadeAudio.play().catch(() => {});

    const steps = 20; // number of fade steps
    const stepTime = (crossfadeDuration * 1000) / steps;
    let step = 0;

    clearCrossfadeTimer();
    crossfadeTimerRef.current = setInterval(() => {
      step++;
      const progress = step / steps;

      // Fade out current, fade in next
      mainAudio.volume = Math.max(0, effectiveVolume * (1 - progress));
      fadeAudio.volume = Math.min(effectiveVolume, effectiveVolume * progress);

      if (step >= steps) {
        clearCrossfadeTimer();
        isCrossfadingRef.current = false;
        // Trigger next track in store (will swap main audio src)
        next();
      }
    }, stepTime);
  }, [queue, queueIndex, crossfadeDuration, effectiveVolume, playbackRate, next, clearCrossfadeTimer]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        pause();
      });
    } else {
      audioRef.current.pause();
      // Also pause crossfade audio if paused
      if (crossfadeAudioRef.current && !crossfadeAudioRef.current.paused) {
        crossfadeAudioRef.current.pause();
      }
    }
  }, [isPlaying, pause]);

  // Handle volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = effectiveVolume;
    // Don't override crossfade audio volume during crossfade
    if (crossfadeAudioRef.current && !isCrossfadingRef.current) {
      crossfadeAudioRef.current.volume = 0;
    }
  }, [effectiveVolume]);

  // Handle playback rate
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackRate;
    if (crossfadeAudioRef.current) {
      crossfadeAudioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle song change
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    // Record play for previous song before switching
    maybeRecordPlay();

    // Reset tracking for new song
    playTrackedRef.current = false;
    playStartTimeRef.current = 0;
    trackedSongIdRef.current = currentSong.id;

    // Stop any ongoing crossfade
    clearCrossfadeTimer();
    isCrossfadingRef.current = false;
    if (crossfadeAudioRef.current) {
      crossfadeAudioRef.current.pause();
      crossfadeAudioRef.current.src = "";
    }

    audioRef.current.src = resolveAudioUrl(currentSong);
    audioRef.current.volume = effectiveVolume;
    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        pause();
      });
    }
  }, [currentSong?.id]);

  // Handle seeking
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // Only seek if difference is significant (user initiated)
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    setCurrentTime(audio.currentTime);

    // Try to record play once qualification threshold is met
    maybeRecordPlay();

    // Check if we should begin crossfade
    if (
      crossfadeEnabled &&
      !isCrossfadingRef.current &&
      audio.duration > 0 &&
      repeatMode !== "one" &&
      audio.duration - audio.currentTime <= crossfadeDuration &&
      audio.duration - audio.currentTime > 0.5 // Don't start if too close to end
    ) {
      startCrossfade();
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    setIsLoading(false);
  };

  const handleEnded = () => {
    // Record play on song completion
    maybeRecordPlay();

    // If crossfade already triggered next(), skip
    if (isCrossfadingRef.current) return;

    if (repeatMode === "one") {
      if (audioRef.current) {
        // Reset tracking for repeat plays
        playTrackedRef.current = false;
        playStartTimeRef.current = 0;
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      next();
    }
  };

  const handleWaiting = () => setIsLoading(true);
  const handlePlaying = () => setIsLoading(false);

  // Cleanup on unmount — record any in-progress play
  useEffect(() => {
    return () => {
      clearCrossfadeTimer();
      maybeRecordPlay();
    };
  }, [clearCrossfadeTimer, maybeRecordPlay]);

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        preload="metadata"
      />
      {/* Second audio element for crossfade */}
      <audio ref={crossfadeAudioRef} preload="metadata" />
    </>
  );
}
