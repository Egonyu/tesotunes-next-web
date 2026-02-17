'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import {
  useAdminAwardDetail,
  useUpdateAward,
  type UpdateAwardData,
} from '@/hooks/useAwards';

export default function EditAwardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: res, isLoading } = useAdminAwardDetail(id);
  const updateAward = useUpdateAward();

  const [form, setForm] = useState<UpdateAwardData>({
    id: Number(id),
    name: '',
    year: new Date().getFullYear(),
    description: '',
    season: '',
    nominations_start_at: '',
    nominations_end_at: '',
    voting_start_at: '',
    voting_end_at: '',
    ceremony_date: '',
    status: 'upcoming',
    visibility: 'public',
    allow_public_nominations: true,
    allow_public_voting: true,
    votes_per_category: 1,
  });

  useEffect(() => {
    if (res?.data) {
      const a = res.data;
      setForm({
        id: a.id,
        name: a.title,
        year: a.year,
        description: a.description || '',
        season: a.season || '',
        nominations_start_at: a.nomination_starts_at?.slice(0, 16) || '',
        nominations_end_at: a.nomination_ends_at?.slice(0, 16) || '',
        voting_start_at: a.voting_starts_at?.slice(0, 16) || '',
        voting_end_at: a.voting_ends_at?.slice(0, 16) || '',
        ceremony_date: a.ceremony_date?.slice(0, 16) || '',
        status: a.status,
        visibility: a.visibility,
        allow_public_nominations: a.allow_public_nominations,
        allow_public_voting: a.allow_public_voting,
        votes_per_category: a.votes_per_category,
      });
    }
  }, [res?.data]);

  const updateField = (field: keyof UpdateAwardData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAward.mutate(form, {
      onSuccess: () => router.push(`/admin/awards/${id}`),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!res?.data) {
    return (
      <div className="text-center py-24">
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Award Not Found</h3>
        <Link href="/admin/awards" className="text-primary hover:underline">Back to Awards</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Edit: ${res.data.title}`}
        description="Update award details, schedule, and settings"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Basic Information">
          <FormField
            label="Award Name"
            name="name"
            value={form.name}
            onChange={(v) => updateField('name', v)}
            placeholder="e.g. Eastern Entertainment Awards 2025"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Year"
              name="year"
              type="number"
              value={form.year}
              onChange={(v) => updateField('year', parseInt(v))}
              min={2020}
              max={2030}
              required
            />
            <FormField
              label="Season / Edition"
              name="season"
              value={form.season}
              onChange={(v) => updateField('season', v)}
              placeholder="e.g. Season 1"
            />
          </div>
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
            onChange={(v) => updateField('description', v)}
            rows={4}
          />
        </FormSection>

        <FormSection title="Configuration">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Status"
              name="status"
              type="select"
              value={form.status}
              onChange={(v) => updateField('status', v)}
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'nominations_open', label: 'Nominations Open' },
                { value: 'voting_open', label: 'Voting Open' },
                { value: 'voting_closed', label: 'Voting Closed' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
            <FormField
              label="Visibility"
              name="visibility"
              type="select"
              value={form.visibility}
              onChange={(v) => updateField('visibility', v)}
              options={[
                { value: 'public', label: 'Public' },
                { value: 'private', label: 'Private' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              label="Votes Per Category"
              name="votes_per_category"
              type="number"
              value={form.votes_per_category}
              onChange={(v) => updateField('votes_per_category', parseInt(v))}
              min={1}
              max={10}
            />
            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allow_public_nominations}
                  onChange={(e) => updateField('allow_public_nominations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                <span className="ml-2 text-sm">Public Nominations</span>
              </label>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allow_public_voting}
                  onChange={(e) => updateField('allow_public_voting', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                <span className="ml-2 text-sm">Public Voting</span>
              </label>
            </div>
          </div>
        </FormSection>

        <FormSection title="Schedule">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nominations Start"
              name="nominations_start_at"
              type="datetime-local"
              value={form.nominations_start_at}
              onChange={(v) => updateField('nominations_start_at', v)}
            />
            <FormField
              label="Nominations End"
              name="nominations_end_at"
              type="datetime-local"
              value={form.nominations_end_at}
              onChange={(v) => updateField('nominations_end_at', v)}
            />
            <FormField
              label="Voting Start"
              name="voting_start_at"
              type="datetime-local"
              value={form.voting_start_at}
              onChange={(v) => updateField('voting_start_at', v)}
            />
            <FormField
              label="Voting End"
              name="voting_end_at"
              type="datetime-local"
              value={form.voting_end_at}
              onChange={(v) => updateField('voting_end_at', v)}
            />
          </div>
          <FormField
            label="Ceremony Date"
            name="ceremony_date"
            type="datetime-local"
            value={form.ceremony_date}
            onChange={(v) => updateField('ceremony_date', v)}
          />
        </FormSection>

        <FormActions
          cancelHref={`/admin/awards/${id}`}
          submitLabel="Update Award"
          isSubmitting={updateAward.isPending}
        />
      </form>
    </div>
  );
}
