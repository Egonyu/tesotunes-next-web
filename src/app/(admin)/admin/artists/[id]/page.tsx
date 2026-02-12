'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Edit, Trash2, User, Music, Disc, Eye, ArrowUpRight, 
  MapPin, Globe, CheckCircle, Heart, Users, Headphones,
  ExternalLink, Play, Tag
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';

interface Song {
  id: string;
  title: string;
  slug: string;
  plays: number;
  cover_url: string;
}

interface Album {
  id: string;
  title: string;
  slug: string;
  cover_url: string;
  release_date: string;
  album_type: string;
}

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string;
  short_bio: string;
  country: string;
  city: string;
  website: string;
  spotify_url: string;
  apple_music_url: string;
  youtube_url: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  tiktok_url: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  profile_url: string;
  cover_url: string;
  followers: number;
  monthly_listeners: number;
  total_plays: number;
  total_songs: number;
  total_albums: number;
  genres: { id: string; name: string }[];
  top_songs: Song[];
  recent_albums: Album[];
  created_at: string;
  updated_at: string;
}

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: artist, isLoading } = useQuery({
    queryKey: ['admin', 'artist', id],
    queryFn: () => apiGet<{ data: Artist }>(`/api/admin/artists/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/admin/artists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
      router.push('/admin/artists');
    },
  });

  const toggleVerifyMutation = useMutation({
    mutationFn: () => apiPost(`/api/admin/artists/${id}/toggle-verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
    },
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: () => apiPost(`/api/admin/artists/${id}/toggle-featured`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'artist', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!artist?.data) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Artist not found</h2>
        <Link href="/admin/artists" className="text-primary hover:underline mt-2 inline-block">
          Back to artists
        </Link>
      </div>
    );
  }

  const a = artist.data;

  const socialLinks = [
    { name: 'Spotify', url: a.spotify_url, color: 'bg-green-500' },
    { name: 'Apple Music', url: a.apple_music_url, color: 'bg-pink-500' },
    { name: 'YouTube', url: a.youtube_url, color: 'bg-red-500' },
    { name: 'Instagram', url: a.instagram_url, color: 'bg-purple-500' },
    { name: 'Twitter', url: a.twitter_url, color: 'bg-blue-400' },
    { name: 'Facebook', url: a.facebook_url, color: 'bg-blue-600' },
    { name: 'TikTok', url: a.tiktok_url, color: 'bg-black' },
  ].filter(link => link.url);

  return (
    <div className="space-y-6">
      <PageHeader
        title={a.name}
        description={a.short_bio || 'Artist Profile'}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Artists', href: '/admin/artists' },
          { label: a.name },
        ]}
        backHref="/admin/artists"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/artists/${a.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              View Live
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href={`/admin/artists/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="h-48 md:h-64 bg-linear-to-r from-purple-600 to-pink-600">
          {a.cover_url && (
            <Image
              src={a.cover_url}
              alt={`${a.name} cover`}
              fill
              className="object-cover opacity-50"
            />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent">
          <div className="flex items-end gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
              {a.profile_url ? (
                <Image
                  src={a.profile_url}
                  alt={a.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-bold text-white">{a.name}</h2>
                {a.is_verified && (
                  <CheckCircle className="h-6 w-6 text-blue-400" fill="currentColor" />
                )}
              </div>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                {(a.city || a.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {[a.city, a.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {a.website && (
                  <a href={a.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={a.status} />
              {a.is_featured && (
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                  FEATURED
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Followers</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(a.followers)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Headphones className="h-4 w-4" />
                <span className="text-sm">Monthly Listeners</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(a.monthly_listeners)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Music className="h-4 w-4" />
                <span className="text-sm">Songs</span>
              </div>
              <p className="text-2xl font-bold">{a.total_songs}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Disc className="h-4 w-4" />
                <span className="text-sm">Albums</span>
              </div>
              <p className="text-2xl font-bold">{a.total_albums}</p>
            </div>
          </div>

          {/* Top Songs */}
          {a.top_songs?.length > 0 && (
            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Top Songs
                </h3>
                <Link href={`/admin/songs?artist_id=${id}`} className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="divide-y">
                {a.top_songs.map((song, index) => (
                  <div key={song.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 group">
                    <span className="w-6 text-sm text-muted-foreground text-center font-medium">
                      {index + 1}
                    </span>
                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      {song.cover_url ? (
                        <Image src={song.cover_url} alt={song.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Music className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="h-4 w-4 text-white" fill="white" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/admin/songs/${song.id}`}
                        className="font-medium hover:text-primary hover:underline truncate block"
                      >
                        {song.title}
                      </Link>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(song.plays)} plays
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Albums */}
          {a.recent_albums?.length > 0 && (
            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Disc className="h-5 w-5" />
                  Recent Releases
                </h3>
                <Link href={`/admin/albums?artist_id=${id}`} className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {a.recent_albums.map(album => (
                  <Link key={album.id} href={`/admin/albums/${album.id}`} className="group">
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                      {album.cover_url ? (
                        <Image src={album.cover_url} alt={album.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Disc className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-sm truncate group-hover:text-primary">{album.title}</h4>
                    <p className="text-xs text-muted-foreground capitalize">
                      {album.album_type} • {new Date(album.release_date).getFullYear()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {a.bio && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Biography</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{a.bio}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => toggleVerifyMutation.mutate()}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center justify-between"
                disabled={toggleVerifyMutation.isPending}
              >
                <span>{a.is_verified ? 'Remove Verification' : 'Verify Artist'}</span>
                <CheckCircle className={`h-4 w-4 ${a.is_verified ? 'text-blue-500' : 'text-gray-400'}`} />
              </button>
              <button
                onClick={() => toggleFeatureMutation.mutate()}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted"
                disabled={toggleFeatureMutation.isPending}
              >
                {a.is_featured ? 'Remove from Featured' : 'Add to Featured'}
              </button>
              <Link
                href={`/admin/songs/new?artist_id=${id}`}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2 block"
              >
                <Music className="h-4 w-4" />
                Add Song
              </Link>
              <Link
                href={`/admin/albums/new?artist_id=${id}`}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2 block"
              >
                <Disc className="h-4 w-4" />
                Add Album
              </Link>
            </div>
          </div>

          {/* Genres */}
          {a.genres?.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {a.genres.map(genre => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Social Links</h3>
              <div className="space-y-2">
                {socialLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className={`w-8 h-8 ${link.color} rounded-full flex items-center justify-center`}>
                      <ExternalLink className="h-4 w-4 text-white" />
                    </div>
                    <span className="flex-1">{link.name}</span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Timestamps</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(a.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(a.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Artist"
        description={`Are you sure you want to delete "${a.name}"? This will also remove all associated songs and albums.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
