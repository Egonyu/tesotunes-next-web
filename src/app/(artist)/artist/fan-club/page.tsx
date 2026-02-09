'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import {
  Crown,
  Users,
  DollarSign,
  Settings,
  Plus,
  Loader2,
  Star,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FanClub {
  id: number;
  name: string;
  description: string;
  member_count: number;
  monthly_revenue: number;
  tiers: { id: number; name: string; price: number; perks: string[]; member_count: number }[];
  is_active: boolean;
}

export default function ArtistFanClubPage() {
  const queryClient = useQueryClient();

  const { data: fanClub, isLoading } = useQuery({
    queryKey: ['artist', 'fan-club'],
    queryFn: () => apiGet<{ data: FanClub }>('/artist/fan-club').then(r => r.data),
  });

  const createFanClub = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiPost('/artist/fan-club', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', 'fan-club'] });
      toast.success('Fan club created!');
    },
  });

  const [showCreate, setShowCreate] = useState(false);
  const [newClub, setNewClub] = useState({ name: '', description: '' });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!fanClub && !showCreate) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <Crown className="h-16 w-16 text-primary mx-auto" />
        <div>
          <h1 className="text-2xl font-bold mb-2">Create Your Fan Club</h1>
          <p className="text-muted-foreground">
            Build a community around your music. Offer exclusive content, early access,
            and special perks to your biggest fans.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          Get Started
        </button>
      </div>
    );
  }

  if (showCreate) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Create Fan Club</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Club Name</label>
            <input
              type="text"
              value={newClub.name}
              onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border bg-background"
              placeholder="e.g. Inner Circle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={newClub.description}
              onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
              placeholder="What exclusive perks will fans get?"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => createFanClub.mutate(newClub)}
              disabled={createFanClub.isPending || !newClub.name}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {createFanClub.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-lg border hover:bg-muted">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Members', value: fanClub!.member_count, icon: Users, color: 'text-blue-500' },
    { label: 'Monthly Revenue', value: `$${fanClub!.monthly_revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Tiers', value: fanClub!.tiers.length, icon: Star, color: 'text-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{fanClub!.name}</h1>
          <p className="text-muted-foreground">{fanClub!.description}</p>
        </div>
        <button className="p-2 rounded-lg border hover:bg-muted">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-card border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn('h-5 w-5', stat.color)} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Membership Tiers</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm hover:bg-muted">
            <Plus className="h-4 w-4" />
            Add Tier
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {fanClub!.tiers.map((tier) => (
            <div key={tier.id} className="rounded-xl border p-5">
              <h3 className="font-semibold">{tier.name}</h3>
              <p className="text-2xl font-bold mt-1">${tier.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
              <p className="text-sm text-muted-foreground mt-2">{tier.member_count} members</p>
              <ul className="mt-3 space-y-1.5">
                {tier.perks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Star className="h-3.5 w-3.5 text-primary shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
