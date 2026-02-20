'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, SkipForward, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAd,
  useAdTracking,
  useAudioAdCounter,
  useShouldShowAds,
  SONGS_BETWEEN_ADS,
} from '@/hooks/useAds';
import { usePlayerStore } from '@/stores/player';

/**
 * AudioAdManager — Intercepts between songs for free-tier users.
 *
 * Renders a hidden audio element and a visible overlay when an audio ad plays.
 * After every N songs (SONGS_BETWEEN_ADS), it pauses the music queue,
 * plays a short audio ad, then resumes.
 */
export function AudioAdManager() {
  const shouldShow = useShouldShowAds();
  const { data: adData } = useAd('audio_preroll');
  const { trackImpression, trackClick } = useAdTracking();
  const { incrementAndCheck } = useAudioAdCounter();

  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adTimeRemaining, setAdTimeRemaining] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const prevSongId = useRef<number | string | null>(null);

  // Detect song transitions
  useEffect(() => {
    if (!shouldShow || !currentSong || !adData) return;

    const songId = currentSong.id;
    if (songId === prevSongId.current) return;

    // First song should play without ad
    if (prevSongId.current !== null) {
      const shouldPlayAd = incrementAndCheck();
      if (shouldPlayAd) {
        playAd();
      }
    }
    prevSongId.current = songId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id, shouldShow]);

  const playAd = useCallback(() => {
    if (!adData || !audioRef.current) return;

    // Pause actual music
    usePlayerStore.getState().pause();

    setIsPlayingAd(true);
    trackImpression(adData);

    audioRef.current.src = adData.media_url;
    audioRef.current.volume = usePlayerStore.getState().volume;
    audioRef.current.play().catch(() => {
      // Autoplay blocked — skip the ad
      finishAd();
    });
  }, [adData, trackImpression]);

  const finishAd = useCallback(() => {
    setIsPlayingAd(false);
    setAdTimeRemaining(0);
    // Resume music
    usePlayerStore.getState().play(usePlayerStore.getState().currentSong!);
  }, []);

  const handleAdTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const remaining = Math.ceil(
      audioRef.current.duration - audioRef.current.currentTime
    );
    setAdTimeRemaining(remaining);
  }, []);

  const handleAdEnded = useCallback(() => {
    finishAd();
  }, [finishAd]);

  const handleAdClick = useCallback(() => {
    if (!adData) return;
    trackClick(adData);
    if (adData.click_url) {
      window.open(adData.click_url, '_blank', 'noopener,noreferrer');
    }
  }, [adData, trackClick]);

  const handleSkipAd = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    finishAd();
  }, [finishAd]);

  if (!shouldShow) return null;

  return (
    <>
      {/* Hidden audio element for ad playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAdTimeUpdate}
        onEnded={handleAdEnded}
        onError={() => finishAd()}
        preload="none"
      />

      {/* Ad overlay shown during audio ad */}
      {isPlayingAd && adData && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{adData.title}</p>
                <p className="text-xs opacity-80">
                  Ad by {adData.advertiser}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAdClick}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-lg text-xs hover:bg-white/30 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Learn More
              </button>

              {/* Skip after 5 seconds */}
              {adTimeRemaining <= (adData.duration_seconds ?? 15) - 5 ? (
                <button
                  onClick={handleSkipAd}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/30 rounded-lg text-xs hover:bg-white/40 transition-colors"
                >
                  <SkipForward className="h-3 w-3" />
                  Skip Ad
                </button>
              ) : (
                <span className="text-xs opacity-80">
                  Skip in {adTimeRemaining - ((adData.duration_seconds ?? 15) - 5)}s
                </span>
              )}

              <span className="text-xs font-mono opacity-60">
                0:{adTimeRemaining.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
