import { serverFetch } from '@/lib/api';
import { headers } from 'next/headers';

interface HeadProps {
  params: Promise<{ slug: string }>;
}

interface SongHeadData {
  data?: {
    title?: string;
    slug?: string;
    artwork_url?: string | null;
    description?: string | null;
    artist?: {
      name?: string;
    };
  };
}

export default async function Head({ params }: HeadProps) {
  const { slug } = await params;

  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get('x-forwarded-proto');
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const safeProto = forwardedProto === 'http' || forwardedProto === 'https' ? forwardedProto : 'https';
  const configuredOrigin = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');

  let origin = configuredOrigin;
  if (!origin) {
    const safeHost = host && /^(localhost:\d+|127\.0\.0\.1:\d+|(?:www\.)?tesotunes\.com)$/i.test(host)
      ? host
      : null;
    origin = safeHost
      ? `${safeProto}://${safeHost}`
      : 'http://localhost:3000';
  }

  const pageUrl = `${origin}/songs/${slug}`;

  let title = 'TesoTunes - East African Music Platform';
  let description = 'Discover, stream, and support East African music. Your platform for authentic African sounds.';
  const fallbackImage = `${origin}/favicon.png`;
  let image: string | undefined = fallbackImage;

  try {
    const res = await serverFetch<SongHeadData>(`/songs/${slug}`);
    const song = res?.data;

    if (song?.title) {
      const artistName = song.artist?.name ? ` — ${song.artist.name}` : '';
      title = `${song.title}${artistName}`;
      description = song.description || `Listen to ${song.title}${artistName} on TesoTunes.`;
      image = song.artwork_url || fallbackImage;
    }
  } catch {
    // Keep safe fallbacks so share links still resolve valid OG tags.
  }

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content="music.song" />
      <meta property="og:site_name" content="TesoTunes" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
