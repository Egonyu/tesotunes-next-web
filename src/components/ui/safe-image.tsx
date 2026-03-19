'use client';

import { useMemo, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { Music2, User } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media';

type SafeImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
  fallback?: React.ReactNode;
};

export function SafeImage({ src, alt, fallback = null, unoptimized = true, ...props }: SafeImageProps) {
  const resolvedSrc = useMemo(() => resolveMediaUrl(src), [src]);
  const [failed, setFailed] = useState(false);

  if (!resolvedSrc || failed) {
    return <>{fallback}</>;
  }

  return (
    <Image
      {...props}
      alt={alt}
      src={resolvedSrc}
      unoptimized={unoptimized}
      onError={() => setFailed(true)}
    />
  );
}

type InitialsAvatarProps = {
  name?: string | null;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  icon?: 'user' | 'music';
};

export function InitialsAvatar({
  name,
  className,
  textClassName,
  iconClassName,
  icon = 'user',
}: InitialsAvatarProps) {
  const initials = name ? getInitials(name) : '';
  const Icon = icon === 'music' ? Music2 : User;

  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-muted text-muted-foreground', className)}>
      {initials ? (
        <span className={cn('font-semibold uppercase', textClassName)}>{initials}</span>
      ) : (
        <Icon className={cn('h-5 w-5', iconClassName)} />
      )}
    </div>
  );
}
