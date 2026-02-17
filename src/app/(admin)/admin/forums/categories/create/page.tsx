'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api';
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface CreateCategoryForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_locked: boolean;
}

const ICON_OPTIONS = [
  'MessageSquare', 'Music', 'Star', 'Heart', 'Zap', 'Globe',
  'Users', 'Mic', 'Radio', 'Award', 'TrendingUp', 'Headphones',
];

const COLOR_OPTIONS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

export default function CreateForumCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateCategoryForm>({
    name: '',
    slug: '',
    description: '',
    icon: 'MessageSquare',
    color: '#3b82f6',
    is_locked: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryForm) =>
      apiPost('/admin/forums/categories', data),
    onSuccess: () => {
      toast.success('Forum category created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'forums'] });
      router.push('/admin/forums');
    },
    onError: () => {
      toast.error('Failed to create forum category');
    },
  });

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setForm(prev => ({ ...prev, name, slug }));
  };

  const updateField = <K extends keyof CreateCategoryForm>(
    key: K,
    value: CreateCategoryForm[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/forums"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Forum Category</h1>
          <p className="text-muted-foreground">
            Add a new discussion category to the forums
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border bg-card p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Music Production"
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/forums/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="music-production"
                className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what topics belong in this category..."
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm min-h-[100px] resize-y focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              required
              rows={4}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => updateField('icon', icon)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    form.icon === icon
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateField('color', color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-transform ${
                    form.color === color
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Locked */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateField('is_locked', !form.is_locked)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.is_locked ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                  form.is_locked ? 'translate-x-5' : ''
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-medium">Locked Category</p>
              <p className="text-xs text-muted-foreground">
                Only admins can create topics in locked categories
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">
            Preview
          </h3>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: `${form.color}20`, color: form.color }}
            >
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">
                {form.name || 'Category Name'}
              </p>
              <p className="text-sm text-muted-foreground">
                {form.description || 'Category description will appear here'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/forums"
            className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Create Category
          </button>
        </div>
      </form>
    </div>
  );
}
