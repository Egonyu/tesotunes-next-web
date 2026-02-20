'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAd, useAdTracking, useShouldShowAds, type AdPlacement } from '@/hooks/useAds';

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * Display banner ad component.
 * Renders nothing for premium users or when no ad is available.
 * Tracks impressions on mount and clicks on interaction.
 */
export function AdBanner({ placement, className }: AdBannerProps) {
  const shouldShow = useShouldShowAds();
  const { data: ad, isLoading } = useAd(placement);
  const { trackImpression, trackClick } = useAdTracking();
  const hasTracked = useRef(false);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (ad && !hasTracked.current) {
      trackImpression(ad);
      hasTracked.current = true;
    }
  }, [ad, trackImpression]);

  if (!shouldShow || isLoading || !ad) return null;

  const handleClick = () => {
    trackClick(ad);
    if (ad.click_url) {
      window.open(ad.click_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg cursor-pointer group',
        className
      )}
      onClick={handleClick}
      role="banner"
      aria-label={`Ad: ${ad.alt_text || ad.title}`}
    >
      {ad.format === 'image' && ad.media_url && (
        <Image
          src={ad.media_url}
          alt={ad.alt_text || ad.title}
          width={ad.width || 728}
          height={ad.height || 90}
          className="w-full h-auto object-cover"
          unoptimized
        />
      )}

      {ad.format === 'html' && ad.media_url && (
        <iframe
          src={ad.media_url}
          title={ad.title}
          className="w-full border-0"
          style={{ height: ad.height || 90 }}
          sandbox="allow-scripts allow-popups"
        />
      )}

      {/* Ad label */}
      <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] bg-black/50 text-white rounded">
        Ad
      </span>
    </div>
  );
}
