'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '@/lib/api';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
  Megaphone,
  Calendar,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Promotion {
  id: number;
  title: string;
  description: string;
  type: 'banner' | 'featured' | 'flash_sale' | 'bundle';
  starts_at: string;
  ends_at: string;
  products_count: number;
  views: number;
  conversions: number;
  is_active: boolean;
}

export default function AdminStorePromotionsPage() {
  const queryClient = useQueryClient();

  const { data: promotions, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'promotions'],
    queryFn: () => apiGet<{ data: Promotion[] }>('/admin/store/promotions').then(r => r.data),
  });

  const deletePromo = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/store/promotions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'promotions'] });
      toast.success('Promotion deleted');
    },
  });

  const typeLabels: Record<string, string> = {
    banner: 'Banner',
    featured: 'Featured',
    flash_sale: 'Flash Sale',
    bundle: 'Bundle Deal',
  };

  const typeColors: Record<string, string> = {
    banner: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    featured: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    flash_sale: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    bundle: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/store" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">Manage store promotions and campaigns</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Create Promotion
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 text-sm font-medium">Promotion</th>
              <th className="text-left p-4 text-sm font-medium">Type</th>
              <th className="text-left p-4 text-sm font-medium">Period</th>
              <th className="text-left p-4 text-sm font-medium">Performance</th>
              <th className="text-left p-4 text-sm font-medium">Status</th>
              <th className="text-right p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
            ) : promotions && promotions.length > 0 ? (
              promotions.map((promo) => (
                <tr key={promo.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-4">
                    <p className="font-medium">{promo.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{promo.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{promo.products_count} products</p>
                  </td>
                  <td className="p-4">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', typeColors[promo.type])}>
                      {typeLabels[promo.type]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(promo.starts_at).toLocaleDateString()}</div>
                    <div className="text-xs">to {new Date(promo.ends_at).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-muted-foreground" />{promo.views}</div>
                      <div className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-green-500" />{promo.conversions}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      promo.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'
                    )}>
                      {promo.is_active ? 'Active' : 'Ended'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-muted"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => deletePromo.mutate(promo.id)} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p>No promotions found. Create your first store promotion.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
