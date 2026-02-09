import Link from 'next/link';
import { Home, Search, Music } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* 404 Visual */}
        <div className="mb-6 text-8xl font-bold text-primary/20">404</div>
        
        <h1 className="mb-2 text-2xl font-bold">Page Not Found</h1>
        
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. 
          It might have been moved or doesn&apos;t exist.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          
          <Link
            href="/browse"
            className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            <Music className="h-4 w-4" />
            Browse Music
          </Link>
          
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
        </div>
        
        {/* Popular links */}
        <div className="mt-12">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Popular pages you might be looking for:
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { href: '/trending', label: 'Trending' },
              { href: '/new-releases', label: 'New Releases' },
              { href: '/genres', label: 'Genres' },
              { href: '/artists', label: 'Artists' },
              { href: '/playlists', label: 'Playlists' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full bg-muted px-4 py-1.5 text-sm hover:bg-muted/80"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
