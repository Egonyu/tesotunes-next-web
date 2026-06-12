'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { useCanAccess } from '@/hooks/useSubscriptions';
import { ADS_ENABLED } from '@/lib/features';
import { useSession } from 'next-auth/react';

// ── Placement keys (must match AdPlacement enum in backend) ──────────────────

export type AdPlacement =
  // Web
  | 'web_top_banner'
  | 'web_sidebar_top'
  | 'web_sidebar_bottom'
  | 'web_in_feed_1'
  | 'web_in_feed_2'
  | 'web_player_above'
  | 'web_between_songs'
  | 'web_song_page'
  | 'web_artist_page'
  | 'web_search_inline'
  // Mobile
  | 'mobile_home_banner'
  | 'mobile_home_in_feed'
  | 'mobile_search_banner'
  | 'mobile_library_banner'
  | 'mobile_player_above'
  | 'mobile_between_songs';

// ── Ad shape returned by GET /api/ads ────────────────────────────────────────

export interface Ad {
  id: number;
  type: 'image' | 'html' | 'audio' | 'native' | 'google_adsense';
  format: string;
  // Image / native / html
  image_url: string | null;
  click_url: string | null;
  cta_text: string | null;
  // HTML
  html_content: string | null;
  // Audio
  audio_url: string | null;
  audio_duration_seconds: number | null;
  // Native
  native_headline: string | null;
  native_body: string | null;
  native_image_url: string | null;
  // AdSense
  adsense_slot_id: string | null;
  adsense_format: string | null;
  // Context
  placement_key: AdPlacement;
}

interface AdResponse {
  data: Ad | null;
}

// ── Config ────────────────────────────────────────────────────────────────────

/** Number of songs played between audio ads for free-tier users. */
export const SONGS_BETWEEN_ADS = 4;

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Whether the current user should see ads.
 * Free-tier (stream_with_ads=true, ad_free=false) users see ads.
 */
export function useShouldShowAds(): boolean {
  const { status } = useSession();
  const streamWithAds = useCanAccess('stream_with_ads');
  const adFree = useCanAccess('ad_free');

  if (!ADS_ENABLED || status !== 'authenticated') {
    return false;
  }

  return streamWithAds && !adFree;
}

/**
 * Fetch the active ad for a placement zone.
 * Passes device type so the backend can respect zone device targeting.
 * Only fetches if user should see ads.
 */
export function useAd(placement: AdPlacement) {
  const shouldShow = useShouldShowAds();
  const device = typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';

  return useQuery({
    queryKey: ['ads', placement, device],
    queryFn: () => apiGet<AdResponse>(`/ads?placement=${placement}&device=${device}`),
    enabled: shouldShow,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (res) => res.data,
  });
}

/**
 * Track ad impressions and clicks via our backend tracking endpoints.
 * Uses beacon API for reliability (fires even on page navigation away).
 */
export function useAdTracking() {
  const trackedImpressions = useRef(new Set<number>());
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';

  const trackImpression = useCallback(
    (ad: Ad, pageUrl?: string) => {
      if (trackedImpressions.current.has(ad.id)) return;
      trackedImpressions.current.add(ad.id);

      const payload = JSON.stringify({
        ad_id: ad.id,
        placement_key: ad.placement_key,
        page_url: pageUrl ?? (typeof window !== 'undefined' ? window.location.href : null),
      });

      const url = `${apiBase}/api/ads/impression`;
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(url, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      }
    },
    [apiBase]
  );

  const trackClick = useCallback(
    (ad: Ad) => {
      const payload = JSON.stringify({ ad_id: ad.id, placement_key: ad.placement_key });
      const url = `${apiBase}/api/ads/click`;
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(url, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      }
    },
    [apiBase]
  );

  return { trackImpression, trackClick };
}

/**
 * Audio ad counter — tracks how many songs have played since the last ad.
 * When SONGS_BETWEEN_ADS threshold is reached, returns true and resets.
 */
export function useAudioAdCounter() {
  const songsPlayed = useRef(0);

  const incrementAndCheck = useCallback((): boolean => {
    songsPlayed.current += 1;
    if (songsPlayed.current >= SONGS_BETWEEN_ADS) {
      songsPlayed.current = 0;
      return true;
    }
    return false;
  }, []);

  const reset = useCallback(() => {
    songsPlayed.current = 0;
  }, []);

  return { incrementAndCheck, reset };
}
