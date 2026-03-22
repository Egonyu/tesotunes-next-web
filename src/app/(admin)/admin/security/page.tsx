'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import {
  AlertTriangle,
  Ban,
  Bell,
  Globe,
  Loader2,
  Mail,
  Search,
  Shield,
  Wallet,
} from 'lucide-react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'open' | 'investigating' | 'resolved';
type EventType = 'auth' | 'policy' | 'network' | 'rate-limit';

type SecurityEvent = {
  id: number;
  severity: Severity;
  event: string;
  userOrIp: string;
  location: string;
  threatScore: number;
  status: Status;
  type: EventType;
  time: string;
};

type AuditLog = {
  id: number;
  action: string;
  resource_type: string;
  description: string;
  ip_address: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  } | null;
};

type AuditLogsResponse = {
  data: AuditLog[];
};

const securityEvents: SecurityEvent[] = [
  {
    id: 1,
    severity: 'critical',
    event: 'Brute-force attempt against admin login',
    userOrIp: '185.220.101.45',
    location: 'Frankfurt, DE',
    threatScore: 96,
    status: 'open',
    type: 'auth',
    time: '2026-03-22T08:42:00Z',
  },
  {
    id: 2,
    severity: 'high',
    event: 'Suspicious token replay pattern',
    userOrIp: 'ops@tesotunes.com',
    location: 'Kampala, UG',
    threatScore: 81,
    status: 'investigating',
    type: 'auth',
    time: '2026-03-22T07:18:00Z',
  },
  {
    id: 3,
    severity: 'medium',
    event: 'VPN datacenter access to payout endpoint',
    userOrIp: '102.129.45.9',
    location: 'Nairobi, KE',
    threatScore: 67,
    status: 'open',
    type: 'network',
    time: '2026-03-22T06:30:00Z',
  },
  {
    id: 4,
    severity: 'high',
    event: 'Rate limit breach from single ASN',
    userOrIp: '45.155.204.120',
    location: 'Amsterdam, NL',
    threatScore: 84,
    status: 'investigating',
    type: 'rate-limit',
    time: '2026-03-22T05:54:00Z',
  },
  {
    id: 5,
    severity: 'low',
    event: 'Geo policy check passed with challenge',
    userOrIp: 'artist.kato@tesotunes.com',
    location: 'Mbarara, UG',
    threatScore: 22,
    status: 'resolved',
    type: 'policy',
    time: '2026-03-22T04:17:00Z',
  },
  {
    id: 6,
    severity: 'critical',
    event: 'Credential stuffing against API gateway',
    userOrIp: '193.142.146.32',
    location: 'Warsaw, PL',
    threatScore: 93,
    status: 'open',
    type: 'auth',
    time: '2026-03-21T23:06:00Z',
  },
];

const summaryCardMeta = [
  {
    key: 'critical' as const,
    title: 'Critical Alerts',
    color: 'border-red-500 text-red-600',
    iconBg: 'bg-red-100 text-red-500',
    icon: AlertTriangle,
  },
  {
    key: 'high' as const,
    title: 'High Severity',
    color: 'border-orange-500 text-orange-600',
    iconBg: 'bg-orange-100 text-orange-500',
    icon: AlertTriangle,
  },
  {
    key: 'new24h' as const,
    title: 'New (24h)',
    color: 'border-blue-500 text-blue-600',
    iconBg: 'bg-blue-100 text-blue-500',
    icon: Bell,
  },
  {
    key: 'vpnDatacenter' as const,
    title: 'VPN/Datacenter',
    color: 'border-violet-500 text-violet-600',
    iconBg: 'bg-violet-100 text-violet-500',
    icon: Wallet,
  },
  {
    key: 'activeBlocks' as const,
    title: 'Active Blocks',
    color: 'border-slate-500 text-slate-700',
    iconBg: 'bg-slate-200 text-slate-500',
    icon: Ban,
  },
];

function badgeClassForSeverity(severity: Severity) {
  if (severity === 'critical') return 'bg-red-100 text-red-700';
  if (severity === 'high') return 'bg-orange-100 text-orange-700';
  if (severity === 'medium') return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-700';
}

function badgeClassForStatus(status: Status) {
  if (status === 'open') return 'bg-red-100 text-red-700';
  if (status === 'investigating') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

function toTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatEventTime(value: string): string {
  const ts = toTimestamp(value);
  if (ts === 0) return '--';

  return new Date(ts).toLocaleString('en-UG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Kampala',
  });
}

function deriveSeverityFromLog(log: AuditLog): Severity {
  const text = `${log.action} ${log.description}`.toLowerCase();
  if (text.includes('failed') || text.includes('unauthorized') || text.includes('blocked')) return 'critical';
  if (text.includes('delete') || text.includes('ban') || text.includes('suspend')) return 'high';
  if (text.includes('update') || text.includes('permission') || text.includes('role')) return 'medium';
  return 'low';
}

