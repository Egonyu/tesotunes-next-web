'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, ToggleLeft, ToggleRight, Plus, Trash2, ChevronUp,
  ChevronDown, Volume2, Monitor, Smartphone, Save, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAdPlacement, useUpdateAdPlacement, useAssignAdToZone,
  useUpdateAssignment, useRemoveAssignment, useAdminAdsList,
  type AdAssignment,
} from '@/hooks/useAdminAds';

export default function AdPlacementDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const { data: zone, isLoading } = useAdPlacement(key);
  const update = useUpdateAdPlacement(key);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(false);

  if (isLoading || !zone) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleToggleEnabled = () => update.mutate({ is_enabled: !zone.is_enabled });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/ad-placements" className="p-1.5 border rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {zone.is_audio && <Volume2 className="w-4 h-4 text-muted-foreground" />}
            {zone.device_type === 'desktop' ? <Monitor className="w-4 h-4 text-muted-foreground" /> : <Smartphone className="w-4 h-4 text-muted-foreground" />}
            <h1 className="text-xl font-bold">{zone.label}</h1>
          </div>
          <code className="text-xs text-muted-foreground font-mono">{zone.placement_key}</code>
        </div>
        <button
          onClick={handleToggleEnabled}
          disabled={update.isPending}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
        >
          {zone.is_enabled
            ? <><ToggleRight className="w-4 h-4 text-green-500" /> Enabled</>
            : <><ToggleLeft className="w-4 h-4 text-muted-foreground" /> Disabled</>}
        </button>
      </div>

      {/* Zone config + targeting */}
      <ZoneConfigPanel zone={zone} onSave={(data) => update.mutate(data)} saving={update.isPending} />

      {/* Assignments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Assigned Ads ({zone.assignments?.length ?? 0})</h2>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Assign Ad
          </button>
        </div>

        {(!zone.assignments || zone.assignments.length === 0) ? (
          <div className="border rounded-xl py-12 text-center text-muted-foreground">
            <p className="text-sm">No ads assigned to this zone yet.</p>
            <button onClick={() => setShowAssignModal(true)} className="mt-2 text-sm text-primary hover:underline">
              Assign the first ad
            </button>
          </div>
        ) : (
          <div className="border rounded-xl divide-y overflow-hidden">
            {zone.assignments.map((a) => (
              <AssignmentRow key={a.id} assignment={a} placementKey={key} />
            ))}
          </div>
        )}
      </div>

      {/* Assign modal */}
      {showAssignModal && (
        <AssignAdModal
          placementKey={key}
          existingAdIds={zone.assignments?.map((a) => a.ad_id) ?? []}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
}

function ZoneConfigPanel({ zone, onSave, saving }: { zone: ReturnType<typeof useAdPlacement>['data'] & object; onSave: (d: Record<string, unknown>) => void; saving: boolean }) {
  const [form, setForm] = useState({
    frequency_cap_per_day: zone?.frequency_cap_per_day ?? 5,
    max_ads_per_page: zone?.max_ads_per_page ?? 1,
    target_tiers: (zone?.target_tiers ?? []).join(', '),
    notes: zone?.notes ?? '',
  });

  const handleSave = () => {
    onSave({
      frequency_cap_per_day: Number(form.frequency_cap_per_day),
      max_ads_per_page: Number(form.max_ads_per_page),
      target_tiers: form.target_tiers ? form.target_tiers.split(',').map((t) => t.trim()).filter(Boolean) : null,
      notes: form.notes || null,
    });
  };

  return (
    <div className="border rounded-xl p-4 space-y-4">
      <h2 className="font-semibold text-sm">Zone Configuration</h2>
      {zone?.description && <p className="text-sm text-muted-foreground">{zone.description}</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Freq. cap / day">
          <input
            type="number" min={0} max={100} value={form.frequency_cap_per_day}
            onChange={(e) => setForm((f) => ({ ...f, frequency_cap_per_day: Number(e.target.value) }))}
            className="w-full px-2 py-1 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none"
          />
        </Field>
        <Field label="Max ads/page">
          <input
            type="number" min={1} max={10} value={form.max_ads_per_page}
            onChange={(e) => setForm((f) => ({ ...f, max_ads_per_page: Number(e.target.value) }))}
            className="w-full px-2 py-1 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none"
          />
        </Field>
        <Field label="Target tiers (CSV)">
          <input
            type="text" value={form.target_tiers}
            placeholder="free, premium_basic"
            onChange={(e) => setForm((f) => ({ ...f, target_tiers: e.target.value }))}
            className="w-full px-2 py-1 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none"
          />
        </Field>
        <Field label="Allowed formats">
          <div className="text-sm text-muted-foreground py-1">{zone?.allowed_formats?.join(', ')}</div>
        </Field>
      </div>
      <Field label="Admin notes">
        <textarea
          rows={2} value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full px-2 py-1 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none resize-none"
        />
      </Field>
      <button
        onClick={handleSave} disabled={saving}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        Save Config
      </button>
    </div>
  );
}

function AssignmentRow({ assignment, placementKey }: { assignment: AdAssignment; placementKey: string }) {
  const remove = useRemoveAssignment(placementKey);
  const updateA = useUpdateAssignment(placementKey);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full shrink-0', assignment.is_active ? 'bg-green-500' : 'bg-muted-foreground')} />
          <span className="font-medium text-sm truncate">{assignment.ad_title ?? `Ad #${assignment.ad_id}`}</span>
          {assignment.ad_type && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{assignment.ad_type}</span>
          )}
        </div>
        {assignment.advertiser && (
          <div className="text-xs text-muted-foreground ml-4">{assignment.advertiser}</div>
        )}
      </div>

      {/* Priority + Weight controls */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex flex-col items-center">
          <span className="text-[10px] mb-0.5">Priority</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => updateA.mutate({ assignmentId: assignment.id, priority: Math.max(1, assignment.priority - 1) })}
              className="p-0.5 hover:bg-muted rounded"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-medium text-foreground">{assignment.priority}</span>
            <button
              onClick={() => updateA.mutate({ assignmentId: assignment.id, priority: Math.min(10, assignment.priority + 1) })}
              className="p-0.5 hover:bg-muted rounded"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] mb-0.5">Weight</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => updateA.mutate({ assignmentId: assignment.id, weight: Math.max(1, assignment.weight - 5) })}
              className="p-0.5 hover:bg-muted rounded"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
            <span className="w-6 text-center font-medium text-foreground">{assignment.weight}</span>
            <button
              onClick={() => updateA.mutate({ assignmentId: assignment.id, weight: Math.min(100, assignment.weight + 5) })}
              className="p-0.5 hover:bg-muted rounded"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Active toggle */}
      <button
        onClick={() => updateA.mutate({ assignmentId: assignment.id, is_active: !assignment.is_active })}
        className="shrink-0"
        title={assignment.is_active ? 'Pause assignment' : 'Activate assignment'}
      >
        {assignment.is_active
          ? <ToggleRight className="w-5 h-5 text-green-500" />
          : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
      </button>

      {/* Remove */}
      <button
        onClick={() => { if (confirm('Remove this ad from zone?')) remove.mutate(assignment.id); }}
        disabled={remove.isPending}
        className="p-1.5 rounded hover:bg-muted transition-colors text-destructive"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AssignAdModal({ placementKey, existingAdIds, onClose }: { placementKey: string; existingAdIds: number[]; onClose: () => void }) {
  const { data } = useAdminAdsList({ status: 'active' });
  const assign = useAssignAdToZone(placementKey);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [priority, setPriority] = useState(5);
  const [weight, setWeight] = useState(10);

  const availableAds = (data?.data ?? []).filter((ad) => !existingAdIds.includes(ad.id));

  const handleAssign = () => {
    if (!selectedId) return;
    assign.mutate({ ad_id: selectedId, priority, weight }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Assign Ad to Zone</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Select ad</label>
          <select
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">-- choose an active ad --</option>
            {availableAds.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.title} ({ad.type})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority (1–10)">
            <input type="number" min={1} max={10} value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none"
            />
          </Field>
          <Field label="Weight (1–100)">
            <input type="number" min={1} max={100} value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button
            onClick={handleAssign}
            disabled={!selectedId || assign.isPending}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {assign.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
