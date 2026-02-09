'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Music,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Album {
  id: number;
  title: string;
  cover: string;
  songs: number;
  plays: number;
  releaseDate: string;
  status: 'published' | 'draft';
}

export default function ArtistAlbumsPage() {
  const albums: Album[] = [
    { id: 1, title: 'New Album 2026', cover: '/images/albums/new-2026.jpg', songs: 12, plays: 2500000, releaseDate: '2026-01-15', status: 'published' },
    { id: 2, title: 'Sitya Loss', cover: '/images/albums/sitya-loss.jpg', songs: 15, plays: 25000000, releaseDate: '2024-06-20', status: 'published' },
    { id: 3, title: 'Golden Collection', cover: '/images/albums/golden.jpg', songs: 20, plays: 18000000, releaseDate: '2023-03-10', status: 'published' },
    { id: 4, title: 'Unreleased Project', cover: '/images/albums/default.jpg', songs: 8, plays: 0, releaseDate: '', status: 'draft' },
  ];
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Albums</h1>
          <p className="text-muted-foreground">Manage your album releases</p>
        </div>
        <Link
          href="/artist/albums/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Album
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">8</p>
          <p className="text-sm text-muted-foreground">Total Albums</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">156</p>
          <p className="text-sm text-muted-foreground">Total Songs</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold">45.5M</p>
          <p className="text-sm text-muted-foreground">Total Plays</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-2xl font-bold text-green-600">1</p>
          <p className="text-sm text-muted-foreground">Draft Albums</p>
        </div>
      </div>
      
      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div key={album.id} className="rounded-xl border bg-card overflow-hidden group">
            <div className="relative aspect-square bg-muted">
              <Image
                src={album.cover}
                alt={album.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link
                  href={`/artist/albums/${album.id}`}
                  className="p-3 bg-white rounded-full hover:bg-gray-100"
                >
                  <Eye className="h-5 w-5 text-gray-900" />
                </Link>
                <Link
                  href={`/artist/albums/${album.id}/edit`}
                  className="p-3 bg-white rounded-full hover:bg-gray-100"
                >
                  <Edit className="h-5 w-5 text-gray-900" />
                </Link>
              </div>
              {album.status === 'draft' && (
                <span className="absolute top-3 right-3 px-2 py-1 bg-gray-900/80 text-white text-xs rounded-full">
                  Draft
                </span>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold mb-1">{album.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {album.songs} songs
                </div>
                {album.releaseDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(album.releaseDate).getFullYear()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="font-medium">{formatNumber(album.plays)} plays</p>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/artist/albums/${album.id}`}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/artist/albums/${album.id}/edit`}
                    className="p-2 hover:bg-muted rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  {album.status === 'draft' && (
                    <button className="p-2 hover:bg-muted rounded-lg text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Create New Album Card */}
        <Link
          href="/artist/albums/create"
          className="rounded-xl border-2 border-dashed bg-card hover:bg-muted/50 transition-colors flex flex-col items-center justify-center min-h-[300px] group"
        >
          <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
            <Plus className="h-8 w-8" />
          </div>
          <p className="font-medium">Create New Album</p>
          <p className="text-sm text-muted-foreground">Add songs to a new collection</p>
        </Link>
      </div>
    </div>
  );
}
