'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiDelete } from '@/lib/api';
import {
  ArrowLeft,
  Play,
  Pause,
  Edit,
  Trash2,
  Download,
  Share2,
  BarChart3,
  Clock,
  Calendar,
  Music,
  Disc3,
  Eye,
  Heart,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Song {
  id: number;
  title: string;
  cover: string | null;
  album: string | null;
  album_id: number | null;
  plays: number;
  downloads: number;
  duration: string;
  status: string;
  release_date: string;
  lyrics: string | null;
  description: string | null;
  is_explicit: boolean;
  genre: string | null;
  price: number;
  is_free: boolean;
}

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const songId = params.id as string;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    lyrics: '',
    description: '',
    is_explicit: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['artist-song', songId],
    queryFn: () => apiGet<{ data: Song }>(`/artist/songs/${songId}`).then(r => r.data),
    enabled: !!songId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Song>) => apiPut(`/artist/songs/${songId}`, data),
    onSuccess: () => {
      toast.success('Song updated successfully');
      queryClient.invalidateQueries({ queryKey: ['artist-song', songId] });
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update song'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/artist/songs/${songId}`),
    onSuccess: () => {
      toast.success('Song deleted');
      router.push('/artist/songs');
    },
    onError: () => toast.error('Failed to delete song'),
  });

  const song = data;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const startEditing = () => {
    if (song) {
      setEditForm({
        title: song.title,
        lyrics: song.lyrics || '',
        description: song.description || '',
        is_explicit: song.is_explicit,
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateMutation.mutate(editForm);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
      published: { icon: CheckCircle, color: 'text-green-500 bg-green-500/10', label: 'Published' },
      pending: { icon: Clock, color: 'text-yellow-500 bg-yellow-500/10', label: 'Pending Review' },
      pending_review: { icon: Clock, color: 'text-yellow-500 bg-yellow-500/10', label: 'Pending Review' },
      draft: { icon: Edit, color: 'text-gray-500 bg-gray-500/10', label: 'Draft' },
      rejected: { icon: XCircle, color: 'text-red-500 bg-red-500/10', label: 'Rejected' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium', config.color)}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Song Not Found</h2>
        <p className="text-muted-foreground mb-4">This song doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/artist/songs" className="text-primary hover:underline">
          Back to Songs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/artist/songs" className="p-2 hover:bg-muted rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{song.title}</h1>
          <p className="text-muted-foreground">Song Details</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startEditing}
            className="px-4 py-2 border rounded-lg hover:bg-muted flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cover Art & Play */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted relative">
            {song.cover ? (
              <Image src={song.cover} alt={song.title} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Music className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-primary-foreground" />
                ) : (
                  <Play className="h-8 w-8 text-primary-foreground ml-1" />
                )}
              </div>
            </button>
          </div>

          {/* Status */}
          <div className="p-4 rounded-xl bg-card border">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            {getStatusBadge(song.status)}
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Play className="h-4 w-4" />
                <span className="text-sm">Plays</span>
              </div>
              <p className="text-2xl font-bold">{song.plays.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Download className="h-4 w-4" />
                <span className="text-sm">Downloads</span>
              </div>
              <p className="text-2xl font-bold">{song.downloads.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duration</span>
              </div>
              <p className="text-2xl font-bold">{song.duration}</p>
            </div>
            <div className="p-4 rounded-xl bg-card border">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Released</span>
              </div>
              <p className="text-lg font-bold">{new Date(song.release_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Info */}
          <div className="p-6 rounded-xl bg-card border space-y-4">
            <h3 className="font-semibold">Song Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Album</p>
                <p className="font-medium">{song.album || 'Single'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Genre</p>
                <p className="font-medium">{song.genre || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-medium">{song.is_free ? 'Free' : `UGX ${song.price.toLocaleString()}`}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Explicit</p>
                <p className="font-medium">{song.is_explicit ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {song.description && (
            <div className="p-6 rounded-xl bg-card border">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{song.description}</p>
            </div>
          )}

          {/* Lyrics */}
          {song.lyrics && (
            <div className="p-6 rounded-xl bg-card border">
              <h3 className="font-semibold mb-2">Lyrics</h3>
              <pre className="whitespace-pre-wrap text-muted-foreground font-sans text-sm">
                {song.lyrics}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-lg max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Song</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-muted rounded">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg bg-background resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lyrics</label>
                <textarea
                  value={editForm.lyrics}
                  onChange={(e) => setEditForm({ ...editForm, lyrics: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border rounded-lg bg-background resize-none font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="explicit"
                  checked={editForm.is_explicit}
                  onChange={(e) => setEditForm({ ...editForm, is_explicit: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="explicit" className="text-sm">Contains explicit content</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