function deriveEventTypeFromLog(log: AuditLog): EventType {
  const text = `${log.action} ${log.resource_type} ${log.description}`.toLowerCase();
  if (text.includes('login') || text.includes('logout') || text.includes('auth')) return 'auth';
  if (text.includes('rate') || text.includes('throttle') || text.includes('limit')) return 'rate-limit';
  if (text.includes('network') || text.includes('ip')) return 'network';
  return 'policy';
}

function deriveStatusFromSeverityAndTime(severity: Severity, createdAt: string): Status {
  const isRecent = Date.now() - toTimestamp(createdAt) <= 24 * 60 * 60 * 1000;
  if (severity === 'critical' || (severity === 'high' && isRecent)) return 'open';
  if (severity === 'high' || severity === 'medium') return 'investigating';
  return 'resolved';
}

function deriveThreatScore(severity: Severity, type: EventType): number {
  const severityBase: Record<Severity, number> = {
    critical: 92,
    high: 78,
    medium: 58,
    low: 24,
  };

  if (type === 'auth') return Math.min(99, severityBase[severity] + 4);
  if (type === 'rate-limit') return Math.min(99, severityBase[severity] + 2);
  return severityBase[severity];
}

function mapAuditLogToSecurityEvent(log: AuditLog): SecurityEvent {
  const severity = deriveSeverityFromLog(log);
  const type = deriveEventTypeFromLog(log);
  const status = deriveStatusFromSeverityAndTime(severity, log.created_at);
  const actor = log.user?.email || log.user?.name || log.ip_address || 'Unknown actor';

  return {
    id: log.id,
    severity,
    event: log.description || `${log.action} ${log.resource_type}`,
    userOrIp: actor,
    location: 'Unresolved location',
    threatScore: deriveThreatScore(severity, type),
    status,
    type,
    time: log.created_at,
  };
}

