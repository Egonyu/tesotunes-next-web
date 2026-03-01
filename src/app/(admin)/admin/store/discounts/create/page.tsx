'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';

interface DiscountForm {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  max_uses: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export default function CreateDiscountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DiscountForm>({
    code: '',
    type: 'percentage',
    value: 0,
    min_order: 0,
    max_uses: 0,
    starts_at: '',
    expires_at: '',
    is_active: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: DiscountForm) =>
      apiPost('/admin/store/discounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'discounts'] });
      router.push('/admin/store/discounts');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || form.value <= 0) return;
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/store/discounts"
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Discount</h1>
          <p className="text-muted-foreground">Add a new discount code</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Discount Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 rounded-lg border bg-background font-mono uppercase"
              placeholder="e.g. SUMMER25"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (UGX)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value *</label>
              <input
                type="number"
                min={0}
                step={form.type === 'percentage' ? 1 : 100}
                value={form.value || ''}
                onChange={(e) => setForm(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg border bg-background"
                placeholder={form.type === 'percentage' ? '10' : '5000'}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Order Amount (UGX)</label>
              <input
                type="number"
                min={0}
                step={100}
                value={form.min_order || ''}
                onChange={(e) => setForm(prev => ({ ...prev, min_order: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg border bg-background"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses</label>
              <input
                type="number"
                min={0}
                value={form.max_uses || ''}
                onChange={(e) => setForm(prev => ({ ...prev, max_uses: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg border bg-background"
                placeholder="0 = unlimited"
              />
            </div>
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
              <label className="block text-sm font-medium mb-1">Expires At</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm(prev => ({ ...prev, expires_at: e.target.value }))}
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
            Failed to create discount. Please try again.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending || !form.code.trim() || form.value <= 0}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Discount
          </button>
          <Link
            href="/admin/store/discounts"
            className="px-6 py-2 border rounded-lg font-medium hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
