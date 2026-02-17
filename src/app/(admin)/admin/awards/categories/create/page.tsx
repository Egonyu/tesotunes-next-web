'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, FormField, FormSection, FormActions } from '@/components/admin';
import {
  useCreateAwardCategory,
  type CreateCategoryData,
  type CategoryType,
} from '@/hooks/useAwards';

const categoryTypes: { value: CategoryType; label: string }[] = [
  { value: 'music', label: 'Music' },
  { value: 'artist', label: 'Artist' },
  { value: 'album', label: 'Album' },
  { value: 'song', label: 'Song' },
  { value: 'video', label: 'Video' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'general', label: 'General' },
];

export default function CreateCategoryPage() {
  const router = useRouter();
  const createCategory = useCreateAwardCategory();

  const [form, setForm] = useState<CreateCategoryData>({
    name: '',
    description: '',
    category_type: 'music',
    sort_order: 0,
    is_active: true,
  });

  const updateField = (field: keyof CreateCategoryData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate(form, {
      onSuccess: () => router.push('/admin/awards/categories'),
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Create Category"
        description="Add a new award category"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Category Details">
          <FormField
            label="Category Name"
            name="name"
            value={form.name}
            onChange={(v) => updateField('name', v)}
            placeholder="e.g. Best New Artist, Song of the Year"
            required
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
            onChange={(v) => updateField('description', v)}
            placeholder="Describe this category..."
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Category Type"
              name="category_type"
              type="select"
              value={form.category_type}
              onChange={(v) => updateField('category_type', v)}
              options={categoryTypes}
              required
            />
            <FormField
              label="Sort Order"
              name="sort_order"
              type="number"
              value={form.sort_order}
              onChange={(v) => updateField('sort_order', parseInt(v))}
              min={0}
              hint="Lower numbers appear first"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              <span className="ml-2 text-sm font-medium">Active</span>
            </label>
          </div>
        </FormSection>

        <FormActions
          cancelHref="/admin/awards/categories"
          submitLabel="Create Category"
          isSubmitting={createCategory.isPending}
        />
      </form>
    </div>
  );
}
