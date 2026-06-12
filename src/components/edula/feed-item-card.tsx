'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Share,
  Play,
  CheckCircle,
  Music,
  Calendar,
  Trophy,
  ShoppingBag,
  Users,
  Mic,
  MessageSquare,
  Megaphone,
  Star,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  FeedItem,
  FeedAction,
  FeedCardSize,
  FeedModule,
} from '@/types/edula';
import { getFeedCardSize, MODULE_STYLES } from '@/types/edula';
import { formatTimeAgo, formatNumber } from './post-card';
import { RichText } from './rich-text';

// ── Module → icon mapping ──────────────────────────────────────

const MODULE_ICONS: Record<string, React.ElementType> = {
  music: Music,
  social: Users,
  events: Calendar,
  awards: Trophy,
  store: ShoppingBag,
  sacco: Star,
  ojokotau: Users,
  loyalty: Star,
  forum: MessageSquare,
  podcasts: Mic,
  platform: Megaphone,
};

// ── Props ──────────────────────────────────────────────────────

interface FeedItemCardProps {
  item: FeedItem;
  onLike?: (id: number) => void;
  onComment?: (id: number) => void;
  onShare?: (id: number) => void;
}

export function FeedItemCard({
  item,
  onLike,
  onComment,
  onShare,
}: FeedItemCardProps) {
  const cardSize = getFeedCardSize(item);
  const moduleStyle = MODULE_STYLES[item.module] ?? MODULE_STYLES.platform;
  const ModuleIcon = MODULE_ICONS[item.module] ?? Megaphone;
  const isSponsored =
    item.feed_type === 'sponsored' ||
    Boolean((item as { is_sponsored?: boolean }).is_sponsored);

  return (
    <article
      className={cn(
        'rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md',
        cardSize === 'hero' && 'ring-2 ring-amber-400/50',
        cardSize === 'compact' && 'py-2 px-3',
        cardSize !== 'compact' && 'p-4'
      )}
    >
      {/* Sponsored disclosure — always visible, never disguised */}
      {isSponsored && (
        <div className="mb-3 -mx-4 -mt-4 px-4 py-1.5 bg-muted/60 border-b">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sponsored
          </span>
        </div>
      )}

      {/* Celebration banner (hero cards) */}
      {item.has_celebration && (
        <div className="mb-3 -mx-4 -mt-4 px-4 py-2 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-b flex items-center gap-2">
          <span className="text-lg">🎉</span>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
            Celebration
          </span>
        </div>
      )}

      {/* Prestige badge */}
      {item.is_prestige && !item.has_celebration && (
        <div className="mb-3 -mx-4 -mt-4 px-4 py-2 bg-linear-to-r from-purple-500/10 to-pink-500/10 border-b flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
            Featured
          </span>
        </div>
      )}

      {/* Compact layout vs standard layout */}
      {cardSize === 'compact' ? (
        <CompactLayout item={item} moduleStyle={moduleStyle} ModuleIcon={ModuleIcon} />
      ) : (
        <StandardLayout
          item={item}
          cardSize={cardSize}
          moduleStyle={moduleStyle}
          ModuleIcon={ModuleIcon}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
        />
      )}
    </article>
  );
}

// ── Compact card (follows, comments, shares, aggregated) ───────

