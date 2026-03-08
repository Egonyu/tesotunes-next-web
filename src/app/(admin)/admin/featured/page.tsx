'use client';

import { useState, useCallback } from 'react';
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
} from 'lucide-react';
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

const typeConfig: Record<string, { label: string; icon: typeof Music; color: string }> = {
  song: { label: 'Song', icon: Music, color: 'text-blue-500 bg-blue-500/10' },
  album: { label: 'Album', icon: Disc3, color: 'text-purple-500 bg-purple-500/10' },
  artist: { label: 'Artist', icon: Mic2, color: 'text-green-500 bg-green-500/10' },
  playlist: { label: 'Playlist', icon: ListMusic, color: 'text-orange-500 bg-orange-500/10' },
  event: { label: 'Event', icon: Calendar, color: 'text-pink-500 bg-pink-500/10' },
  custom: { label: 'Custom', icon: LinkIcon, color: 'text-gray-500 bg-gray-500/10' },
};

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateFeaturedItemData = {
      title,
      subtitle,
      link,
      type,
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
                    onClick={() => setType(key as FeaturedItem['type'])}
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
