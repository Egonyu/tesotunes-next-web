'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Download,
  FileArchive,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Music,
  Heart,
  ListMusic,
  ShoppingBag,
  MessageSquare,
  User,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface ExportRequest {
  id: number;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  requested_at: string;
  ready_at?: string;
  expires_at?: string;
  download_url?: string;
  file_size_mb?: number;
  includes: string[];
}

const DATA_CATEGORIES = [
  { id: 'profile', name: 'Profile Information', icon: User, description: 'Name, email, bio, avatar' },
  { id: 'listening', name: 'Listening History', icon: Music, description: 'Songs played, timestamps, duration' },
  { id: 'playlists', name: 'Playlists', icon: ListMusic, description: 'Your playlists and saved tracks' },
  { id: 'likes', name: 'Likes & Favorites', icon: Heart, description: 'Liked songs, albums, artists' },
  { id: 'purchases', name: 'Purchases & Transactions', icon: ShoppingBag, description: 'Orders, payments, subscriptions' },
  { id: 'messages', name: 'Messages', icon: MessageSquare, description: 'Conversations and chat history' },
  { id: 'settings', name: 'Settings & Preferences', icon: Shield, description: 'All account settings and preferences' },
] as const;

export default function DataExportPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DATA_CATEGORIES.map((c) => c.id)
  );

  const { data: exports, isLoading } = useQuery({
    queryKey: ['data-exports'],
    queryFn: () => apiGet<ExportRequest[]>('/settings/data-exports'),
  });

  const requestExport = useMutation({
    mutationFn: (categories: string[]) =>
      apiPost('/settings/data-exports', { categories }),
    onSuccess: () => {
      toast.success('Export requested! We\'ll notify you when it\'s ready.');
    },
    onError: () => toast.error('Failed to request data export'),
  });

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
    processing: { icon: Loader2, color: 'text-blue-500', label: 'Processing' },
    ready: { icon: CheckCircle, color: 'text-green-500', label: 'Ready' },
    expired: { icon: AlertCircle, color: 'text-muted-foreground', label: 'Expired' },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Export Your Data</h1>
        <p className="text-muted-foreground mt-1">
          Download a copy of your personal data. Under GDPR and data protection laws,
          you have the right to access all data we hold about you.
        </p>
      </div>

      {/* Select Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Data to Export</h2>
          <button
            onClick={() =>
              setSelectedCategories(
                selectedCategories.length === DATA_CATEGORIES.length
                  ? []
                  : DATA_CATEGORIES.map((c) => c.id)
              )
            }
            className="text-sm text-primary hover:underline"
          >
            {selectedCategories.length === DATA_CATEGORIES.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <div className="grid gap-3">
          {DATA_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const selected = selectedCategories.includes(category.id);

            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`flex items-center gap-3 p-4 border rounded-xl text-left transition ${
                  selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition ${
                  selected ? 'bg-primary border-primary' : 'border-muted-foreground'
                } flex items-center justify-center`}>
                  {selected && <CheckCircle className="h-4 w-4 text-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => requestExport.mutate(selectedCategories)}
          disabled={selectedCategories.length === 0 || requestExport.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
        >
          {requestExport.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileArchive className="h-5 w-5" />
          )}
          Request Data Export
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Export preparation may take up to 48 hours. You&apos;ll receive an email when ready.
        </p>
      </div>

      {/* Previous Exports */}
      {exports && exports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Previous Exports</h2>
          <div className="space-y-3">
            {exports.map((exp) => {
              const status = statusConfig[exp.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-4 border rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${status.color} ${exp.status === 'processing' ? 'animate-spin' : ''}`} />
                    <div>
                      <p className="font-medium text-sm">{status.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested {new Date(exp.requested_at).toLocaleDateString()}
                        {exp.file_size_mb && ` • ${exp.file_size_mb.toFixed(1)} MB`}
                      </p>
                    </div>
                  </div>
                  {exp.status === 'ready' && exp.download_url && (
                    <a
                      href={exp.download_url}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  )}
                  {exp.status === 'ready' && exp.expires_at && (
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(exp.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="pt-4 border-t">
        <Link
          href="/settings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}
