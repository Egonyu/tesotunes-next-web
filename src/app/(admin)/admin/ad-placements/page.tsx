'use client';

import Link from 'next/link';
import { Monitor, Smartphone, Volume2, ToggleLeft, ToggleRight, Loader2, BarChart3, ChevronRight, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdPlacements, useUpdateAdPlacement, type AdPlacementConfig } from '@/hooks/useAdminAds';

export default function AdPlacementsPage() {
  const { data: zones, isLoading } = useAdPlacements();
  const update = useUpdateAdPlacement('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const webZones    = zones?.filter((z) => z.device_type !== 'mobile') ?? [];
  const mobileZones = zones?.filter((z) => z.device_type === 'mobile') ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Ad Placement Zones</h1>
            <p className="text-sm text-muted-foreground">
              Enable/disable zones and control which ads run where
            </p>
          </div>
        </div>
        <Link href="/admin/ads" className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">
          <Megaphone className="w-4 h-4" /> Ad Library
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Zones" value={zones?.length ?? 0} />
        <StatCard label="Enabled" value={zones?.filter((z) => z.is_enabled).length ?? 0} accent="green" />
        <StatCard label="With Active Ads" value={zones?.filter((z) => (z.active_assignments_count ?? 0) > 0).length ?? 0} accent="blue" />
      </div>

      {/* Web Zones */}
      <Section title="Web Placements" icon={<Monitor className="w-4 h-4" />} count={webZones.length}>
        <ZoneGrid zones={webZones} />
      </Section>

      {/* Mobile Zones */}
      <Section title="Mobile Placements" icon={<Smartphone className="w-4 h-4" />} count={mobileZones.length}>
        <ZoneGrid zones={mobileZones} />
      </Section>
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">{count}</span>
      </div>
      {children}
    </div>
  );
}

function ZoneGrid({ zones }: { zones: AdPlacementConfig[] }) {
  const updateMutation = useUpdateAdPlacement('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {zones.map((zone) => (
        <ZoneCard key={zone.placement_key} zone={zone} />
      ))}
    </div>
  );
}

function ZoneCard({ zone }: { zone: AdPlacementConfig }) {
  const update = useUpdateAdPlacement(zone.placement_key);

  const handleToggle = () => {
    update.mutate({ is_enabled: !zone.is_enabled });
  };

  return (
    <div className={cn(
      'border rounded-xl p-4 space-y-3 transition-colors',
      zone.is_enabled ? 'bg-background' : 'bg-muted/30 opacity-70'
    )}>
      {/* Zone header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {zone.is_audio && <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            <span className="font-medium text-sm truncate">{zone.label}</span>
          </div>
          <code className="text-[10px] text-muted-foreground font-mono">{zone.placement_key}</code>
        </div>
        <button
          onClick={handleToggle}
          disabled={update.isPending}
          className="shrink-0 transition-colors"
          title={zone.is_enabled ? 'Disable zone' : 'Enable zone'}
        >
          {zone.is_enabled
            ? <ToggleRight className="w-6 h-6 text-green-500" />
            : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{zone.active_assignments_count ?? 0}</span> active ads
        </span>
        <span>
          <span className="font-medium text-foreground">{zone.impressions_7d.toLocaleString()}</span> impr/7d
        </span>
        {zone.dimensions_width && (
          <span className="font-mono">{zone.dimensions_width}×{zone.dimensions_height}</span>
        )}
      </div>

      {/* Targeting chips */}
      <div className="flex flex-wrap gap-1">
        {zone.target_tiers?.map((t) => (
          <span key={t} className="px-1.5 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{t}</span>
        ))}
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">cap: {zone.frequency_cap_per_day}/day</span>
      </div>

      {/* Link to detail */}
      <Link
        href={`/admin/ad-placements/${zone.placement_key}`}
        className="flex items-center justify-between text-xs text-primary hover:underline"
      >
        Manage zone <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: 'green' | 'blue' }) {
  return (
    <div className="border rounded-xl p-4">
      <div className={cn(
        'text-2xl font-bold',
        accent === 'green' && 'text-green-600',
        accent === 'blue' && 'text-blue-600',
      )}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
