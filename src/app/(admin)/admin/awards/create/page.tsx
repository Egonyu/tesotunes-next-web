'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import {
  useCreateAward,
  type AwardStatus,
  type AwardVisibility,
  type CreateAwardData,
} from '@/hooks/useAwards';

export default function CreateAwardPage() {
  const router = useRouter();
  const createAward = useCreateAward();

  const [form, setForm] = useState<CreateAwardData>({
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

  const updateField = (field: keyof CreateAwardData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAward.mutate(form, {
      onSuccess: () => router.push('/admin/awards'),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Create Award"
        description="Set up a new award show or season"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Basic Information" description="General details about the award">
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
              placeholder="e.g. Season 1, Q1"
            />
          </div>
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
            onChange={(v) => updateField('description', v)}
            placeholder="Describe the award show..."
            rows={4}
          />
        </FormSection>

        <FormSection title="Configuration" description="Visibility and voting settings">
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

        <FormSection title="Schedule" description="Set key dates for the award timeline">
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
          cancelHref="/admin/awards"
          submitLabel="Create Award"
          isSubmitting={createAward.isPending}
        />
      </form>
    </div>
  );
}
