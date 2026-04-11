'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import {
  Search,
  ArrowLeft,
  Store,
  Loader2,
  MapPin,
  Star,
  Package,
  Mail,
  ShieldCheck,
  CircleOff,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Shop {
  id: number;
  uuid?: string;
  name: string;
  description?: string | null;
  status: string;
  store_type?: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
  products_count: number;
  rating?: number | string | null;
  city?: string | null;
  country?: string | null;
  is_verified: boolean;
  suspended_reason?: string | null;
  created_at: string;
}

export default function AdminStoreShopsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: shops, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'shops', searchQuery],
    queryFn: () => apiGet<{ data: Shop[] }>(`/admin/store/shops?search=${searchQuery}`).then(r => r.data),
  });

  const shopAction = useMutation({
    mutationFn: async ({ shopId, action }: { shopId: number; action: 'approve' | 'suspend' | 'verify' | 'unverify' }) =>
      apiPost<{ message?: string }>(`/admin/store/shops/${shopId}/${action}`),
    onSuccess: (response, variables) => {
      toast.success(response.message ?? `Shop ${variables.action}d successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'shops'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update shop.';
      toast.error(message);
    },
  });

  const runShopAction = (shopId: number, action: 'approve' | 'suspend' | 'verify' | 'unverify') => {
    shopAction.mutate({ shopId, action });
  };

  const isBusy = (shopId: number, action: 'approve' | 'suspend' | 'verify' | 'unverify') =>
    shopAction.isPending &&
    shopAction.variables?.shopId === shopId &&
    shopAction.variables?.action === action;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/store" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Seller Shops</h1>
          <p className="text-muted-foreground">Manage registered seller shops</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm"
          placeholder="Search shops..."
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : shops && shops.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <div key={shop.id} className="rounded-xl border p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{shop.name}</h3>
                      {shop.is_verified && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Verified</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">by {shop.owner_name || 'Unknown owner'}</p>
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  shop.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : shop.status === 'suspended'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                )}>
                  {shop.status}
                </span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                {shop.description || 'No store description added yet.'}
              </p>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Package className="h-3.5 w-3.5" />{shop.products_count} products</div>
                <div className="flex items-center gap-2"><Star className="h-3.5 w-3.5 text-yellow-400" />{shop.rating ?? 0}</div>
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{[shop.city, shop.country].filter(Boolean).join(', ') || 'Location not set'}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{shop.owner_email || 'No owner email'}</div>
              </div>
              {shop.suspended_reason ? (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Suspension reason: {shop.suspended_reason}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {shop.status !== 'active' ? (
                  <button
                    onClick={() => runShopAction(shop.id, 'approve')}
                    disabled={shopAction.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60"
                  >
                    {isBusy(shop.id, 'approve') ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => runShopAction(shop.id, 'suspend')}
                    disabled={shopAction.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-60"
                  >
                    {isBusy(shop.id, 'suspend') ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleOff className="h-4 w-4" />}
                    Suspend
                  </button>
                )}
                {shop.is_verified ? (
                  <button
                    onClick={() => runShopAction(shop.id, 'unverify')}
                    disabled={shopAction.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-60"
                  >
                    {isBusy(shop.id, 'unverify') ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                    Remove verification
                  </button>
                ) : (
                  <button
                    onClick={() => runShopAction(shop.id, 'verify')}
                    disabled={shopAction.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-60"
                  >
                    {isBusy(shop.id, 'verify') ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                    Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border p-8 text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Shops Found</h3>
          <p className="text-muted-foreground">No seller shops have been registered yet.</p>
        </div>
      )}
    </div>
  );
}
