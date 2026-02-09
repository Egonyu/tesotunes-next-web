'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Megaphone,
  Calendar,
  ExternalLink,
  Pin,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Bell,
  Gift,
  Wrench,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnnouncements } from '@/hooks/useFeed';

interface Announcement {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  type: 'update' | 'feature' | 'maintenance' | 'promotion';
  isPinned: boolean;
  date: string;
  link?: string;
  image?: string;
}

// Mock data for fallback
const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Introducing Edula - Your Music Timeline',
    content: 'We\'re excited to announce Edula, a new way to connect with artists and fans! Share your music discoveries, follow your favorite artists, and be part of the conversation.',
    excerpt: 'A new way to connect with artists and fans...',
    type: 'feature',
    isPinned: true,
    date: '2026-02-05T12:00:00',
    image: '/images/announcements/edula-launch.jpg',
    link: '/edula',
  },
  {
    id: 2,
    title: 'TesoTunes Fest 2026 Tickets Now Available!',
    content: 'Get your tickets for the biggest music event in East Africa! Early bird pricing available until February 28th.',
    excerpt: 'Get your tickets for the biggest music event...',
    type: 'promotion',
    isPinned: true,
    date: '2026-02-03T10:00:00',
    link: '/events/tesotunes-fest-2026',
  },
  {
    id: 3,
    title: 'Scheduled Maintenance - February 10',
    content: 'We will be performing scheduled maintenance on February 10th from 2:00 AM to 4:00 AM EAT. Some services may be temporarily unavailable.',
    excerpt: 'Scheduled maintenance on February 10th...',
    type: 'maintenance',
    isPinned: false,
    date: '2026-02-04T08:00:00',
  },
  {
    id: 4,
    title: 'New SACCO Features Launched',
    content: 'We\'ve added new features to our SACCO module including automated savings goals, loan calculators, and dividend tracking.',
    excerpt: 'New features for SACCO members...',
    type: 'update',
    isPinned: false,
    date: '2026-02-01T14:00:00',
    link: '/sacco',
  },
  {
    id: 5,
    title: 'Artist Verification Program',
    content: 'Are you a verified artist? Apply for our verification badge to get access to exclusive features and enhanced visibility.',
    excerpt: 'Apply for artist verification...',
    type: 'feature',
    isPinned: false,
    date: '2026-01-28T09:00:00',
    link: '/settings/verification',
  },
];

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState<string | null>(null);
  
  // API hook
  const { data: announcementsData, isLoading } = useAnnouncements();
  
  // Transform API data or use mock
  const announcements: Announcement[] = useMemo(() => {
    if (announcementsData?.data) {
      return announcementsData.data.map(a => {
        // Map API types to local types
        const typeMap: Record<string, Announcement['type']> = {
          'info': 'update',
          'warning': 'maintenance',
          'success': 'feature',
          'event': 'promotion',
        };
        return {
          id: a.id,
          title: a.title,
          content: a.content,
          excerpt: a.content.substring(0, 80) + (a.content.length > 80 ? '...' : ''),
          type: typeMap[a.type] || 'update',
          isPinned: false,
          date: a.created_at,
          link: a.link_url,
          image: undefined,
        };
      });
    }
    return mockAnnouncements;
  }, [announcementsData]);
  
  const typeConfig = {
    update: { icon: AlertCircle, color: 'bg-blue-500', label: 'Update' },
    feature: { icon: Sparkles, color: 'bg-purple-500', label: 'New Feature' },
    maintenance: { icon: Wrench, color: 'bg-orange-500', label: 'Maintenance' },
    promotion: { icon: Gift, color: 'bg-green-500', label: 'Promotion' },
  };
  
  const filteredAnnouncements = filter 
    ? announcements.filter(a => a.type === filter)
    : announcements;
  
  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Megaphone className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Announcements</h1>
      </div>
      
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            !filter
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          All
        </button>
        {Object.entries(typeConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </button>
          );
        })}
      </div>
      
      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Pin className="h-4 w-4" />
            Pinned
          </h2>
          {pinnedAnnouncements.map((announcement) => {
            const config = typeConfig[announcement.type];
            const Icon = config.icon;
            
            return (
              <article
                key={announcement.id}
                className="p-6 rounded-xl border-2 border-primary/20 bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white',
                    config.color
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(announcement.date)}
                  </span>
                </div>
                
                {announcement.image && (
                  <div className="relative h-48 rounded-lg overflow-hidden bg-muted mb-4">
                    <Image
                      src={announcement.image}
                      alt={announcement.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
                <p className="text-muted-foreground">{announcement.content}</p>
                
                {announcement.link && (
                  <Link
                    href={announcement.link}
                    className="inline-flex items-center gap-1 mt-4 text-primary hover:underline"
                  >
                    Learn more
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            );
          })}
        </section>
      )}
      
      {/* Regular Announcements */}
      <section className="space-y-4">
        {pinnedAnnouncements.length > 0 && (
          <h2 className="text-sm font-semibold text-muted-foreground">
            Recent
          </h2>
        )}
        {regularAnnouncements.map((announcement) => {
          const config = typeConfig[announcement.type];
          const Icon = config.icon;
          
          return (
            <article
              key={announcement.id}
              className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'p-2 rounded-lg text-white flex-shrink-0',
                  config.color
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(announcement.date)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {announcement.excerpt}
                  </p>
                  {announcement.link && (
                    <Link
                      href={announcement.link}
                      className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                    >
                      Read more
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
      
      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No announcements</p>
          <p className="text-muted-foreground mt-1">
            Check back later for updates
          </p>
        </div>
      )}
    </div>
  );
}
