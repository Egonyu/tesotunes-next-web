'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import { PageHeader, FormField, FormSection, FormActions, GenreIconPicker } from '@/components/admin';
import { toast } from 'sonner';

interface GenreFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
  sort_order: string;
}

export default function CreateGenrePage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<GenreFormData>({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    is_active: true,
    sort_order: '0',
  });

  const createMutation = useMutation({
    mutationFn: (data: GenreFormData) => {
      const payload: Record<string, unknown> = {
        name: data.name,
        description: data.description || undefined,
        color: data.color || undefined,
        icon: data.icon || undefined,
        is_active: data.is_active,
        sort_order: parseInt(data.sort_order) || 0,
      };
      if (data.slug) payload.slug = data.slug;
      return apiPost<{ success: boolean; message: string; data: { id: number } }>('/admin/genres', payload);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Genre created successfully');
      router.push('/admin/genres');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } }; message?: string };
      if (axiosError.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.entries(axiosError.response.data.errors).forEach(([key, messages]) => {
          newErrors[key] = messages[0];
        });
        setErrors(newErrors);
      }
      const msg = axiosError.response?.data?.message || axiosError.message || 'Failed to create genre';
      toast.error(msg);
    },
  });

  const updateField = (field: keyof GenreFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    createMutation.mutate(formData);
  };

  // Common color palette for music genres
  const presetColors = [
    '#E11D48', '#F97316', '#EAB308', '#22C55E', '#10B981',
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
    '#D946EF', '#EC4899', '#F43F5E', '#84CC16', '#14B8A6',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Genre"
        description="Add a new music genre"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Genres', href: '/admin/genres' },
          { label: 'Create' },
        ]}
        backHref="/admin/genres"
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <FormSection title="Genre Details">
          <FormField label="Name" required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
              placeholder="e.g. Afrobeat, Amapiano, Gospel"
            />
          </FormField>

          <FormField label="Slug" error={errors.slug}>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
              placeholder="auto-generated from name if empty"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL-friendly identifier. Leave empty to auto-generate.
            </p>
          </FormField>

          <FormField label="Description" error={errors.description}>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Brief description of this genre..."
              maxLength={1000}
            />
          </FormField>

          <FormField label="Icon / Emoji" error={errors.icon}>
            <GenreIconPicker
              value={formData.icon}
              onChange={(value) => updateField('icon', value)}
              error={errors.icon}
            />
          </FormField>
        </FormSection>

        <FormSection title="Appearance">
          <FormField label="Color" error={errors.color}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="h-10 w-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="w-32 px-3 py-2 border rounded-lg bg-background font-mono text-sm focus:ring-2 focus:ring-primary"
                  placeholder="#3B82F6"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {presetColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateField('color', color)}
                    className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: formData.color === color ? 'white' : 'transparent',
                      boxShadow: formData.color === color ? `0 0 0 2px ${color}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </FormField>
        </FormSection>

        <FormSection title="Settings">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sort Order" error={errors.sort_order}>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => updateField('sort_order', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                min="0"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers appear first. Genres with the same order are sorted by name.
              </p>
            </FormField>

            <FormField label="Active">
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Genre is visible to users</span>
              </label>
            </FormField>
          </div>
        </FormSection>

        <FormActions
          cancelHref="/admin/genres"
          isSubmitting={createMutation.isPending}
          submitLabel="Create Genre"
        />
      </form>
    </div>
  );
}
