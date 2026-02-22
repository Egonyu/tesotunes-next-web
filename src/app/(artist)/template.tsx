import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Artist Studio',
    template: '%s — Studio | TesoTunes',
  },
  description: 'Manage your music, analytics, earnings, and more on TesoTunes',
  robots: { index: false, follow: false },
};

export default function ArtistTemplate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
