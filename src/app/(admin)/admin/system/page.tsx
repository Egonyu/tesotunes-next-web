'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  HardDrive,
  Loader2,
  RefreshCw,
  Server,
  Shield,
  Wrench,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ComponentStatus = 'healthy' | 'warning' | 'degraded' | 'critical' | 'failed';

interface SystemHealthResponse {
  success: boolean;
  data: {
    overall_score: number;
    status: string;
    deployment: {
      app_name: string;
      environment: string;
      laravel_version: string;
      php_version: string;
      git_commit: string;
      git_branch: string;
      uptime: string;
    };
    components: Record<string, {
      status: ComponentStatus;
      issues?: string[];
      metrics?: Record<string, unknown>;
      healthy?: boolean;
      message?: string;
      connection?: string;
      pending_jobs?: number;
    }>;
    backup: {
      total_backups: number;
      total_size: string;
      last_backup: string | null;
      last_backup_file: string | null;
      auto_enabled: boolean;
      schedule: string;
      retention_days: number;
      disk: string;
      path: string;
      healthy: boolean;
    };
    alerts: Array<{
      level: 'critical' | 'warning' | 'info';
      title: string;
      message: string;
      action?: string;
    }>;
    recommendations: Array<{
      priority: string;
      title: string;
      description: string;
      impact: string;
    }>;
    timestamp: string;
  };
}

interface HealthTestsResponse {
  success: boolean;
  data: Array<{
    name: string;
    status: boolean;
    message: string;
  }>;
}

const actionLabels: Record<string, string> = {
  'queue:restart': 'Restart Queues',
  'cache:clear': 'Clear Cache',
  'optimize:clear': 'Clear Optimizations',
  'backup:run-db': 'Run DB Backup',
};

const componentIcons = {
  database: Database,
  storage: HardDrive,
  cache: Activity,
  queue: RefreshCw,
  application: Shield,
} as const;

function statusTone(status: string) {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'warning':
    case 'degraded':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'critical':
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export default function AdminSystemPage() {
  const queryClient = useQueryClient();

  const { data: healthResponse, isLoading: loadingHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: () => apiGet<SystemHealthResponse>('/admin/system/health'),
    refetchInterval: 30000,
  });

  const { data: testsResponse, isLoading: loadingTests, refetch: refetchTests } = useQuery({
    queryKey: ['admin-system-tests'],
    queryFn: () => apiGet<HealthTestsResponse>('/admin/system/tests'),
    staleTime: 30000,
  });

  const actionMutation = useMutation({
    mutationFn: (command: string) => apiPost<{ success: boolean; message: string }>('/admin/system/actions', { command }),
    onSuccess: (response) => {
      toast.success(response.message || 'Action completed');
      queryClient.invalidateQueries({ queryKey: ['admin-system-health'] });
      queryClient.invalidateQueries({ queryKey: ['admin-system-tests'] });
    },
    onError: () => {
      toast.error('System action failed');
    },
  });

  const health = healthResponse?.data;
  const tests = testsResponse?.data ?? [];

  const componentEntries = useMemo(
    () => Object.entries(health?.components ?? {}),
    [health?.components]
  );

  if (loadingHealth && !health) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!health) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
        System health data is unavailable right now.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health</h1>
          <p className="text-muted-foreground">
            Live production health, queues, backups, and safe maintenance controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn('border px-3 py-1 text-sm capitalize', statusTone(health.status))}>
            {health.status}
          </Badge>
          <button
            onClick={() => {
              refetchHealth();
              refetchTests();
            }}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Health Score" value={`${health.overall_score}%`} icon={Activity} />
        <MetricCard title="Environment" value={health.deployment.environment} icon={Server} />
        <MetricCard title="Queue Driver" value={String(health.components.queue?.metrics?.driver ?? 'unknown')} icon={RefreshCw} />
        <MetricCard title="Backups" value={`${health.backup.total_backups}`} subtitle={health.backup.total_size} icon={HardDrive} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Components</h2>
              <p className="text-sm text-muted-foreground">Database, cache, queue, storage, and application status.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {componentEntries.map(([key, component]) => {
              const Icon = componentIcons[key as keyof typeof componentIcons] ?? Server;
              const metrics = component.metrics ?? {};
              return (
                <div key={key} className="rounded-2xl border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-muted p-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">{key}</h3>
                        <p className="text-xs text-muted-foreground">{component.message ?? 'Live service snapshot'}</p>
                      </div>
                    </div>
                    <Badge className={cn('border capitalize', statusTone(component.status))}>{component.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    {Object.entries(metrics).slice(0, 5).map(([metricKey, metricValue]) => (
                      <div key={metricKey} className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">{metricKey.replaceAll('_', ' ')}</span>
                        <span className="font-medium text-right">
                          {Array.isArray(metricValue) ? `${metricValue.length} items` : String(metricValue)}
                        </span>
                      </div>
                    ))}
                    {(component.issues ?? []).slice(0, 3).map((issue) => (
                      <div key={issue} className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Backup Status</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Healthy" value={health.backup.healthy ? 'Yes' : 'Needs attention'} />
              <Row label="Auto backups" value={health.backup.auto_enabled ? 'Enabled' : 'Disabled'} />
              <Row label="Schedule" value={health.backup.schedule} />
              <Row label="Disk" value={health.backup.disk} />
              <Row label="Path" value={health.backup.path} />
              <Row label="Last backup" value={health.backup.last_backup ?? 'None yet'} />
              <Row label="Retention" value={`${health.backup.retention_days} days`} />
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Maintenance</h2>
            <div className="mt-4 grid gap-3">
              {Object.entries(actionLabels).map(([command, label]) => (
                <button
                  key={command}
                  onClick={() => actionMutation.mutate(command)}
                  disabled={actionMutation.isPending}
                  className="inline-flex items-center justify-between rounded-2xl border px-4 py-3 text-left hover:bg-muted disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2 font-medium">
                    <Wrench className="h-4 w-4" />
                    {label}
                  </span>
                  {actionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <div className="mt-4 space-y-3">
            {health.alerts.length === 0 ? (
              <EmptyState icon={CheckCircle2} text="No active system alerts." />
            ) : (
              health.alerts.map((alert, index) => (
                <div key={`${alert.title}-${index}`} className="rounded-2xl border p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.message}</div>
                      {alert.action ? <div className="mt-1 text-xs text-muted-foreground">{alert.action}</div> : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Health Tests</h2>
          <div className="mt-4 space-y-3">
            {loadingTests ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Running checks...
              </div>
            ) : tests.length === 0 ? (
              <EmptyState icon={Activity} text="No health test data returned." />
            ) : (
              tests.map((test) => (
                <div key={test.name} className="flex items-center justify-between rounded-2xl border px-4 py-3">
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-muted-foreground">{test.message}</div>
                  </div>
                  <Badge className={cn('border', test.status ? statusTone('healthy') : statusTone('critical'))}>
                    {test.status ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Deployment</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
          <Row label="App" value={health.deployment.app_name} />
          <Row label="Branch" value={health.deployment.git_branch} />
          <Row label="Commit" value={health.deployment.git_commit} />
          <Row label="Uptime" value={health.deployment.uptime} />
          <Row label="Laravel" value={health.deployment.laravel_version} />
          <Row label="PHP" value={health.deployment.php_version} />
          <Row label="Updated" value={new Date(health.timestamp).toLocaleString()} />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-3xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="rounded-2xl bg-muted p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Activity; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      <Icon className="mx-auto mb-3 h-5 w-5" />
      {text}
    </div>
  );
}