function CompactLayout({
  item,
  moduleStyle,
  ModuleIcon,
}: {
  item: FeedItem;
  moduleStyle: { color: string; icon: string; label: string };
  ModuleIcon: React.ElementType;
}) {
  const actionUrl = item.actions?.[0]?.url;

  return (
    <div className="flex items-center gap-3">
      {/* Actor avatar (small) */}
      <div className="h-8 w-8 rounded-full bg-muted overflow-hidden shrink-0">
        {item.actor?.avatar_url ? (
          <Image
            src={item.actor.avatar_url}
            alt={item.actor.name}
            width={32}
            height={32}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: moduleStyle.color }}
          >
            {item.actor?.name?.charAt(0) ?? moduleStyle.icon}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">
          {item.actor?.verified && (
            <CheckCircle className="inline-block h-3.5 w-3.5 text-primary fill-primary mr-1" />
          )}
          {item.title ?? item.body ?? 'Activity'}
          {item.is_aggregated && item.aggregation_count > 1 && (
            <span className="ml-1 text-xs text-muted-foreground">
              (+{item.aggregation_count - 1} more)
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatTimeAgo(item.published_at ?? item.created_at ?? '')}
        </p>
      </div>

      {/* Module badge */}
      <div
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
        style={{ backgroundColor: moduleStyle.color + '15', color: moduleStyle.color }}
      >
        <ModuleIcon className="h-3 w-3" />
        {moduleStyle.label}
      </div>

      {/* Quick action */}
      {actionUrl && (
        <Link
          href={actionUrl}
          className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

// ── Standard / Featured / Hero layout ──────────────────────────

function StandardLayout({
  item,
  cardSize,
  moduleStyle,
  ModuleIcon,
  onLike,
  onComment,
  onShare,
}: {
  item: FeedItem;
  cardSize: FeedCardSize;
  moduleStyle: { color: string; icon: string; label: string };
  ModuleIcon: React.ElementType;
  onLike?: (id: number) => void;
  onComment?: (id: number) => void;
  onShare?: (id: number) => void;
}) {
  const isHero = cardSize === 'hero';
  const isFeatured = cardSize === 'featured';

  return (
    <>
      {/* Header: Module badge + timestamp */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Module badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: moduleStyle.color + '15', color: moduleStyle.color }}
          >
            <ModuleIcon className="h-3.5 w-3.5" />
            {moduleStyle.label}
          </div>

          {/* Aggregation count */}
          {item.is_aggregated && item.aggregation_count > 1 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {item.aggregation_count} updates
            </span>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(item.published_at ?? item.created_at ?? '')}
        </span>
      </div>

      {/* Actor row */}
      {item.actor && (
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('rounded-full bg-muted overflow-hidden shrink-0', isHero ? 'h-12 w-12' : 'h-10 w-10')}>
            {item.actor.avatar_url ? (
              <Image
                src={item.actor.avatar_url}
                alt={item.actor.name}
                width={isHero ? 48 : 40}
                height={isHero ? 48 : 40}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: moduleStyle.color }}
              >
                {item.actor.name?.charAt(0) ?? '?'}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className={cn('font-semibold', isHero ? 'text-base' : 'text-sm')}>
                {item.actor.name}
              </span>
              {item.actor.verified && (
                <CheckCircle className="h-4 w-4 text-primary fill-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize">{item.actor.type}</p>
          </div>
        </div>
      )}

      {/* Title */}
      {item.title && (
        <h3 className={cn('font-semibold leading-snug mb-1', isHero ? 'text-lg' : 'text-sm')}>
          {item.title}
        </h3>
      )}

      {/* Body */}
      {item.body && (
        <p className={cn('text-muted-foreground leading-relaxed mb-3', isHero ? 'text-sm' : 'text-xs')}>
          <RichText text={item.body.length > 200 ? item.body.slice(0, 200) + '…' : item.body} />
        </p>
      )}

      {/* Media */}
      {item.media && item.media.url && (
        <FeedMedia media={item.media} size={cardSize} />
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[11px]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons from backend */}
      {item.actions && item.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {item.actions.map((action, i) => (
            <ActionButton key={i} action={action} moduleColor={moduleStyle.color} />
          ))}
        </div>
      )}

      {/* Engagement bar */}
      {item.engagement && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <button
            onClick={() => onLike?.(item.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-colors"
          >
            <Heart className="h-4.5 w-4.5" />
            <span className="text-xs font-medium">{formatNumber(item.engagement.likes)}</span>
          </button>

          <button
            onClick={() => onComment?.(item.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="h-4.5 w-4.5" />
            <span className="text-xs font-medium">{formatNumber(item.engagement.comments)}</span>
          </button>

          <button
            onClick={() => onShare?.(item.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-500 transition-colors"
          >
            <Share className="h-4.5 w-4.5" />
            <span className="text-xs font-medium">{formatNumber(item.engagement.shares)}</span>
          </button>
        </div>
      )}
    </>
  );
}

// ── Feed Media (song/album/image/video) ────────────────────────

function FeedMedia({
  media,
  size,
}: {
  media: NonNullable<FeedItem['media']>;
  size: FeedCardSize;
}) {
  const isLarge = size === 'hero' || size === 'featured';

  if (media.type === 'song') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-linear-to-r from-primary/5 to-transparent border mt-2">
        <div className="relative h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
          {media.thumbnail_url && (
            <Image
              src={media.thumbnail_url}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="h-6 w-6 text-white" fill="currentColor" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">Song</p>
          {media.duration_seconds && (
            <p className="text-xs text-muted-foreground">
              {Math.floor(media.duration_seconds / 60)}:{String(media.duration_seconds % 60).padStart(2, '0')}
            </p>
          )}
        </div>
        <Play className="h-8 w-8 p-1.5 rounded-full bg-primary text-primary-foreground shrink-0" />
      </div>
    );
  }

  if (media.type === 'album') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-linear-to-r from-purple-500/5 to-transparent border mt-2">
        <div className="relative h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
          {media.thumbnail_url && (
            <Image src={media.thumbnail_url} alt="" fill className="object-cover" unoptimized />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">Album</p>
          <p className="text-xs text-muted-foreground">View details</p>
        </div>
      </div>
    );
  }

  // Image / generic media
  if (media.url) {
    return (
      <div
        className={cn(
          'relative rounded-xl overflow-hidden bg-muted mt-2',
          isLarge ? 'h-64 sm:h-80' : 'h-48 sm:h-56'
        )}
      >
        <Image
          src={media.thumbnail_url ?? media.url}
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="h-7 w-7 text-black ml-1" fill="currentColor" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ── CTA Action buttons ─────────────────────────────────────────

function ActionButton({
  action,
  moduleColor,
}: {
  action: FeedAction;
  moduleColor: string;
}) {
  const isPlay = action.type === 'play';

  return (
    <Link
      href={action.url}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
        isPlay
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border hover:bg-muted'
      )}
      style={!isPlay ? { borderColor: moduleColor + '40', color: moduleColor } : undefined}
    >
      {isPlay && <Play className="h-3 w-3" fill="currentColor" />}
      {action.type === 'view' && <ExternalLink className="h-3 w-3" />}
      {action.type === 'register' && <Calendar className="h-3 w-3" />}
      {action.type === 'vote' && <TrendingUp className="h-3 w-3" />}
      {action.label}
    </Link>
  );
}
