'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import {
  Search,
  ArrowLeft,
  Store,
  Loader2,
  ExternalLink,
  MapPin,
  Star,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shop {
  id: number;
  name: string;
  owner: string;
  description: string;
  product_count: number;
  total_sales: number;
  rating: number;
  location: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminStoreShopsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: shops, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'shops', searchQuery],
    queryFn: () => apiGet<{ data: Shop[] }>(`/api/admin/store/shops?search=${searchQuery}`).then(r => r.data),
  });

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
            <div key={shop.id} className="rounded-xl border p-5 hover:shadow-md transition-shadow">
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
                    <p className="text-sm text-muted-foreground">by {shop.owner}</p>
                  </div>
                </div>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  shop.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'
                )}>
                  {shop.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{shop.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{shop.product_count} products</div>
                <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400" />{shop.rating}</div>
                <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{shop.location}</div>
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
