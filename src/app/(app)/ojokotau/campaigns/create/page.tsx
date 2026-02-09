'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

export default function CreateCampaignPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    category: 'music',
    duration_days: '30',
  });

  const createCampaign = useMutation({
    mutationFn: (data: FormData) =>
      apiPost<{ data: { id: number } }>('/ojokotau/campaigns', data),
    onSuccess: (res) => {
      toast.success('Campaign created!');
      router.push('/ojokotau/campaigns');
    },
    onError: () => {
      toast.error('Failed to create campaign');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    createCampaign.mutate(data);
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/ojokotau" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">Fund your next creative project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Cover Image</label>
          <div className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Click to upload cover image</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Campaign Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border bg-background"
            placeholder="Give your campaign a title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
            placeholder="Tell people about your campaign and what you'll use the funds for..."
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Goal ($) *</label>
            <input
              type="number"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border bg-background"
              placeholder="5000"
              min="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border bg-background"
            >
              <option value="music">Music</option>
              <option value="events">Events</option>
              <option value="equipment">Equipment</option>
              <option value="education">Education</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Duration</label>
            <select
              value={formData.duration_days}
              onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border bg-background"
            >
              <option value="15">15 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={createCampaign.isPending || !formData.title || !formData.goal}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {createCampaign.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createCampaign.isPending ? 'Creating...' : 'Launch Campaign'}
          </button>
          <Link href="/ojokotau" className="px-6 py-2.5 rounded-lg border font-medium hover:bg-muted">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
