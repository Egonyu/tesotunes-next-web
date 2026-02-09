"use client";

import { useRef, useEffect, useCallback } from "react";
import { usePlayerStore } from "@/stores";
import { useSettings } from "@/hooks/useSettings";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const crossfadeAudioRef = useRef<HTMLAudioElement>(null);
  const crossfadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCrossfadingRef = useRef(false);

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
    fadeAudio.src = nextSong.stream_url || nextSong.file_url || "";
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

    // Stop any ongoing crossfade
    clearCrossfadeTimer();
    isCrossfadingRef.current = false;
    if (crossfadeAudioRef.current) {
      crossfadeAudioRef.current.pause();
      crossfadeAudioRef.current.src = "";
    }

    audioRef.current.src = currentSong.stream_url || currentSong.file_url || "";
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
    // If crossfade already triggered next(), skip
    if (isCrossfadingRef.current) return;

    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      next();
    }
  };

  const handleWaiting = () => setIsLoading(true);
  const handlePlaying = () => setIsLoading(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearCrossfadeTimer();
  }, [clearCrossfadeTimer]);

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
