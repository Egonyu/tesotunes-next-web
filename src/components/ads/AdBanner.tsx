'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAd, useAdTracking, useShouldShowAds, type Ad, type AdPlacement } from '@/hooks/useAds';
import { AdErrorBoundary } from './AdErrorBoundary';

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Renders the active ad for a placement zone.
 * Returns null for premium users, when the zone is disabled, or when no ad is available.
 * Tracks impressions on mount and clicks on interaction.
 */
export function AdBanner({ placement, className, width, height }: AdBannerProps) {
  const shouldShow = useShouldShowAds();
  const { data: ad, isLoading } = useAd(placement);
  const { trackImpression, trackClick } = useAdTracking();
  const hasTracked = useRef(false);

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
      className={cn('relative overflow-hidden rounded-lg cursor-pointer group', className)}
      onClick={handleClick}
      role="banner"
      aria-label="Advertisement"
    >
      <AdErrorBoundary>
        <AdContent ad={ad} width={width} height={height} />
      </AdErrorBoundary>

      {/* Required "Ad" label */}
      <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] bg-black/50 text-white rounded select-none">
        Ad
      </span>
    </div>
  );
}

function AdContent({ ad, width, height }: { ad: Ad; width?: number; height?: number }) {
  if (ad.type === 'image' && ad.image_url) {
    return (
      <Image
        src={ad.image_url}
        alt="Advertisement"
        width={width ?? 728}
        height={height ?? 90}
        className="w-full h-auto object-cover"
        unoptimized
      />
    );
  }

  if (ad.type === 'html' && ad.html_content) {
    return (
      <iframe
        srcDoc={ad.html_content}
        sandbox="allow-scripts allow-popups"
        title="Advertisement"
        style={{ border: 'none', width: '100%', minHeight: height ?? 90 }}
        scrolling="no"
      />
    );
  }

  if (ad.type === 'native') {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        {ad.native_image_url && (
          <Image src={ad.native_image_url} alt="" width={60} height={60} className="rounded object-cover shrink-0" unoptimized />
        )}
        <div className="flex-1 min-w-0">
          {ad.native_headline && <p className="text-sm font-medium truncate">{ad.native_headline}</p>}
          {ad.native_body && <p className="text-xs text-muted-foreground line-clamp-2">{ad.native_body}</p>}
        </div>
        {ad.cta_text && (
          <span className="shrink-0 px-3 py-1 text-xs bg-primary text-primary-foreground rounded-full">{ad.cta_text}</span>
        )}
      </div>
    );
  }

  if (ad.type === 'google_adsense' && ad.adsense_slot_id) {
    return (
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: width ?? 728, height: height ?? 90 }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={ad.adsense_slot_id}
        data-ad-format={ad.adsense_format ?? 'auto'}
      />
    );
  }

  return null;
}
