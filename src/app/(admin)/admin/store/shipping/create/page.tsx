'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, Plus, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';

interface ShippingMethod {
  name: string;
  price: number;
  estimated_days: string;
}

interface ShippingForm {
  name: string;
  regions: string[];
  methods: ShippingMethod[];
  is_active: boolean;
}

export default function CreateShippingZonePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [regionInput, setRegionInput] = useState('');
  const [form, setForm] = useState<ShippingForm>({
    name: '',
    regions: [],
    methods: [{ name: '', price: 0, estimated_days: '' }],
    is_active: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: ShippingForm) =>
      apiPost('/admin/store/shipping', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'shipping'] });
      router.push('/admin/store/shipping');
    },
  });

  const addRegion = () => {
    const trimmed = regionInput.trim();
    if (trimmed && !form.regions.includes(trimmed)) {
      setForm(prev => ({ ...prev, regions: [...prev.regions, trimmed] }));
      setRegionInput('');
    }
  };

  const removeRegion = (region: string) => {
    setForm(prev => ({ ...prev, regions: prev.regions.filter(r => r !== region) }));
  };

  const addMethod = () => {
    setForm(prev => ({
      ...prev,
      methods: [...prev.methods, { name: '', price: 0, estimated_days: '' }],
    }));
  };

  const updateMethod = (index: number, field: keyof ShippingMethod, value: string | number) => {
    setForm(prev => ({
      ...prev,
      methods: prev.methods.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const removeMethod = (index: number) => {
    if (form.methods.length <= 1) return;
    setForm(prev => ({
      ...prev,
      methods: prev.methods.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.regions.length === 0) return;
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/store/shipping"
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Shipping Zone</h1>
          <p className="text-muted-foreground">Configure a new shipping zone and methods</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Zone Info */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Zone Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Zone Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border bg-background"
              placeholder="e.g. Kampala Metro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Regions *</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={regionInput}
                onChange={(e) => setRegionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRegion(); } }}
                className="flex-1 px-3 py-2 rounded-lg border bg-background"
                placeholder="Type region name and press Enter"
              />
              <button
                type="button"
                onClick={addRegion}
                className="px-3 py-2 border rounded-lg hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.regions.map(region => (
                <span key={region} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                  {region}
                  <button type="button" onClick={() => removeRegion(region)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
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

        {/* Shipping Methods */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Shipping Methods</h2>
            <button
              type="button"
              onClick={addMethod}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add Method
            </button>
          </div>

          {form.methods.map((method, index) => (
            <div key={index} className="grid grid-cols-[1fr_120px_120px_auto] gap-3 items-end">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Method Name</label>
                <input
                  type="text"
                  value={method.name}
                  onChange={(e) => updateMethod(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                  placeholder="e.g. Standard"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Price (UGX)</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={method.price || ''}
                  onChange={(e) => updateMethod(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Est. Days</label>
                <input
                  type="text"
                  value={method.estimated_days}
                  onChange={(e) => updateMethod(index, 'estimated_days', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                  placeholder="1-3"
                />
              </div>
              <button
                type="button"
                onClick={() => removeMethod(index)}
                disabled={form.methods.length <= 1}
                className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {createMutation.error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            Failed to create shipping zone. Please try again.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending || !form.name.trim() || form.regions.length === 0}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Shipping Zone
          </button>
          <Link
            href="/admin/store/shipping"
            className="px-6 py-2 border rounded-lg font-medium hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
