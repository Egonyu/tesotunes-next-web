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
  Truck,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShippingZone {
  id: number;
  name: string;
  regions: string[];
  methods: { name: string; price: number; estimated_days: string }[];
  is_active: boolean;
}

export default function AdminStoreShippingPage() {
  const queryClient = useQueryClient();

  const { data: zones, isLoading } = useQuery({
    queryKey: ['admin', 'store', 'shipping'],
    queryFn: () => apiGet<{ data: ShippingZone[] }>('/api/admin/store/shipping').then(r => r.data),
  });

  const deleteZone = useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/store/shipping/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'shipping'] });
      toast.success('Shipping zone deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/store" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Shipping Zones</h1>
          <p className="text-muted-foreground">Manage shipping regions and delivery methods</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Zone
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : zones && zones.length > 0 ? (
        <div className="grid gap-4">
          {zones.map((zone) => (
            <div key={zone.id} className="rounded-xl border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{zone.name}</h3>
                    <p className="text-sm text-muted-foreground">{zone.regions.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    zone.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'
                  )}>
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button className="p-2 rounded-lg hover:bg-muted"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => deleteZone.mutate(zone.id)} className="p-2 rounded-lg hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="space-y-2">
                {zone.methods.map((method, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{method.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{method.estimated_days}</span>
                      <span className="font-medium">${method.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border p-8 text-center">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Shipping Zones</h3>
          <p className="text-muted-foreground">Set up shipping zones to enable product delivery.</p>
        </div>
      )}
    </div>
  );
}
