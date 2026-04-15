'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { AlertCircle, CheckCircle, FileText, Plus, Edit, Archive, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LegalPageStatus = 'draft' | 'published' | 'archived';

interface LegalPage {
  id: number;
  title: string;
  subtitle: string | null;
  type: string;
  description: string | null;
  content: string;
  applies_to: string;
  requires_acceptance: boolean;
  effective_date: string | null;
  status: LegalPageStatus;
  version: number;
}

interface LegalPageFormData {
  title: string;
  subtitle: string;
  type: string;
  description: string;
  content: string;
  applies_to: string;
  requires_acceptance: boolean;
  effective_date: string;
}

const LEGAL_PAGE_TYPES = [
  { value: 'terms', label: 'Terms of Service' },
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'acceptable_use', label: 'Acceptable Use Policy' },
  { value: 'artist_agreement', label: 'Artist Agreement' },
  { value: 'copyright', label: 'Copyright Policy' },
  { value: 'cookies', label: 'Cookie Policy' },
  { value: 'disclaimer', label: 'Disclaimer' },
  { value: 'payment_terms', label: 'Payment Terms' },
  { value: 'dmca', label: 'DMCA Policy' },
  { value: 'accessibility', label: 'Accessibility Statement' },
];

const APPLIES_TO_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'users', label: 'Regular Users' },
  { value: 'artists', label: 'Artists Only' },
  { value: 'labels', label: 'Labels Only' },
  { value: 'event_organizers', label: 'Event Organizers' },
];

export default function LegalPageAdmin() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<LegalPageFormData>({
    title: '',
    subtitle: '',
    type: 'terms',
    description: '',
    content: '',
    applies_to: 'all',
    requires_acceptance: false,
    effective_date: '',
  });

  const queryClient = useQueryClient();

  // Fetch legal pages
  const { data: legalPages = [], isLoading } = useQuery<LegalPage[]>({
    queryKey: ['legal-pages', search, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/admin/legal-pages?${params}`);
      if (!response.ok) throw new Error('Failed to fetch legal pages');
      const data = await response.json();
      return (data.data as LegalPage[]) || [];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: LegalPageFormData) => {
      const url = editingId
        ? `/api/admin/legal-pages/${editingId}`
        : '/api/admin/legal-pages';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save legal page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pages'] });
      resetForm();
      alert(editingId ? 'Legal page updated successfully' : 'Legal page created successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Error saving legal page: ' + message);
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/legal-pages/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to publish');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pages'] });
      alert('Legal page published successfully');
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/legal-pages/${id}/archive`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to archive');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pages'] });
      alert('Legal page archived successfully');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/legal-pages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pages'] });
      alert('Legal page deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      type: 'terms',
      description: '',
      content: '',
      applies_to: 'all',
      requires_acceptance: false,
      effective_date: '',
    });
    setEditingId(null);
  };

  const handleEdit = (page: LegalPage) => {
    setFormData({
      title: page.title,
      subtitle: page.subtitle || '',
      type: page.type,
      description: page.description || '',
      content: page.content,
      applies_to: page.applies_to,
      requires_acceptance: page.requires_acceptance,
      effective_date: page.effective_date || '',
    });
    setEditingId(page.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Legal Pages Manager</h1>
        <p className="text-muted-foreground">Create, edit, and publish legal documents for your platform</p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">All Documents</TabsTrigger>
          <TabsTrigger value="editor">Create/Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Legal Document' : 'Create New Legal Document'}</CardTitle>
              <CardDescription>Fill in the details for your legal document</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Document Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Terms of Service"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subtitle</label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Optional subtitle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Document Type *</label>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {LEGAL_PAGE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Applies To *</label>
                    <Select
                      value={formData.applies_to}
                      onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })}
                    >
                      {APPLIES_TO_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description for admin list"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content (HTML) *</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter the full content (HTML supported)"
                    rows={15}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requires_acceptance}
                        onChange={(e) =>
                          setFormData({ ...formData, requires_acceptance: e.target.checked })
                        }
                      />
                      Requires User Acceptance
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Effective Date</label>
                    <Input
                      type="datetime-local"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Document' : 'Create Document'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1"
                />
                <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : legalPages.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No legal documents found. Create one to get started.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {legalPages.map((page: LegalPage) => (
                    <div key={page.id} className="border rounded-lg p-4 hover:bg-accent/50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            <h3 className="font-semibold">{page.title}</h3>
                            <Badge
                              variant={
                                page.status === 'published'
                                  ? 'default'
                                  : page.status === 'draft'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {page.status}
                            </Badge>
                            {page.requires_acceptance && <Badge variant="outline">Requires Acceptance</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{page.description}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>Type: {page.type}</span>
                            <span>•</span>
                            <span>Version: {page.version}</span>
                            <span>•</span>
                            <span>Applies to: {page.applies_to}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(page)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {page.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => publishMutation.mutate(page.id)}
                              disabled={publishMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}

                          {page.status === 'published' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => archiveMutation.mutate(page.id)}
                              disabled={archiveMutation.isPending}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this document?')) {
                                deleteMutation.mutate(page.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
