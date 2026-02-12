'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';
import {
  Flag,
  Plus,
  Search,
  Loader2,
  Save,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────
interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  environments: string[];
  conditions: {
    user_roles?: string[];
    user_ids?: number[];
    regions?: string[];
  };
  created_at: string;
  updated_at: string;
}

interface FeatureFlagsResponse {
  data: FeatureFlag[];
}

// ── Component ────────────────────────────────────────────────────────
export default function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [envFilter, setEnvFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
    rollout_percentage: 100,
    environments: ['production'] as string[],
  });

  // ── Queries ──────────────────────────────────────────────────────
  const { data: flagsData, isLoading } = useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: () => apiGet<FeatureFlagsResponse>('/api/admin/feature-flags'),
  });

  // ── Mutations ────────────────────────────────────────────────────
  const toggleFlag = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      apiPut(`/api/admin/feature-flags/${id}`, { enabled }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      toast.success(`Feature ${vars.enabled ? 'enabled' : 'disabled'}`);
    },
    onError: () => toast.error('Failed to toggle feature'),
  });

  const createFlag = useMutation({
    mutationFn: (data: typeof formData) =>
      apiPost('/api/admin/feature-flags', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      toast.success('Feature flag created');
      setShowCreateModal(false);
      resetForm();
    },
    onError: () => toast.error('Failed to create feature flag'),
  });

  const updateFlag = useMutation({
    mutationFn: ({ id, ...data }: typeof formData & { id: number }) =>
      apiPut(`/api/admin/feature-flags/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      toast.success('Feature flag updated');
      setEditingFlag(null);
      resetForm();
    },
    onError: () => toast.error('Failed to update feature flag'),
  });

  const deleteFlag = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/admin/feature-flags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      toast.success('Feature flag deleted');
    },
    onError: () => toast.error('Failed to delete feature flag'),
  });

  // ── Helpers ──────────────────────────────────────────────────────
  const flags = flagsData?.data ?? [];
  const filteredFlags = flags.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnv = envFilter === 'all' || f.environments.includes(envFilter);
    return matchesSearch && matchesEnv;
  });

  const enabledCount = flags.filter((f) => f.enabled).length;
  const disabledCount = flags.filter((f) => !f.enabled).length;

  function resetForm() {
    setFormData({ key: '', name: '', description: '', enabled: false, rollout_percentage: 100, environments: ['production'] });
  }

  function openEditModal(flag: FeatureFlag) {
    setEditingFlag(flag);
    setFormData({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
      rollout_percentage: flag.rollout_percentage,
      environments: [...flag.environments],
    });
  }

  function handleSave() {
    if (editingFlag) {
      updateFlag.mutate({ id: editingFlag.id, ...formData });
    } else {
      createFlag.mutate(formData);
    }
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    toast.success('Feature key copied');
  }

  function generateKey(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">Toggle features without deploying</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Flag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Flag className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{flags.length}</p><p className="text-sm text-muted-foreground">Total Flags</p></div>
        </div>
        <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
          <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30"><CheckCircle className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{enabledCount}</p><p className="text-sm text-muted-foreground">Enabled</p></div>
        </div>
        <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
          <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30"><XCircle className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{disabledCount}</p><p className="text-sm text-muted-foreground">Disabled</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search flags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={envFilter}
          onChange={(e) => setEnvFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
      </div>

      {/* Flags List */}
      {filteredFlags.length === 0 ? (
        <div className="p-12 rounded-xl border bg-card text-center">
          <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No feature flags found</p>
          <p className="text-sm text-muted-foreground">Create one to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFlags.map((flag) => (
            <div key={flag.id} className="p-5 rounded-xl border bg-card">
              <div className="flex items-start gap-4">
                {/* Toggle */}
                <button
                  onClick={() => toggleFlag.mutate({ id: flag.id, enabled: !flag.enabled })}
                  disabled={toggleFlag.isPending}
                  className="mt-0.5 shrink-0"
                >
                  {flag.enabled ? (
                    <ToggleRight className="h-8 w-8 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{flag.name}</h3>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      flag.enabled
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {flag.enabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{flag.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <button onClick={() => copyKey(flag.key)} className="flex items-center gap-1 font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80" title="Click to copy">
                      <Code className="h-3 w-3" />
                      {flag.key}
                      <Copy className="h-3 w-3" />
                    </button>
                    {flag.rollout_percentage < 100 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {flag.rollout_percentage}% rollout
                      </span>
                    )}
                    <div className="flex gap-1">
                      {flag.environments.map((env) => (
                        <span key={env} className={cn(
                          'px-1.5 py-0.5 rounded text-xs',
                          env === 'production' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          env === 'staging' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}>
                          {env}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(flag.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEditModal(flag)} className="p-2 hover:bg-muted rounded-lg">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete flag "${flag.name}"?`)) deleteFlag.mutate(flag.id);
                    }}
                    className="p-2 hover:bg-muted rounded-lg text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingFlag) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowCreateModal(false); setEditingFlag(null); }}>
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData((f) => ({ ...f, name, key: editingFlag ? f.key : generateKey(name) }));
                }}
                className="w-full px-4 py-2 border rounded-lg bg-background"
                placeholder="e.g. New Player UI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Key</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData((f) => ({ ...f, key: e.target.value }))}
                disabled={!!editingFlag}
                className="w-full px-4 py-2 border rounded-lg bg-background font-mono text-sm disabled:opacity-60"
                placeholder="new_player_ui"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg bg-background resize-none"
                rows={2}
                placeholder="What this flag controls..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rollout Percentage</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={formData.rollout_percentage}
                  onChange={(e) => setFormData((f) => ({ ...f, rollout_percentage: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">{formData.rollout_percentage}%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Environments</label>
              <div className="flex gap-3">
                {['production', 'staging', 'development'].map((env) => (
                  <label key={env} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.environments.includes(env)}
                      onChange={() =>
                        setFormData((f) => ({
                          ...f,
                          environments: f.environments.includes(env)
                            ? f.environments.filter((e) => e !== env)
                            : [...f.environments, env],
                        }))
                      }
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{env}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Enabled</span>
              <button
                onClick={() => setFormData((f) => ({ ...f, enabled: !f.enabled }))}
                className="shrink-0"
              >
                {formData.enabled ? (
                  <ToggleRight className="h-7 w-7 text-green-600" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                )}
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowCreateModal(false); setEditingFlag(null); }}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.key.trim() || !formData.name.trim() || createFlag.isPending || updateFlag.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {(createFlag.isPending || updateFlag.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                {editingFlag ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
