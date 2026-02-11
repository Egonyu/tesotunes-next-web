'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
  Tag,
  Calendar,
  Percent,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Discount {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  max_uses: number;
  used_count: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export default function AdminStoreDiscountsPage() {
  const queryClient = useQueryClient();

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'discounts'],
    queryFn: () => apiGet<{ data: Discount[] }>('/api/admin/store/discounts').then(r => r.data),
  });

  const deleteDiscount = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/store/discounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'discounts'] });
      toast.success('Discount deleted');
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/store" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Discount Codes</h1>
          <p className="text-muted-foreground">Create and manage promotional discount codes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Discount
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 text-sm font-medium">Code</th>
              <th className="text-left p-4 text-sm font-medium">Discount</th>
              <th className="text-left p-4 text-sm font-medium">Usage</th>
              <th className="text-left p-4 text-sm font-medium">Valid Period</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-right p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
            ) : discounts && discounts.length > 0 ? (
              discounts.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-muted text-sm font-mono font-medium">{d.code}</code>
                      <button onClick={() => copyCode(d.code)} className="p-1 rounded hover:bg-muted"><Copy className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {d.type === 'percentage' ? <Percent className="h-4 w-4 text-green-500" /> : <Tag className="h-4 w-4 text-blue-500" />}
                      <span className="font-medium">{d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}</span>
                    </div>
                    {d.min_order > 0 && <p className="text-xs text-muted-foreground mt-0.5">Min. order: ${d.min_order}</p>}
                  </td>
                  <td className="p-4 text-sm">{d.used_count} / {d.max_uses || '∞'}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(d.starts_at).toLocaleDateString()} - {new Date(d.expires_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      d.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    )}>
                      {d.is_active ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-muted"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => deleteDiscount.mutate(d.id)} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p>No discount codes found. Create your first promotion.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
