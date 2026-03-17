'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { apiGet } from '@/lib/api';
import { useCanAccess } from '@/hooks/useSubscriptions';
import { ADS_ENABLED } from '@/lib/features';
import { useSession } from 'next-auth/react';

// ============================================================================
// Types
// ============================================================================

export type AdPlacement = 'top_banner' | 'sidebar' | 'in_feed' | 'audio_preroll' | 'video_preroll';
export type AdFormat = 'image' | 'audio' | 'video' | 'html';

export interface Ad {
  id: number;
  title: string;
  advertiser: string;
  format: AdFormat;
  placement: AdPlacement;
  media_url: string;
  click_url: string;
  duration_seconds?: number; // for audio/video ads
  width?: number;
  height?: number;
  alt_text?: string;
  impression_url: string; // ping when shown
  click_track_url: string; // ping on click
}

interface AdResponse {
  data: Ad | null;
  fallback?: Ad | null;
}

// ============================================================================
// Config
// ============================================================================

/** Number of songs between audio ads for free-tier users */
export const SONGS_BETWEEN_ADS = 4;

// ============================================================================
// Hooks
// ============================================================================

/**
 * Whether the current user should see ads.
 * Free-tier users see ads; premium/artist/label users do not.
 */
export function useShouldShowAds(): boolean {
  const { status } = useSession();
  const streamWithAds = useCanAccess('stream_with_ads');
  const adFree = useCanAccess('ad_free');

  if (!ADS_ENABLED || status !== 'authenticated') {
    return false;
  }

  // Free tier has stream_with_ads=true, ad_free=false
  return streamWithAds && !adFree;
}

/**
 * Fetch an ad for a specific placement.
 * Only fetches if user should see ads—returns null for premium users.
 */
export function useAd(placement: AdPlacement) {
  const shouldShow = useShouldShowAds();

  return useQuery({
    queryKey: ['ads', placement],
    queryFn: () => apiGet<AdResponse>(`/ads?placement=${placement}`),
    enabled: shouldShow,
    staleTime: 5 * 60 * 1000, // cache ad for 5 min
    refetchOnWindowFocus: false,
    select: (res) => res.data,
  });
}

/**
 * Track ad impressions and clicks.
 * Uses beacon API for reliability (fires even on navigation).
 */
export function useAdTracking() {
  const trackedImpressions = useRef(new Set<number>());

  const trackImpression = useCallback((ad: Ad) => {
    if (trackedImpressions.current.has(ad.id)) return;
    trackedImpressions.current.add(ad.id);

    if (ad.impression_url) {
      if (typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(ad.impression_url);
      } else {
        fetch(ad.impression_url, { method: 'POST', keepalive: true }).catch(() => {});
      }
    }
  }, []);

  const trackClick = useCallback((ad: Ad) => {
    if (ad.click_track_url) {
      if (typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(ad.click_track_url);
      } else {
        fetch(ad.click_track_url, { method: 'POST', keepalive: true }).catch(() => {});
      }
    }
  }, []);

  return { trackImpression, trackClick };
}

/**
 * Audio ad counter — tracks songs played since last ad.
 * Used by the player to decide when to insert an audio ad.
 */
export function useAudioAdCounter() {
  const songsPlayed = useRef(0);

  const incrementAndCheck = useCallback((): boolean => {
    songsPlayed.current += 1;
    if (songsPlayed.current >= SONGS_BETWEEN_ADS) {
      songsPlayed.current = 0;
      return true; // time for an ad
    }
    return false;
  }, []);

  const reset = useCallback(() => {
    songsPlayed.current = 0;
  }, []);

  return { incrementAndCheck, reset };
}
