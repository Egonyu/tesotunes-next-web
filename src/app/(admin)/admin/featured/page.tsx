'use client';

import { useState, useCallback, useDeferredValue, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Star,
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Loader2,
  Image as ImageIcon,
  Music,
  Disc3,
  Mic2,
  ListMusic,
  Calendar,
  Link as LinkIcon,
  X,
  Clock,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  useFeaturedContent,
  useCreateFeaturedItem,
  useUpdateFeaturedItem,
  useDeleteFeaturedItem,
  useReorderFeaturedItems,
  useToggleFeaturedItem,
  type FeaturedItem,
  type CreateFeaturedItemData,
} from '@/hooks/useFeaturedContent';
import { apiGet } from '@/lib/api';

const typeConfig: Record<string, { label: string; icon: typeof Music; color: string }> = {
  song: { label: 'Song', icon: Music, color: 'text-blue-500 bg-blue-500/10' },
  album: { label: 'Album', icon: Disc3, color: 'text-purple-500 bg-purple-500/10' },
  artist: { label: 'Artist', icon: Mic2, color: 'text-green-500 bg-green-500/10' },
  playlist: { label: 'Playlist', icon: ListMusic, color: 'text-orange-500 bg-orange-500/10' },
  event: { label: 'Event', icon: Calendar, color: 'text-pink-500 bg-pink-500/10' },
  custom: { label: 'Custom', icon: LinkIcon, color: 'text-gray-500 bg-gray-500/10' },
};

type LinkedEntityType = Exclude<FeaturedItem['type'], 'custom'>;

interface FeaturedEntityOption {
  id: number;
  type: LinkedEntityType;
  label: string;
  subtitle: string;
  link: string;
  image_url: string | null;
  title: string;
  defaultSubtitle: string;
  song_id?: number;
  album_id?: number;
  artist_id?: number;
  event_id?: number;
  playlist_id?: number;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function getNestedString(source: Record<string, unknown>, key: string): string {
  return key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[part];
  }, source) as string || '';
}

