'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';

interface PromotionForm {
  title: string;
  description: string;
  type: 'banner' | 'featured' | 'flash_sale' | 'bundle';
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export default function CreatePromotionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PromotionForm>({
    title: '',
    description: '',
    type: 'banner',
    starts_at: '',
    ends_at: '',
    is_active: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: PromotionForm) =>
      apiPost('/admin/store/promotions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'promotions'] });
      router.push('/admin/store/promotions');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/store/promotions"
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Promotion</h1>
          <p className="text-muted-foreground">Add a new store promotion</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border bg-background"
              placeholder="e.g. Summer Flash Sale"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border bg-background min-h-[100px]"
              placeholder="Promotion details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as PromotionForm['type'] }))}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="banner">Banner</option>
              <option value="featured">Featured</option>
              <option value="flash_sale">Flash Sale</option>
              <option value="bundle">Bundle</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Starts At</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm(prev => ({ ...prev, starts_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ends At</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm(prev => ({ ...prev, ends_at: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Active</label>
          </div>
        </div>

        {createMutation.error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            Failed to create promotion. Please try again.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending || !form.title.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Promotion
          </button>
          <Link
            href="/admin/store/promotions"
            className="px-6 py-2 border rounded-lg font-medium hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
