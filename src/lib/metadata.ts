import type { Metadata } from 'next';

// Base metadata for the application
export const siteConfig = {
  name: 'TesoTunes',
  description: "East Africa's premier music streaming platform - Discover, stream, and download the best African music",
  url: 'https://tesotunes.com',
  ogImage: 'https://tesotunes.com/og-image.jpg',
  creator: '@tesotunes',
  keywords: [
    'African music',
    'music streaming',
    'East African music',
    'Ugandan music',
    'Kenyan music',
    'Tanzanian music',
    'download music',
    'stream music',
    'podcasts',
    'artists',
    'albums',
    'TesoTunes',
  ],
};

// Default metadata for all pages
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'TesoTunes Team' }],
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'en_UG',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

// Helper to generate page-specific metadata
export function generatePageMetadata(
  title: string,
  description?: string,
  image?: string
): Metadata {
  return {
    title,
    description: description || siteConfig.description,
    openGraph: {
      title,
      description: description || siteConfig.description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      title,
      description: description || siteConfig.description,
      images: image ? [image] : undefined,
    },
  };
}

// Helper for artist/song pages
export function generateMusicMetadata(
  type: 'song' | 'album' | 'artist' | 'playlist',
  name: string,
  artistName?: string,
  imageUrl?: string,
  description?: string
): Metadata {
  const title = artistName ? `${name} by ${artistName}` : name;
  const defaultDesc = {
    song: `Listen to ${name} on TesoTunes`,
    album: `${name} album - Stream now on TesoTunes`,
    artist: `${name} - Discography, songs, and more on TesoTunes`,
    playlist: `${name} playlist - Curated music on TesoTunes`,
  };

  return {
    title,
    description: description || defaultDesc[type],
    openGraph: {
      type: 'music.song',
      title,
      description: description || defaultDesc[type],
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}

// Structured data helpers for rich snippets
export function generateMusicAlbumStructuredData(
  name: string,
  artist: string,
  imageUrl: string,
  releaseDate: string,
  tracks: Array<{ name: string; duration: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name,
    byArtist: {
      '@type': 'MusicGroup',
      name: artist,
    },
    image: imageUrl,
    datePublished: releaseDate,
    numTracks: tracks.length,
    track: tracks.map((track, index) => ({
      '@type': 'MusicRecording',
      name: track.name,
      duration: track.duration,
      position: index + 1,
    })),
  };
}

export function generateArtistStructuredData(
  name: string,
  imageUrl: string,
  description: string,
  genres: string[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name,
    image: imageUrl,
    description,
    genre: genres,
    sameAs: [], // Add social links here
  };
}
