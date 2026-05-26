'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone, Plus, Search, Loader2, Play, Pause, Trash2,
  Edit, BarChart3, Filter, RefreshCw, Image, Volume2, Code, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminAdsList, useActivateAd, usePauseAd, useDeleteAd, type AdminAd } from '@/hooks/useAdminAds';
import { useDebounce } from '@/hooks/useDebounce';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image:         <Image className="w-3.5 h-3.5" />,
  html:          <Code className="w-3.5 h-3.5" />,
  audio:         <Volume2 className="w-3.5 h-3.5" />,
  native:        <Layers className="w-3.5 h-3.5" />,
  google_adsense: <BarChart3 className="w-3.5 h-3.5" />,
};

const STATUS_FILTERS = ['all', 'active', 'inactive', 'trashed'] as const;
const TYPE_FILTERS   = ['all', 'image', 'html', 'audio', 'native', 'google_adsense'] as const;

export default function AdminAdsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, refetch } = useAdminAdsList({
    page,
    search: debouncedSearch,
    status: status === 'all' ? '' : status,
    type: typeFilter === 'all' ? '' : typeFilter,
  });

  const activate = useActivateAd();
  const pause    = usePauseAd();
  const remove   = useDeleteAd();

  const ads  = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Ad Library</h1>
            <p className="text-sm text-muted-foreground">Manage all ad creatives</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/ad-placements" className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">
            <BarChart3 className="w-4 h-4" /> Zone Manager
          </Link>
          <Link href="/admin/ads/new" className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> New Ad
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title or advertiser…"
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-1 border rounded-lg p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={cn('px-3 py-1 text-xs rounded-md capitalize transition-colors',
                status === s ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border rounded-lg p-1">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={cn('px-2 py-1 text-xs rounded-md capitalize transition-colors',
                typeFilter === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
            >
              {t === 'google_adsense' ? 'AdSense' : t}
            </button>
          ))}
        </div>

        <button onClick={() => refetch()} className="p-2 border rounded-lg hover:bg-muted transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : ads.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No ads found. <Link href="/admin/ads/new" className="text-primary hover:underline">Create the first one.</Link></p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ad</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Impressions</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{ad.title}</div>
                    {ad.advertiser_name && (
                      <div className="text-xs text-muted-foreground">{ad.advertiser_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {TYPE_ICONS[ad.type]} {ad.type === 'google_adsense' ? 'AdSense' : ad.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge ad={ad} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {(ad.impressions ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/ads/${ad.id}/edit`} className="p-1.5 rounded hover:bg-muted transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      {ad.is_active ? (
                        <button
                          onClick={() => pause.mutate(ad.id)}
                          disabled={pause.isPending}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-amber-600"
                          title="Pause"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => activate.mutate(ad.id)}
                          disabled={activate.isPending}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-green-600"
                          title="Activate"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!ad.deleted_at && (
                        <button
                          onClick={() => { if (confirm('Delete this ad?')) remove.mutate(ad.id); }}
                          disabled={remove.isPending}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total: {meta.total.toLocaleString()} ads</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-muted-foreground">
              {page} / {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="px-3 py-1.5 border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ ad }: { ad: AdminAd }) {
  if (ad.deleted_at) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Deleted</span>;
  }
  if (!ad.is_active) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">Paused</span>;
  }
  if (ad.ends_at && new Date(ad.ends_at) < new Date()) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30">Expired</span>;
  }
  return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30">Active</span>;
}
