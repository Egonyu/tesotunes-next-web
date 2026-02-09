'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Users,
  TrendingUp,
  Compass,
  Settings,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const feedNav = [
  { href: '/edula', label: 'For You', icon: Sparkles },
  { href: '/edula/following', label: 'Following', icon: Users },
  { href: '/edula/trending', label: 'Trending', icon: TrendingUp },
  { href: '/edula/discover', label: 'Discover', icon: Compass },
];

export default function EdulaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="container py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            {/* Feed Nav */}
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {feedNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            <div className="hidden lg:block mt-4 pt-4 border-t">
              <Link
                href="/edula/preferences"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Settings className="h-5 w-5" />
                Feed Preferences
              </Link>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-2xl">
          {children}
        </main>
        
        {/* Right Sidebar */}
        <aside className="hidden xl:block w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Who to Follow */}
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-4">Who to Follow</h3>
              <div className="space-y-4">
                {[
                  { name: 'Sheebah Karungi', username: '@sheebah', followers: '250K' },
                  { name: 'Fik Fameica', username: '@fikfameica', followers: '180K' },
                  { name: 'Vinka', username: '@vinkaofficial', followers: '120K' },
                ].map((user) => (
                  <div key={user.username} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.username}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-xs font-medium border rounded-full hover:bg-muted">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary hover:underline">
                Show more
              </button>
            </div>
            
            {/* Trending Topics */}
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-4">Trending</h3>
              <div className="space-y-3">
                {[
                  { topic: '#AfrobeatsRising', posts: '12.5K posts' },
                  { topic: '#TesoTunesFest2026', posts: '8.2K posts' },
                  { topic: '#NewMusicFriday', posts: '5.6K posts' },
                ].map((trend) => (
                  <Link
                    key={trend.topic}
                    href={`/search?q=${encodeURIComponent(trend.topic)}`}
                    className="block hover:bg-muted -mx-2 px-2 py-2 rounded-lg"
                  >
                    <p className="font-medium text-sm">{trend.topic}</p>
                    <p className="text-xs text-muted-foreground">{trend.posts}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
