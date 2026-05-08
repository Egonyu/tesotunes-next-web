"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { usePlayerStore } from "@/stores";
import { useSettings } from "@/hooks/useSettings";
import { useRecordPlay, useSavePosition, useResumePosition } from "@/hooks/api";
import { useSession } from "next-auth/react";
import { resolvePlayableAudioUrl } from "@/lib/media";
import { useEffectiveQuality, qualityParamFromSlug } from "@/components/player/StreamingQualityPicker";

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

  // Forward-seek tracking — any forward seek within a play session disqualifies stream counting
  const forwardSeekedRef = useRef(false);
  // Captures audio position at the moment a seek starts (before the jump)
  const preSeekedPositionRef = useRef(0);

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
    setResumePosition,
    setShowResumePrompt,
  } = usePlayerStore();

  const { data: settings } = useSettings();
  const crossfadeEnabled = settings?.audio?.crossfade_enabled ?? false;
  const crossfadeDuration = settings?.audio?.crossfade_duration ?? 3;

  const effectiveVolume = isMuted ? 0 : volume;

  const { mutate: recordPlay } = useRecordPlay();
  const { mutate: savePositionMutate } = useSavePosition();
  const { status: authStatus } = useSession();

  // Quality = user preference clamped to subscription cap (reads from both settings + subscription).
  // undefined while loading — audio URLs are not recomputed until both queries settle,
  // preventing a mid-playback src flip for premium users on first load.
  const effectiveQualitySlug = useEffectiveQuality();
  const qualityParam = useMemo(
    () => effectiveQualitySlug ? qualityParamFromSlug(effectiveQualitySlug) : null,
    [effectiveQualitySlug]
  );

  // Fetch saved resume position for the current song (auto-refetches on song change)
  const { data: resumeData } = useResumePosition(
    authStatus === "authenticated" ? currentSong?.id ?? null : null
  );

  // When resume position data arrives, surface it to the store for the UI to display
  useEffect(() => {
    if (!resumeData?.data) return;
    const pos = resumeData.data.position_seconds;
    // Only offer resume if position is meaningfully into the song (>5s) and wasn't at the very end
    if (pos > 5) {
      setResumePosition(pos);
      setShowResumePrompt(true);
    } else {
      setResumePosition(null);
      setShowResumePrompt(false);
    }
  }, [resumeData, setResumePosition, setShowResumePrompt]);

  /** Resolve the best audio URL for a song, enforcing subscription quality. */
  const resolveAudioUrl = useCallback(
    (song: { audio_url?: string | null; stream_url?: string | null; file_url?: string | null; preview_url?: string | null } | null): string => {
      const raw = resolvePlayableAudioUrl(song);
      if (!raw) return "";
      // Skip quality param until both settings + subscription have loaded
      if (!qualityParam) return raw;
      return applyQualityToUrl(raw, qualityParam);
    },
    [qualityParam]
  );

  /**
   * Persist the current playback position for a song.
   * Pass 0 to clear (e.g. after completion so we don't offer a stale resume).
   */
  const savePosition = useCallback(
    (songId: number, positionSeconds: number) => {
      if (authStatus !== "authenticated") return;
      savePositionMutate({ song_id: songId, position_seconds: positionSeconds });
    },
    [authStatus, savePositionMutate]
  );

  /**
   * Record a qualified play to the backend.
   * Stream only counts when ≥90% listened AND no forward seek occurred.
   */
  const maybeRecordPlay = useCallback(() => {
    if (playTrackedRef.current || !trackedSongIdRef.current) return;
    if (authStatus !== "authenticated") return;

    const audio = audioRef.current;
    if (!audio) return;

    const durationPlayed = Math.floor(audio.currentTime - playStartTimeRef.current);
    const totalDuration = Math.floor(audio.duration) || 0;

    // 90% continuous listen required; forward-seeking disqualifies
    const completionRatio = totalDuration > 0 ? durationPlayed / totalDuration : 0;
    const isQualified = !forwardSeekedRef.current && completionRatio >= 0.9;

    if (isQualified) {
      playTrackedRef.current = true;
      recordPlay(
        {
          song_id: trackedSongIdRef.current,
          duration_played: durationPlayed,
          total_duration: totalDuration > 0 ? totalDuration : undefined,
          completed: totalDuration > 0 && audio.currentTime >= totalDuration - 1,
          seeked_forward: false,
        },
        {
          onError: () => {
            // Allow retry on next timeupdate if recording failed
            playTrackedRef.current = false;
          },
        }
      );
    } else if (forwardSeekedRef.current && !playTrackedRef.current && completionRatio >= 0.3) {
      // Record the play for history/analytics, but mark it as seeked so it won't count as a stream
      playTrackedRef.current = true;
      recordPlay({
        song_id: trackedSongIdRef.current,
        duration_played: durationPlayed,
        total_duration: totalDuration > 0 ? totalDuration : undefined,
        completed: false,
        seeked_forward: true,
      });
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

    // Save position for previous song before switching (if we were > 5s in)
    const prevSongId = trackedSongIdRef.current;
    if (prevSongId && audioRef.current.currentTime > 5) {
      savePosition(prevSongId, Math.floor(audioRef.current.currentTime));
    }

    // Record play for previous song before switching
    maybeRecordPlay();

    // Reset all tracking for new song
    playTrackedRef.current = false;
    playStartTimeRef.current = 0;
    forwardSeekedRef.current = false;
    preSeekedPositionRef.current = 0;
    trackedSongIdRef.current = currentSong.id;

    // Reset resume prompt state — the useResumePosition query will repopulate it
    setResumePosition(null);
    setShowResumePrompt(false);

    // Stop any ongoing crossfade
    clearCrossfadeTimer();
    isCrossfadingRef.current = false;
    if (crossfadeAudioRef.current) {
      crossfadeAudioRef.current.pause();
      crossfadeAudioRef.current.src = "";
    }

    const resolvedUrl = resolveAudioUrl(currentSong);
    if (!resolvedUrl) {
      setIsLoading(false);
      pause();
      return;
    }

    audioRef.current.src = resolvedUrl;
    audioRef.current.volume = effectiveVolume;
    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        pause();
      });
    }
  }, [currentSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    // Record actual start time once duration is known
    playStartTimeRef.current = audioRef.current.currentTime;
  };

  const handleEnded = () => {
    // Song completed naturally — clear saved position so resume won't trigger next time
    if (trackedSongIdRef.current) {
      savePosition(trackedSongIdRef.current, 0);
    }

    // Record play on song completion
    maybeRecordPlay();

    // If crossfade already triggered next(), skip
    if (isCrossfadingRef.current) return;

    if (repeatMode === "one") {
      if (audioRef.current) {
        // Reset tracking for repeat plays
        playTrackedRef.current = false;
        playStartTimeRef.current = 0;
        forwardSeekedRef.current = false;
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      next();
    }
  };

  const handlePause = () => {
    if (!audioRef.current || !trackedSongIdRef.current) return;
    const pos = Math.floor(audioRef.current.currentTime);
    // Save position on pause so the user can resume next time
    if (pos > 5) {
      savePosition(trackedSongIdRef.current, pos);
    }
  };

  // Capture position just before a seek begins so we can compare after
  const handleSeeking = () => {
    if (!audioRef.current) return;
    preSeekedPositionRef.current = audioRef.current.currentTime;
  };

  // After seek completes, check if it was a forward skip (>3 s)
  const handleSeeked = () => {
    if (!audioRef.current) return;
    const jumped = audioRef.current.currentTime - preSeekedPositionRef.current;
    if (jumped > 3) {
      forwardSeekedRef.current = true;
    }
  };

  const handleWaiting = () => setIsLoading(true);
  const handlePlaying = () => setIsLoading(false);

  // Cleanup on unmount — record any in-progress play and save position
  useEffect(() => {
    return () => {
      clearCrossfadeTimer();
      if (trackedSongIdRef.current && audioRef.current && audioRef.current.currentTime > 5) {
        savePosition(trackedSongIdRef.current, Math.floor(audioRef.current.currentTime));
      }
      maybeRecordPlay();
    };
  }, [clearCrossfadeTimer, maybeRecordPlay, savePosition]);

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPause={handlePause}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        preload="metadata"
      />
      {/* Second audio element for crossfade */}
      <audio ref={crossfadeAudioRef} preload="metadata" />
    </>
  );
}
