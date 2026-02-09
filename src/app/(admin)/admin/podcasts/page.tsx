'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Mic2,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Podcast {
  id: number;
  title: string;
  host: string;
  cover: string;
  episodes: number;
  subscribers: number;
  totalPlays: number;
  category: string;
  status: 'active' | 'paused' | 'pending';
  lastEpisode: string;
}

export default function PodcastsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const podcasts: Podcast[] = [
    { id: 1, title: 'Uganda Music Weekly', host: 'DJ Trevor', cover: '/images/podcasts/music-weekly.jpg', episodes: 156, subscribers: 45000, totalPlays: 1200000, category: 'Music', status: 'active', lastEpisode: '2026-02-01' },
    { id: 2, title: 'Artist Spotlight', host: 'Sarah Kato', cover: '/images/podcasts/spotlight.jpg', episodes: 89, subscribers: 32000, totalPlays: 890000, category: 'Interviews', status: 'active', lastEpisode: '2026-01-28' },
    { id: 3, title: 'East African Beats', host: 'Mike Mutebi', cover: '/images/podcasts/ea-beats.jpg', episodes: 234, subscribers: 67000, totalPlays: 2100000, category: 'Music', status: 'active', lastEpisode: '2026-02-03' },
    { id: 4, title: 'Producer Diaries', host: 'Nessim Pan Production', cover: '/images/podcasts/producer.jpg', episodes: 45, subscribers: 15000, totalPlays: 340000, category: 'Production', status: 'paused', lastEpisode: '2025-11-15' },
    { id: 5, title: 'New Show', host: 'New Host', cover: '/images/podcasts/default.jpg', episodes: 0, subscribers: 0, totalPlays: 0, category: 'Talk', status: 'pending', lastEpisode: '' },
  ];
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const statusStyles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Podcasts</h1>
          <p className="text-muted-foreground">Manage podcast shows</p>
        </div>
        <Link
          href="/admin/podcasts/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Podcast
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Mic2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">156</p>
          <p className="text-sm text-muted-foreground">Active Shows</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">4,521</p>
          <p className="text-sm text-muted-foreground">Total Episodes</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">12.5M</p>
          <p className="text-sm text-muted-foreground">Total Listens</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-green-600">+23</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search podcasts..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="pending">Pending</option>
        </select>
        <select className="px-4 py-2 border rounded-lg bg-background">
          <option value="all">All Categories</option>
          <option value="music">Music</option>
          <option value="interviews">Interviews</option>
          <option value="production">Production</option>
          <option value="talk">Talk</option>
        </select>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {podcasts.map((podcast) => (
          <div key={podcast.id} className="rounded-xl border bg-card overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <Image
                src={podcast.cover}
                alt={podcast.title}
                fill
                className="object-cover"
              />
              <span className={cn(
                'absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium capitalize',
                statusStyles[podcast.status]
              )}>
                {podcast.status}
              </span>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold mb-1">{podcast.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">by {podcast.host}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-4 text-center border-y py-3">
                <div>
                  <p className="font-semibold">{podcast.episodes}</p>
                  <p className="text-xs text-muted-foreground">Episodes</p>
                </div>
                <div>
                  <p className="font-semibold">{formatNumber(podcast.subscribers)}</p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
                <div>
                  <p className="font-semibold">{formatNumber(podcast.totalPlays)}</p>
                  <p className="text-xs text-muted-foreground">Plays</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-muted rounded">{podcast.category}</span>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/podcasts/${podcast.id}`}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/podcasts/${podcast.id}/edit`}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button className="p-2 hover:bg-muted rounded-lg text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-5 of 156 podcasts
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50" disabled>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded-lg">1</button>
          <button className="px-3 py-1 hover:bg-muted rounded-lg">2</button>
          <button className="px-3 py-1 hover:bg-muted rounded-lg">3</button>
          <span className="px-2">...</span>
          <button className="px-3 py-1 hover:bg-muted rounded-lg">32</button>
          <button className="p-2 border rounded-lg hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