function formatCompactNumber(value?: number): string {
  if (!value) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatEventSummary(item: Record<string, unknown>): string {
  const city = getString(item.city);
  const startsAt = getString(item.starts_at);
  const dateLabel = startsAt
    ? new Date(startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';

  return [city, dateLabel].filter(Boolean).join(' · ') || 'Upcoming event';
}

function parseEntityOptions(items: Record<string, unknown>[], type: LinkedEntityType): FeaturedEntityOption[] {
  const parsed: Array<FeaturedEntityOption | null> = items
    .map((item) => {
      const id = getNumber(item.id);
      if (!id) {
        return null;
      }

      if (type === 'song') {
        const title = getString(item.title);
        const slug = getString(item.slug);
        const artistName = getNestedString(item, 'artist.name');
        const playCount = getNumber(item.play_count);
        const subtitle = [artistName, playCount !== undefined ? `${formatCompactNumber(playCount)} plays` : 'Song']
          .filter(Boolean)
          .join(' · ');

        return {
          id,
          type,
          label: title,
          title,
          subtitle,
          defaultSubtitle: subtitle,
          link: `/songs/${slug}`,
          image_url: getString(item.artwork_url) || getString(item.cover_url) || null,
          song_id: id,
        };
      }

      if (type === 'artist') {
        const title = getString(item.name);
        const slug = getString(item.slug);
        const followers = getNumber(item.followers_count);
        const subtitle = followers !== undefined ? `${formatCompactNumber(followers)} followers` : 'Artist spotlight';

        return {
          id,
          type,
          label: title,
          title,
          subtitle,
          defaultSubtitle: subtitle,
          link: `/artists/${slug}`,
          image_url: getString(item.avatar_url) || null,
          artist_id: id,
        };
      }

      if (type === 'album') {
        const title = getString(item.title);
        const slug = getString(item.slug);
        const artistName = getNestedString(item, 'artist.name');
        const subtitle = artistName || 'Album spotlight';

        return {
          id,
          type,
          label: title,
          title,
          subtitle,
          defaultSubtitle: subtitle,
          link: `/albums/${slug}`,
          image_url: getString(item.artwork_url) || null,
          album_id: id,
        };
      }

      if (type === 'event') {
        const title = getString(item.title);
        const subtitle = formatEventSummary(item);

        return {
          id,
          type,
          label: title,
          title,
          subtitle,
          defaultSubtitle: subtitle,
          link: `/events/${id}`,
          image_url: getString(item.artwork) || getString(item.banner) || null,
          event_id: id,
        };
      }

      const title = getString(item.name);
      const slug = getString(item.slug);
      const songCount = getNumber(item.song_count);
      const subtitle = songCount !== undefined ? `${formatCompactNumber(songCount)} tracks` : 'Playlist spotlight';

      return {
        id,
        type,
        label: title,
        title,
        subtitle,
        defaultSubtitle: subtitle,
        link: `/playlists/${slug}`,
        image_url: getString(item.artwork_url) || null,
        playlist_id: id,
      };
    });

  return parsed.filter((item): item is FeaturedEntityOption => item !== null);
}

function buildEntitySearchEndpoint(type: LinkedEntityType, search: string): string {
  const params = new URLSearchParams({ per_page: '8' });
  if (search) {
    params.set('search', search);
  }

  switch (type) {
    case 'song':
      params.set('sort', '-play_count');
      return `/admin/songs?${params.toString()}`;
    case 'artist':
      return `/admin/artists?${params.toString()}`;
    case 'album':
      return `/admin/albums?${params.toString()}`;
    case 'event':
      params.set('status', 'all');
      return `/admin/events?${params.toString()}`;
    case 'playlist':
      return `/playlists?${params.toString()}`;
  }
}

function getSelectedEntityId(
  type: FeaturedItem['type'],
  ids: {
    song_id?: number;
    album_id?: number;
    artist_id?: number;
    event_id?: number;
    playlist_id?: number;
  }
): number | undefined {
  switch (type) {
    case 'song':
      return ids.song_id;
    case 'album':
      return ids.album_id;
    case 'artist':
      return ids.artist_id;
    case 'event':
      return ids.event_id;
    case 'playlist':
      return ids.playlist_id;
    default:
      return undefined;
  }
}

export default function AdminFeaturedPage() {
  const { data: items = [], isLoading } = useFeaturedContent();
  const createMutation = useCreateFeaturedItem();
  const updateMutation = useUpdateFeaturedItem();
  const deleteMutation = useDeleteFeaturedItem();
  const reorderMutation = useReorderFeaturedItems();
  const toggleMutation = useToggleFeaturedItem();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editItem, setEditItem] = useState<FeaturedItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);
  const filteredItems = sortedItems.filter((item) => {
    if (filterStatus === 'active') return item.is_active;
    if (filterStatus === 'inactive') return !item.is_active;
    return true;
  });

  const activeCount = items.filter((i) => i.is_active).length;
  const scheduledCount = items.filter((i) => i.starts_at && new Date(i.starts_at) > new Date()).length;

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const reordered = [...sortedItems];
      [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
      reorderMutation.mutate(
        reordered.map((item, i) => ({ id: item.id, sort_order: i }))
      );
    },
    [sortedItems, reorderMutation]
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= sortedItems.length - 1) return;
      const reordered = [...sortedItems];
      [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
      reorderMutation.mutate(
        reordered.map((item, i) => ({ id: item.id, sort_order: i }))
      );
    },
    [sortedItems, reorderMutation]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Content
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage homepage carousel items, banners, and featured sections
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Featured Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{items.length}</p>
          <p className="text-sm text-muted-foreground">Total Items</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{scheduledCount}</p>
          <p className="text-sm text-muted-foreground">Scheduled</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {(['all', 'active', 'inactive'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filterStatus === status
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'active' && ` (${activeCount})`}
            {status === 'inactive' && ` (${items.length - activeCount})`}
          </button>
        ))}
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Featured Items</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create featured items to display on the homepage carousel.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const config = typeConfig[item.type] || typeConfig.custom;
            const TypeIcon = config.icon;
            const isScheduled = item.starts_at && new Date(item.starts_at) > new Date();

            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 border rounded-xl bg-card transition-all hover:shadow-sm ${
                  !item.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Reorder */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === filteredItems.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Preview Image */}
                <div className="relative h-20 w-32 rounded-lg overflow-hidden bg-muted shrink-0">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                      <TypeIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                    {isScheduled && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-blue-500 bg-blue-500/10">
                        <Clock className="h-3 w-3" />
                        Scheduled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 truncate">{item.link}</p>
                </div>

                {/* Order badge */}
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  #{item.sort_order + 1}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleMutation.mutate(item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.is_active
                        ? 'text-green-500 hover:bg-green-500/10'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    title={item.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setEditItem(item)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Homepage Preview */}
      {sortedItems.filter((i) => i.is_active).length > 0 && (
        <div className="border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Carousel Preview
          </h3>
          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-muted">
            {sortedItems
              .filter((i) => i.is_active)
              .slice(0, 1)
              .map((item) => (
                <div key={item.id} className="relative h-full">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-xs uppercase tracking-wider text-white/70 mb-2 block">
                      {item.type}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {item.title}
                    </h2>
                    <p className="text-white/80 text-sm">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            {/* Dot indicator preview */}
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {sortedItems
                .filter((i) => i.is_active)
                .map((item, i) => (
                  <div
                    key={item.id}
                    className={`h-2 rounded-full ${i === 0 ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editItem) && (
        <FeaturedItemModal
          item={editItem}
          onClose={() => {
            setShowCreateModal(false);
            setEditItem(null);
          }}
          onSubmit={async (data) => {
            if (editItem) {
              await updateMutation.mutateAsync({ id: editItem.id, data });
            } else {
              await createMutation.mutateAsync(data);
            }
            setShowCreateModal(false);
            setEditItem(null);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-2">Delete Featured Item?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This item will be removed from the homepage carousel. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border rounded-lg font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Modal ─────────────────────────────────────────────────────────────── */

function FeaturedItemModal({
  item,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  item: FeaturedItem | null;
  onClose: () => void;
  onSubmit: (data: CreateFeaturedItemData) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState(item?.title || '');
  const [subtitle, setSubtitle] = useState(item?.subtitle || '');
  const [link, setLink] = useState(item?.link || '');
  const [type, setType] = useState<FeaturedItem['type']>(item?.type || 'song');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(item?.image_url || '');
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? 0);
  const [startsAt, setStartsAt] = useState(item?.starts_at?.slice(0, 16) || '');
  const [endsAt, setEndsAt] = useState(item?.ends_at?.slice(0, 16) || '');
  const [songId, setSongId] = useState<number | undefined>(item?.song_id);
  const [albumId, setAlbumId] = useState<number | undefined>(item?.album_id);
  const [artistId, setArtistId] = useState<number | undefined>(item?.artist_id);
  const [eventId, setEventId] = useState<number | undefined>(item?.event_id);
  const [playlistId, setPlaylistId] = useState<number | undefined>(item?.playlist_id);
  const [entitySearch, setEntitySearch] = useState('');
  const deferredEntitySearch = useDeferredValue(entitySearch.trim());

  const currentLinkedIds = useMemo(
    () => ({
      song_id: songId,
      album_id: albumId,
      artist_id: artistId,
      event_id: eventId,
      playlist_id: playlistId,
    }),
    [songId, albumId, artistId, eventId, playlistId]
  );

  const searchType = type === 'custom' ? null : type;
  const selectedEntityId = getSelectedEntityId(type, currentLinkedIds);

  const { data: entityOptions = [], isFetching: isEntityLoading } = useQuery({
    queryKey: ['featured', 'entity-search', searchType, deferredEntitySearch],
    queryFn: async () => {
      if (!searchType) return [];
      const endpoint = buildEntitySearchEndpoint(searchType, deferredEntitySearch);
      const response = await apiGet<{ data?: Record<string, unknown>[] }>(endpoint);
      const items = Array.isArray(response?.data) ? response.data : [];
      return parseEntityOptions(items, searchType);
    },
    enabled: !!searchType,
    staleTime: 30_000,
  });

  const selectedEntity = useMemo(
    () => entityOptions.find((option) => option.id === selectedEntityId) ?? null,
    [entityOptions, selectedEntityId]
  );

  useEffect(() => {
    setEntitySearch('');
  }, [type]);

  const setLinkedEntityIds = useCallback((option?: FeaturedEntityOption) => {
    setSongId(option?.song_id);
    setAlbumId(option?.album_id);
    setArtistId(option?.artist_id);
    setEventId(option?.event_id);
    setPlaylistId(option?.playlist_id);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTypeSelect = (nextType: FeaturedItem['type']) => {
    setType(nextType);
    setLinkedEntityIds(undefined);
  };

  const handleEntitySelect = (option: FeaturedEntityOption) => {
    setLinkedEntityIds(option);
    setTitle(option.title);
    setSubtitle(option.defaultSubtitle);
    setLink(option.link);
    if (!imageFile) {
      setImagePreview(option.image_url || '');
    }
  };

  const clearEntitySelection = () => {
    setLinkedEntityIds(undefined);
    setEntitySearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateFeaturedItemData = {
      title,
      subtitle,
      link,
      type,
      song_id: songId,
      album_id: albumId,
      artist_id: artistId,
      event_id: eventId,
      playlist_id: playlistId,
      is_active: isActive,
      sort_order: sortOrder,
    };
    if (imageFile) data.image = imageFile;
    if (startsAt) data.starts_at = new Date(startsAt).toISOString();
    if (endsAt) data.ends_at = new Date(endsAt).toISOString();
    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">
            {item ? 'Edit Featured Item' : 'Add Featured Item'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTypeSelect(key as FeaturedItem['type'])}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      type === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {type !== 'custom' && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Linked Content</label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={entitySearch}
                  onChange={(e) => setEntitySearch(e.target.value)}
                  className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={`Search ${typeConfig[type].label.toLowerCase()}s`}
                />
              </div>

              {selectedEntityId && (
                <div className="mb-2 flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {selectedEntity?.label || `${typeConfig[type].label} #${selectedEntityId}`}
                    </p>
                    <p className="truncate text-muted-foreground">
                      {selectedEntity?.subtitle || 'Linked content selected'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearEntitySelection}
                    className="ml-3 rounded-md px-2 py-1 text-muted-foreground hover:bg-muted"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="max-h-56 overflow-y-auto rounded-lg border">
                {isEntityLoading ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading options...
                  </div>
                ) : entityOptions.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    No matching {typeConfig[type].label.toLowerCase()}s found.
                  </div>
                ) : (
                  entityOptions.map((option) => (
                    <button
                      key={`${option.type}-${option.id}`}
                      type="button"
                      onClick={() => handleEntitySelect(option)}
                      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/60 ${
                        selectedEntityId === option.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {option.image_url ? (
                          <Image
                            src={option.image_url}
                            alt={option.label}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{option.label}</p>
                        <p className="truncate text-sm text-muted-foreground">{option.subtitle}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Featured item title"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Subtitle *</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Short description"
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Link URL *</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="/songs/amazing-track or https://..."
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Banner Image</label>
            {imagePreview && (
              <div className="relative h-32 rounded-lg overflow-hidden bg-muted mb-2">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium hover:file:bg-primary/20"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              min={0}
              className="w-24 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Starts At</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ends At</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          {/* Active */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${
                isActive ? 'bg-green-500' : 'bg-muted'
              }`}
              onClick={() => setIsActive(!isActive)}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm font-medium">Active on homepage</span>
          </label>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-lg font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !subtitle || !link}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {item ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
