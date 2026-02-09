'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForumCategories, useCreateTopic, transformCategory } from '@/hooks/useForums';
import { toast } from 'sonner';

export default function NewForumTopicPage() {
  const router = useRouter();
  const { data: categoriesData, isLoading: loadingCategories } = useForumCategories();
  const createTopic = useCreateTopic();

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    body: '',
  });

interface ForumCategory {
  id: number;
  name: string;
}

  const categories: ForumCategory[] = categoriesData
    ? (Array.isArray(categoriesData) ? categoriesData as ForumCategory[] : ((categoriesData as { data?: ForumCategory[] }).data || []))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category_id || !formData.body) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createTopic.mutateAsync({
        title: formData.title,
        category_id: Number(formData.category_id),
        content: formData.body,
      });
      toast.success('Topic created successfully!');
      router.push('/forums');
    } catch {
      toast.error('Failed to create topic. Please try again.');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/forums" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Topic</h1>
          <p className="text-muted-foreground">Start a new discussion</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Category *</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border bg-background"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border bg-background"
            placeholder="What's your topic about?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Content *</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={10}
            className="w-full px-4 py-2.5 rounded-lg border bg-background resize-none"
            placeholder="Write your post here... You can use Markdown formatting."
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Supports Markdown formatting</p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={createTopic.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {createTopic.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createTopic.isPending ? 'Creating...' : 'Create Topic'}
          </button>
          <Link
            href="/forums"
            className="px-6 py-2.5 rounded-lg border font-medium hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