export default function SecurityDashboardPage() {
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const { data: liveLogsData, isLoading: liveLogsLoading, isError: liveLogsError } = useQuery({
    queryKey: ['admin', 'security', 'live-audit-logs'],
    queryFn: () => apiGet<AuditLogsResponse>('/admin/audit-logs?per_page=100'),
    staleTime: 60_000,
    retry: false,
  });

  const [searchDraft, setSearchDraft] = useState('');
  const [severityDraft, setSeverityDraft] = useState<'all' | Severity>('all');
  const [statusDraft, setStatusDraft] = useState<'all' | Status>('all');
  const [typeDraft, setTypeDraft] = useState<'all' | EventType>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all');

  const sourceEvents = useMemo(() => {
    const liveEvents = (liveLogsData?.data ?? []).map(mapAuditLogToSecurityEvent);
    if (liveLogsError) return securityEvents;
    return liveEvents;
  }, [liveLogsData, liveLogsError]);

  const isLiveData = (liveLogsData?.data?.length ?? 0) > 0;

  const filteredEvents = useMemo(() => {
    return sourceEvents.filter((event) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const inSearch =
        !normalizedSearch ||
        event.event.toLowerCase().includes(normalizedSearch) ||
        event.userOrIp.toLowerCase().includes(normalizedSearch) ||
        event.location.toLowerCase().includes(normalizedSearch);

      const severityMatch = severityFilter === 'all' || event.severity === severityFilter;
      const statusMatch = statusFilter === 'all' || event.status === statusFilter;
      const typeMatch = typeFilter === 'all' || event.type === typeFilter;

      return inSearch && severityMatch && statusMatch && typeMatch;
    }).sort((a, b) => toTimestamp(b.time) - toTimestamp(a.time));
  }, [sourceEvents, searchTerm, severityFilter, statusFilter, typeFilter]);

  const summaryCards = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const unresolved = sourceEvents.filter((event) => event.status !== 'resolved');

    const criticalCount = unresolved.filter((event) => event.severity === 'critical').length;
    const highSeverityCount = unresolved.filter(
      (event) => event.severity === 'critical' || event.severity === 'high'
    ).length;
    const new24h = sourceEvents.filter((event) => now - toTimestamp(event.time) <= oneDayMs).length;
    const new24hUnresolved = unresolved.filter((event) => now - toTimestamp(event.time) <= oneDayMs).length;
    const vpnDatacenterCount = unresolved.filter((event) => event.type === 'network').length;
    const activeBlockedIps = 0;
    const activeBlockedDomains = 0;

    return summaryCardMeta.map((card) => {
      if (card.key === 'critical') {
        return { ...card, value: criticalCount, subtitle: 'Needs immediate action' };
      }
      if (card.key === 'high') {
        return { ...card, value: highSeverityCount, subtitle: 'Review soon' };
      }
      if (card.key === 'new24h') {
        return { ...card, value: new24h, subtitle: `${new24hUnresolved} unresolved` };
      }
      if (card.key === 'vpnDatacenter') {
        return { ...card, value: vpnDatacenterCount, subtitle: 'Last 24 hours' };
      }

      return {
        ...card,
        value: activeBlockedIps + activeBlockedDomains,
        subtitle: `${activeBlockedIps} IPs, ${activeBlockedDomains} domains`,
      };
    });
  }, [sourceEvents]);

  function resetFilters() {
    setSearchDraft('');
    setSeverityDraft('all');
    setStatusDraft('all');
    setTypeDraft('all');
    setSearchTerm('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  }

  function applyFilters() {
    setSearchTerm(searchDraft.trim());
    setSeverityFilter(severityDraft);
    setStatusFilter(statusDraft);
    setTypeFilter(typeDraft);
  }

  function focusSearchWithPreset(presetType: EventType) {
    setTypeDraft(presetType);
    setTypeFilter(presetType);
    searchInputRef.current?.focus();
  }

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
          Security Dashboard (Current)
        </button>
        <Link
          href="/admin/audit-logs"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          Audit Logs
        </Link>
        <Link
          href="/admin/system"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          Geo Access Control
        </Link>
      </div>

      <section className="rounded-2xl border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-2 text-red-500">
                <Shield className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Security Monitoring Center</h1>
            </div>
            <p className="mt-2 text-muted-foreground">
              Threat detection, IP analysis, and user security management
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {isLiveData
                ? 'Live mode: derived from admin audit logs and access metadata.'
                : liveLogsError
                  ? 'Preview mode: live feed unavailable, showing representative fallback data.'
                  : 'Live mode: connected, currently no security events from audit logs.'}
            </p>
            {liveLogsLoading && (
              <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Checking live security feed...
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => focusSearchWithPreset('network')}
              className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 font-semibold text-foreground hover:bg-muted/80"
            >
              <Ban className="h-4 w-4" />
              Blocked IPs
            </button>
            <button
              onClick={() => focusSearchWithPreset('policy')}
              className="inline-flex items-center gap-2 rounded-full bg-muted px-6 py-3 font-semibold text-foreground hover:bg-muted/80"
            >
              <Mail className="h-4 w-4" />
              Blocked Domains
            </button>
            <button
              onClick={() => searchInputRef.current?.focus()}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
            >
              <Search className="h-4 w-4" />
              Analyze IP
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title} className={`rounded-2xl border-2 p-4 ${card.color}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl font-semibold text-slate-600">{card.title}</p>
                    <p className="mt-2 text-5xl font-bold leading-none">{card.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-3 text-base text-slate-500">{card.subtitle}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <label htmlFor="security-search" className="sr-only">Search events</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              id="security-search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              type="text"
              placeholder="Search IP, email, or title..."
              className="h-12 w-full rounded-xl border bg-background pl-10 pr-4 text-sm"
            />
          </div>

          <label htmlFor="severity-filter" className="sr-only">Filter by severity</label>
          <select
            id="severity-filter"
            value={severityDraft}
            onChange={(e) => setSeverityDraft(e.target.value as 'all' | Severity)}
            className="h-12 min-w-[180px] rounded-xl border bg-background px-4"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <select
            id="status-filter"
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value as 'all' | Status)}
            className="h-12 min-w-[180px] rounded-xl border bg-background px-4"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>

          <label htmlFor="type-filter" className="sr-only">Filter by event type</label>
          <select
            id="type-filter"
            value={typeDraft}
            onChange={(e) => setTypeDraft(e.target.value as 'all' | EventType)}
            className="h-12 min-w-[180px] rounded-xl border bg-background px-4"
          >
            <option value="all">All Types</option>
            <option value="auth">Authentication</option>
            <option value="network">Network</option>
            <option value="policy">Policy</option>
            <option value="rate-limit">Rate Limit</option>
          </select>

          <button
            onClick={applyFilters}
            className="h-12 rounded-full bg-emerald-500 px-10 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Filter
          </button>
          <button
            onClick={resetFilters}
            className="h-12 rounded-full bg-slate-200 px-10 text-sm font-semibold text-slate-800 hover:bg-slate-300"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">User / IP</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Threat Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-muted-foreground" colSpan={8}>
                    No events match your current filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b text-sm hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badgeClassForSeverity(event.severity)}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{event.event}</td>
                    <td className="px-4 py-3 text-muted-foreground">{event.userOrIp}</td>
                    <td className="px-4 py-3 text-muted-foreground">{event.location}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-12 justify-center rounded-md bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                        {event.threatScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badgeClassForStatus(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatEventTime(event.time)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/audit-logs?search=${encodeURIComponent(event.userOrIp)}`}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
