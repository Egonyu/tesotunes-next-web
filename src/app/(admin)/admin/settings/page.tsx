'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BadgeDollarSign,
  Bell,
  CalendarDays,
  Check,
  CreditCard,
  Database,
  Eye,
  Loader2,
  Palette,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Smartphone,
  Star,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';
import { normalizePlatformSettings, type PlatformSettings } from '@/lib/platform-settings';
import { cn } from '@/lib/utils';
import { InitialsAvatar, SafeImage } from '@/components/ui/safe-image';

interface SettingsResponse {
  data: Partial<PlatformSettings>;
}

interface NotificationHealthResponse {
  data: {
    mail: {
      mailer: string;
      from_address_configured: boolean;
      smtp_host_configured: boolean;
      smtp_port_configured: boolean;
    };
    queue: {
      connection: string;
      is_async: boolean;
      pending_jobs: number | null;
      failed_jobs: number | null;
    };
    push: {
      active_device_tokens: number | null;
    };
    notifications: {
      sent_last_24h: number;
      unread_total: number;
    };
    checks: {
      mail_ready: boolean;
      queue_ready: boolean;
      push_ready: boolean;
    };
  };
}

type EnvironmentFieldValue = string | number | boolean;
type EnvironmentDraftValue = EnvironmentFieldValue | '';

interface EnvironmentField {
  key: string;
  label: string;
  description: string;
  type: 'string' | 'boolean' | 'integer' | 'number';
  secret: boolean;
  configured: boolean;
  value: EnvironmentFieldValue | null;
  options?: string[];
}

interface EnvironmentGroup {
  id: string;
  label: string;
  description: string;
  fields: EnvironmentField[];
}

interface EnvironmentSettingsResponse {
  data: {
    scope: 'api';
    file: string;
    restart_required: boolean;
    frontend_note: string;
    groups: EnvironmentGroup[];
  };
}

type SectionId =
  | 'general'
  | 'frontend'
  | 'users'
  | 'credits'
  | 'payments'
  | 'notifications'
  | 'mobile'
  | 'security'
  | 'awards'
  | 'events'
  | 'artists'
  | 'operations'
  | 'storage';

type TabMode = 'settings' | 'links' | 'environment' | 'info';

interface TabItem {
  id: string;
  label: string;
  mode: TabMode;
}

interface SectionItem {
  id: SectionId;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  colorClasses: string;
  tabs: TabItem[];
}

interface SurfaceLink {
  href: string;
  label: string;
  description: string;
}

const sections: SectionItem[] = [
  { id: 'general', label: 'General Settings', subtitle: 'Basic configuration', icon: Settings, colorClasses: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300', tabs: [{ id: 'platform', label: 'Platform Info', mode: 'settings' }, { id: 'features', label: 'Features', mode: 'links' }, { id: 'localization', label: 'Localization', mode: 'settings' }, { id: 'maintenance', label: 'Maintenance', mode: 'settings' }] },
  { id: 'frontend', label: 'Frontend Design', subtitle: 'Mobile & desktop layout', icon: Palette, colorClasses: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300', tabs: [{ id: 'branding', label: 'Branding', mode: 'settings' }, { id: 'login', label: 'Login Experience', mode: 'settings' }, { id: 'admin', label: 'Admin Identity', mode: 'settings' }, { id: 'sacco', label: 'SACCO Branding', mode: 'settings' }] },
  { id: 'users', label: 'User Management', subtitle: 'User roles & permissions', icon: Users, colorClasses: 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300', tabs: [{ id: 'registration', label: 'Registration', mode: 'settings' }, { id: 'permissions', label: 'Permissions', mode: 'settings' }, { id: 'restrictions', label: 'Restrictions', mode: 'settings' }, { id: 'moderation', label: 'Moderation', mode: 'settings' }] },
  { id: 'credits', label: 'Credit System', subtitle: 'Rates & transactions', icon: BadgeDollarSign, colorClasses: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300', tabs: [{ id: 'revenue', label: 'Revenue Split', mode: 'settings' }, { id: 'packages', label: 'Credit Packages', mode: 'settings' }, { id: 'subscriptions', label: 'Subscriptions', mode: 'links' }, { id: 'sacco', label: 'SACCO Finance', mode: 'settings' }] },
  { id: 'payments', label: 'Payment Settings', subtitle: 'Mobile Money & API', icon: CreditCard, colorClasses: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300', tabs: [{ id: 'gateway', label: 'Gateway', mode: 'settings' }, { id: 'operations', label: 'Operations', mode: 'settings' }, { id: 'provider', label: 'Provider Notes', mode: 'info' }] },
  { id: 'notifications', label: 'Notifications', subtitle: 'Email & SMS alerts', icon: Bell, colorClasses: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300', tabs: [{ id: 'channels', label: 'Channels', mode: 'settings' }, { id: 'delivery', label: 'Delivery Health', mode: 'settings' }, { id: 'email', label: 'Email Setup', mode: 'settings' }] },
  { id: 'mobile', label: 'Mobile Verification', subtitle: 'SMS verification', icon: Smartphone, colorClasses: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300', tabs: [{ id: 'policy', label: 'Verification Policy', mode: 'settings' }, { id: 'operations', label: 'Operations', mode: 'links' }] },
  { id: 'security', label: 'Security & Auth', subtitle: 'Security, authentication & social login', icon: Shield, colorClasses: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300', tabs: [{ id: 'authentication', label: '2FA & Sessions', mode: 'settings' }, { id: 'password', label: 'Password Policy', mode: 'settings' }, { id: 'access', label: 'Access Control', mode: 'links' }, { id: 'social', label: 'Social Login', mode: 'environment' }] },
  { id: 'awards', label: 'Awards System', subtitle: 'Achievements & badges', icon: Star, colorClasses: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300', tabs: [{ id: 'overview', label: 'Overview', mode: 'links' }, { id: 'operations', label: 'Operations', mode: 'links' }] },
  { id: 'events', label: 'Events & Tickets', subtitle: 'Event management', icon: CalendarDays, colorClasses: 'bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300', tabs: [{ id: 'overview', label: 'Overview', mode: 'links' }, { id: 'commerce', label: 'Commercial Flow', mode: 'links' }] },
  { id: 'artists', label: 'Artist Management', subtitle: 'Artist settings', icon: Users, colorClasses: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300', tabs: [{ id: 'catalog', label: 'Catalog', mode: 'links' }, { id: 'podcasts', label: 'Podcasts', mode: 'links' }, { id: 'featured', label: 'Featured', mode: 'links' }] },
  { id: 'operations', label: 'System Operations', subtitle: 'Health, logs & rollouts', icon: Eye, colorClasses: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200', tabs: [{ id: 'diagnostics', label: 'Diagnostics', mode: 'links' }, { id: 'observability', label: 'Observability', mode: 'links' }, { id: 'access', label: 'Audit & Access', mode: 'links' }, { id: 'rollout', label: 'Rollouts', mode: 'links' }] },
  { id: 'storage', label: 'Storage Settings', subtitle: 'File storage config', icon: Database, colorClasses: 'bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300', tabs: [{ id: 'storage', label: 'Storage', mode: 'settings' }, { id: 'environment', label: 'Environment', mode: 'environment' }] },
];

const defaultActiveTabs: Record<SectionId, string> = {
  general: 'platform',
  frontend: 'branding',
  users: 'registration',
  credits: 'revenue',
  payments: 'gateway',
  notifications: 'channels',
  mobile: 'policy',
  security: 'authentication',
  awards: 'overview',
  events: 'overview',
  artists: 'catalog',
  operations: 'diagnostics',
  storage: 'storage',
};

const sectionLinks: Record<string, SurfaceLink[]> = {
  general_features: [
    { href: '/admin/songs', label: 'Songs', description: 'Manage the streaming catalog and publishing readiness.' },
    { href: '/admin/albums', label: 'Albums', description: 'Control release structures, metadata, and album visibility.' },
    { href: '/admin/store', label: 'Store', description: 'Manage merch, products, and shopping surfaces.' },
    { href: '/admin/forums', label: 'Forums', description: 'Control community participation surfaces.' },
  ],
  users_permissions: [
    { href: '/admin/users', label: 'Users', description: 'Manage user accounts, states, and support actions.' },
    { href: '/admin/roles', label: 'Roles & Permissions', description: 'Adjust admin and staff access control.' },
    { href: '/admin/security', label: 'Security Console', description: 'Inspect live security posture and system protections.' },
  ],
  users_moderation: [
    { href: '/admin/reports', label: 'Reports', description: 'Handle abuse reports and moderation workflows.' },
    { href: '/admin/forums', label: 'Forums', description: 'Control forum moderation and category structure.' },
    { href: '/admin/polls', label: 'Polls', description: 'Manage engagement loops and audience interactions.' },
  ],
  credits_commerce: [
    { href: '/admin/payments', label: 'Payment Operations', description: 'Investigate payment issues and provider health.' },
    { href: '/admin/store', label: 'Store Dashboard', description: 'Manage commerce-facing settings and product operations.' },
    { href: '/admin/store/orders', label: 'Orders', description: 'Review order flow and fulfillment operations.' },
  ],
  credits_subscriptions: [
    { href: '/admin/subscriptions', label: 'Subscriptions', description: 'Manage plans, subscription behavior, and plan visibility.' },
    { href: '/admin/promotions', label: 'Promotions', description: 'Coordinate growth campaigns tied to revenue and plans.' },
    { href: '/admin/promotions/analytics', label: 'Promotion Analytics', description: 'Measure commercial campaign performance.' },
  ],
  sacco_operations: [
    { href: '/admin/sacco', label: 'SACCO Ops', description: 'Manage SACCO members, loans, approvals, and finance operations.' },
    { href: '/admin/sacco/board-meetings', label: 'Governance', description: 'Run board and member governance workflows, attendance, and resolutions.' },
  ],
  payments_operations: [
    { href: '/admin/payments', label: 'Payment Console', description: 'See provider alerts, statuses, and recent payment issues.' },
    { href: '/admin/analytics', label: 'Analytics', description: 'Track revenue trends and transaction patterns.' },
    { href: '/admin/audit-logs', label: 'Audit Logs', description: 'Trace sensitive payment-related administration actions.' },
  ],
  mobile_operations: [
    { href: '/admin/users', label: 'User Verification Queue', description: 'Review users and operationally manage identity support.' },
    { href: '/admin/security', label: 'Security', description: 'Coordinate secure identity and account enforcement.' },
  ],
  security_access: [
    { href: '/admin/roles', label: 'Roles & Permissions', description: 'Manage team access and admin capability boundaries.' },
    { href: '/admin/audit-logs', label: 'Audit Logs', description: 'Inspect all sensitive changes and operator actions.' },
    { href: '/admin/feature-flags', label: 'Feature Flags', description: 'Gate risky features without redeploying.' },
  ],
  operations_diagnostics: [
    { href: '/admin/system', label: 'System Health', description: 'Review API health, infrastructure status, and runtime service readiness.' },
    { href: '/admin/observability', label: 'Observability', description: 'Inspect incidents, evidence, telemetry, and operational signals.' },
    { href: '/admin/security', label: 'Security Console', description: 'Watch runtime security posture and platform protection signals.' },
  ],
  operations_observability: [
    { href: '/admin/observability', label: 'Observability', description: 'Open the dedicated operations view for incidents, evidence, and telemetry.' },
    { href: '/admin/analytics', label: 'Analytics', description: 'Inspect platform-level usage and business trends from the reporting layer.' },
    { href: '/admin/reports', label: 'Reports & Moderation', description: 'Review moderation reports that may point to platform incidents.' },
  ],
  operations_access: [
    { href: '/admin/audit-logs', label: 'Audit Logs', description: 'Trace sensitive operator activity and configuration changes.' },
    { href: '/admin/roles', label: 'Roles & Permissions', description: 'Manage admin, moderator, and staff capability boundaries.' },
    { href: '/admin/security', label: 'Security Console', description: 'Inspect authentication and enforcement surfaces.' },
  ],
  operations_rollout: [
    { href: '/admin/feature-flags', label: 'Feature Flags', description: 'Gate risky features and staged launches without redeploying.' },
    { href: '/admin/system', label: 'System Health', description: 'Validate service health before and after operational changes.' },
    { href: '/admin/settings', label: 'Settings Control Center', description: 'Return to the main system-wide configuration surface.' },
  ],
  awards_overview: [
    { href: '/admin/awards', label: 'Awards', description: 'Manage award programs, seasons, and stages.' },
    { href: '/admin/awards/nominations', label: 'Nominations', description: 'Review and control nominations.' },
    { href: '/admin/featured', label: 'Featured', description: 'Promote awards content in discovery areas.' },
  ],
  awards_operations: [
    { href: '/admin/awards/categories', label: 'Categories', description: 'Manage award taxonomy and category structure.' },
    { href: '/admin/reports', label: 'Reports', description: 'Track disputes or abuse related to awards activity.' },
  ],
  events_overview: [
    { href: '/admin/events', label: 'Events', description: 'Manage event records, visibility, and event publishing.' },
    { href: '/admin/events/new', label: 'Create Event', description: 'Launch new event flows from the admin panel.' },
  ],
  events_commerce: [
    { href: '/admin/payments', label: 'Payments', description: 'Review event payment operations and transaction states.' },
    { href: '/admin/events', label: 'Events Dashboard', description: 'Watch event-level commercial performance and activity.' },
  ],
  artists_catalog: [
    { href: '/admin/artists', label: 'Artists', description: 'Manage artist accounts and profile state.' },
    { href: '/admin/catalog', label: 'Catalog Intake', description: 'Manage music ingestion, uploads, and intake processing.' },
    { href: '/admin/catalog/claims', label: 'Claim Review', description: 'Resolve rights and ownership claim issues.' },
  ],
  artists_podcasts: [
    { href: '/admin/podcasts', label: 'Podcasts', description: 'Manage spoken-word content and podcast publishing.' },
    { href: '/admin/genres', label: 'Genres', description: 'Manage discovery classification and content grouping.' },
  ],
  artists_featured: [
    { href: '/admin/featured', label: 'Featured', description: 'Control spotlight placements and discovery boosts.' },
    { href: '/admin/promotions', label: 'Promotions', description: 'Manage commercial boosts and promotional placement.' },
  ],
};

function normalizeRole(role: string | null | undefined): string {
  return role?.trim().toLowerCase() ?? '';
}

function buildEnvironmentDraft(groups: EnvironmentGroup[]): Record<string, EnvironmentDraftValue> {
  return groups.reduce<Record<string, EnvironmentDraftValue>>((acc, group) => {
    group.fields.forEach((field) => {
      acc[field.key] = field.secret ? '' : field.value ?? '';
    });
    return acc;
  }, {});
}

function coerceEnvironmentValue(field: EnvironmentField, rawValue: EnvironmentDraftValue): EnvironmentFieldValue {
  if (field.type === 'boolean') {
    return Boolean(rawValue);
  }

  if (field.type === 'integer' || field.type === 'number') {
    const numeric = Number(rawValue);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  return String(rawValue ?? '');
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (nextValue: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
        checked ? 'bg-blue-500 dark:bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'
      )}
    >
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

function TextField({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
      {children}
      {description ? <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition',
        'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
        'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/10',
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition',
        'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
        'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/10',
        props.className
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition',
        'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
        'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/10',
        props.className
      )}
    />
  );
}

function SidebarCard({ section, active, onClick }: { section: SectionItem; active: boolean; onClick: () => void }) {
  const Icon = section.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition-all duration-200',
        active
          ? 'border-transparent bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-white shadow-[0_14px_30px_-12px_rgba(102,126,234,0.55)]'
          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-[#101012]'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', active ? 'bg-white/20 text-white' : section.colorClasses)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className={cn('font-semibold', active ? 'text-white' : 'text-slate-800 dark:text-slate-100')}>{section.label}</div>
          <div className={cn('text-xs', active ? 'text-white/80' : 'text-slate-500 dark:text-slate-400')}>{section.subtitle}</div>
        </div>
      </div>
    </button>
  );
}

function SectionCard({
  title,
  description,
  badge,
  children,
  tabs,
  activeTab,
  onTabChange,
}: {
  title: string;
  description: string;
  badge?: ReactNode;
  children: ReactNode;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-[#101012]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {badge}
      </div>

      <div className="mt-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition',
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-300'
                  : 'border-transparent text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function SettingPanel({
  title,
  description,
  tone = 'slate',
  children,
  action,
}: {
  title: string;
  description: string;
  tone?: 'slate' | 'red' | 'blue' | 'green' | 'amber';
  children?: ReactNode;
  action?: ReactNode;
}) {
  const tones = {
    slate: 'bg-slate-50 border-slate-200 dark:bg-[#151519] dark:border-slate-800',
    red: 'bg-red-50 border-red-200 dark:bg-[#1a1418] dark:border-red-900/40',
    blue: 'bg-blue-50 border-blue-200 dark:bg-[#141822] dark:border-blue-900/40',
    green: 'bg-green-50 border-green-200 dark:bg-[#141a16] dark:border-green-900/40',
    amber: 'bg-amber-50 border-amber-200 dark:bg-[#1b1812] dark:border-amber-900/40',
  };

  return (
    <div className={cn('rounded-2xl border p-4', tones[tone])}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="font-medium text-slate-700 dark:text-slate-100">{title}</div>
          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</div>
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
        {action}
      </div>
    </div>
  );
}

function LinkGrid({ links }: { links: SurfaceLink[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-[#151519] dark:hover:border-blue-900/60 dark:hover:bg-[#19191d]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-slate-800 dark:text-slate-100">{link.label}</div>
            <Eye className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{link.description}</p>
        </Link>
      ))}
    </div>
  );
}

function LinkWorkspace({
  title,
  description,
  links,
  tone = 'slate',
}: {
  title: string;
  description: string;
  links: SurfaceLink[];
  tone?: 'slate' | 'red' | 'blue' | 'green' | 'amber';
}) {
  return (
    <div className="space-y-5">
      <SettingPanel title={title} description={description} tone={tone} />
      <LinkGrid links={links} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isSuperAdmin = ['super admin', 'super_admin'].includes(normalizeRole(session?.user?.role));

  const [activeSection, setActiveSection] = useState<SectionId>('security');
  const [activeTabs, setActiveTabs] = useState<Record<SectionId, string>>(defaultActiveTabs);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<PlatformSettings>(normalizePlatformSettings());
  const [environmentDraft, setEnvironmentDraft] = useState<Record<string, EnvironmentDraftValue>>({});
  const [initialEnvironmentDraft, setInitialEnvironmentDraft] = useState<Record<string, EnvironmentDraftValue>>({});
  const [isDirty, setIsDirty] = useState(false);

  const environmentDirty = JSON.stringify(environmentDraft) !== JSON.stringify(initialEnvironmentDraft);

  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => apiGet<SettingsResponse>('/admin/settings'),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: notificationHealthData, isLoading: notificationHealthLoading } = useQuery({
    queryKey: ['admin-notification-health'],
    queryFn: () => apiGet<NotificationHealthResponse>('/notifications/health'),
    retry: 1,
    staleTime: 60 * 1000,
  });

  const {
    data: environmentData,
    isLoading: environmentLoading,
    error: environmentError,
    refetch: refetchEnvironment,
  } = useQuery({
    queryKey: ['admin-environment-settings'],
    queryFn: () => apiGet<EnvironmentSettingsResponse>('/admin/settings/environment'),
    enabled: isSuperAdmin,
    retry: 1,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (settingsData?.data) {
      setSettings(normalizePlatformSettings(settingsData.data));
      setIsDirty(false);
    }
  }, [settingsData]);

  useEffect(() => {
    if (environmentData?.data.groups) {
      const nextDraft = buildEnvironmentDraft(environmentData.data.groups);
      setEnvironmentDraft(nextDraft);
      setInitialEnvironmentDraft(nextDraft);
    }
  }, [environmentData]);

  const saveSettings = useMutation({
    mutationFn: (payload: Partial<PlatformSettings>) => apiPut('/admin/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-platform-settings'] });
      toast.success('Settings saved successfully');
      setIsDirty(false);
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const saveEnvironment = useMutation({
    mutationFn: (values: Record<string, EnvironmentFieldValue>) => apiPut('/admin/settings/environment', { values }),
    onSuccess: async () => {
      toast.success('Environment settings saved');
      const refreshed = await refetchEnvironment();
      const groups = refreshed.data?.data.groups ?? [];
      const nextDraft = buildEnvironmentDraft(groups);
      setEnvironmentDraft(nextDraft);
      setInitialEnvironmentDraft(nextDraft);
    },
    onError: () => toast.error('Failed to save environment settings'),
  });

  function updateField<S extends keyof PlatformSettings>(
    section: S,
    field: keyof PlatformSettings[S],
    value: PlatformSettings[S][keyof PlatformSettings[S]]
  ) {
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
    setIsDirty(true);
  }

  const filteredSections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sections;

    return sections.filter((section) => {
      const haystack = `${section.label} ${section.subtitle} ${section.tabs.map((tab) => tab.label).join(' ')}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [search]);

  const currentSection = filteredSections.find((item) => item.id === activeSection) ?? filteredSections[0];
  const currentTabId = currentSection ? activeTabs[currentSection.id] : '';
  const currentTab = currentSection?.tabs.find((tab) => tab.id === currentTabId) ?? currentSection?.tabs[0];

  function setActiveTab(sectionId: SectionId, tabId: string) {
    setActiveTabs((current) => ({ ...current, [sectionId]: tabId }));
  }

  function handleReset() {
    if (!currentTab) return;

    if (currentTab.mode === 'environment') {
      setEnvironmentDraft(initialEnvironmentDraft);
      toast.info('Environment changes reset');
      return;
    }

    if (currentTab.mode === 'settings' && settingsData?.data) {
      setSettings(normalizePlatformSettings(settingsData.data));
      setIsDirty(false);
      toast.info('Settings reset to last saved state');
    }
  }

  function handleSave() {
    if (!currentTab) return;

    if (currentTab.mode === 'environment') {
      if (!environmentData?.data.groups) return;

      const changedValues = environmentData.data.groups.reduce<Record<string, EnvironmentFieldValue>>((acc, group) => {
        group.fields.forEach((field) => {
          const currentValue = environmentDraft[field.key];
          const initialValue = initialEnvironmentDraft[field.key];

          if (field.secret) {
            if (typeof currentValue === 'string' && currentValue.trim() !== '') {
              acc[field.key] = currentValue;
            }
            return;
          }

          if (JSON.stringify(currentValue) !== JSON.stringify(initialValue)) {
            acc[field.key] = coerceEnvironmentValue(field, currentValue);
          }
        });

        return acc;
      }, {});

      if (Object.keys(changedValues).length === 0) {
        toast.info('No environment changes to save');
        return;
      }

      saveEnvironment.mutate(changedValues);
      return;
    }

    if (currentTab.mode === 'settings') {
      saveSettings.mutate(settings);
    }
  }

  const securityScore = useMemo(() => {
    let score = 0;
    if (settings.security.two_factor_required) score += 25;
    if (settings.security.session_timeout_minutes > 0) score += 20;
    if (settings.security.password_min_length >= 8) score += 20;
    if (settings.security.max_login_attempts <= 5) score += 15;
    if (settings.security.lockout_duration_minutes >= 10) score += 20;
    return score;
  }, [settings.security]);

  const securityLevel = securityScore >= 80 ? 'High Security' : securityScore >= 50 ? 'Medium Security' : 'Low Security';
  const currentTabMode = currentTab?.mode;
  const canSave = currentTabMode === 'environment'
    ? environmentDirty && !saveEnvironment.isPending
    : currentTabMode === 'settings'
      ? isDirty && !saveSettings.isPending
      : false;

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
        Failed to load settings.
      </div>
    );
  }

  function saveButtonLabel() {
    if (!currentSection || !currentTab) return 'Save Settings';
    if (currentSection.id === 'security' && currentTab.id === 'authentication') return 'Save Authentication Settings';
    if (currentSection.id === 'security' && currentTab.id === 'password') return 'Save Password Policy';
    if (currentSection.id === 'payments') return 'Save Payment Settings';
    if (currentSection.id === 'frontend') return 'Save Design Settings';
    return `Save ${currentSection.label}`;
  }

  function renderGeneral() {
    if (!currentTab) return null;

    if (currentTab.id === 'platform') {
      return (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex flex-col items-center">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
                  <SafeImage
                    src={settings.appearance.logo_light || settings.appearance.logo_dark}
                    alt={settings.appearance.logo_alt || settings.appearance.app_name}
                    fill
                    className="object-contain p-3"
                    fallback={<InitialsAvatar name={settings.appearance.logo_compact_label || settings.appearance.app_name} />}
                    sizes="96px"
                  />
                </div>
                <span className="mt-2 text-xs text-slate-500 dark:text-slate-400">Current Logo</span>
              </div>

              <div className="grid flex-1 gap-5 md:grid-cols-2">
                <TextField label="Platform Name">
                  <Input value={settings.general.platform_name} onChange={(e) => updateField('general', 'platform_name', e.target.value)} />
                </TextField>
                <TextField label="Platform URL">
                  <Input value={settings.general.platform_url} onChange={(e) => updateField('general', 'platform_url', e.target.value)} placeholder="https://tesotunes.com" />
                </TextField>
                <div className="md:col-span-2">
                  <TextField label="Platform Description">
                    <Textarea value={settings.general.platform_description} onChange={(e) => updateField('general', 'platform_description', e.target.value)} className="min-h-24" />
                  </TextField>
                </div>
                <div className="md:col-span-2">
                  <TextField label="Tagline">
                    <Input value={settings.general.tagline} onChange={(e) => updateField('general', 'tagline', e.target.value)} />
                  </TextField>
                </div>
                <TextField label="Support Email">
                  <Input type="email" value={settings.general.support_email} onChange={(e) => updateField('general', 'support_email', e.target.value)} />
                </TextField>
                <TextField label="Admin Contact">
                  <Input type="email" value={settings.general.admin_contact} onChange={(e) => updateField('general', 'admin_contact', e.target.value)} />
                </TextField>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentTab.id === 'features') {
      return (
        <LinkWorkspace
          title="Platform Feature Surfaces"
          description="These linked workspaces handle day-to-day feature operations, while this page owns the platform-wide defaults and switches that shape them."
          links={sectionLinks.general_features}
          tone="blue"
        />
      );
    }

    if (currentTab.id === 'localization') {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Default Currency">
            <Select value={settings.general.default_currency} onChange={(e) => updateField('general', 'default_currency', e.target.value)}>
              <option value="UGX">UGX - Ugandan Shilling</option>
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="TZS">TZS - Tanzanian Shilling</option>
              <option value="USD">USD - US Dollar</option>
            </Select>
          </TextField>
          <TextField label="Timezone">
            <Select value={settings.general.timezone} onChange={(e) => updateField('general', 'timezone', e.target.value)}>
              <option value="Africa/Kampala">Africa/Kampala</option>
              <option value="Africa/Nairobi">Africa/Nairobi</option>
              <option value="UTC">UTC</option>
            </Select>
          </TextField>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <SettingPanel
          title="Maintenance Mode"
          description="Temporarily disable public access while operators work on platform changes or incidents."
          tone="amber"
          action={<ToggleSwitch checked={settings.general.maintenance_mode} onChange={(value) => updateField('general', 'maintenance_mode', value)} />}
        />
        <SettingPanel
          title="User Registration"
          description="Allow new users to create Tesotunes accounts."
          action={<ToggleSwitch checked={settings.general.registration_enabled} onChange={(value) => updateField('general', 'registration_enabled', value)} />}
        />
      </div>
    );
  }

  function renderFrontend() {
    if (!currentTab) return null;

    if (currentTab.id === 'branding') {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Primary Color">
            <div className="flex gap-3">
              <Input type="color" value={settings.appearance.primary_color} onChange={(e) => updateField('appearance', 'primary_color', e.target.value)} className="h-12 w-20 p-2" />
              <Input value={settings.appearance.primary_color} onChange={(e) => updateField('appearance', 'primary_color', e.target.value)} />
            </div>
          </TextField>
          <TextField label="Frontend App Name">
            <Input value={settings.appearance.app_name} onChange={(e) => updateField('appearance', 'app_name', e.target.value)} />
          </TextField>
          <TextField label="Logo Light URL">
            <Input value={settings.appearance.logo_light} onChange={(e) => updateField('appearance', 'logo_light', e.target.value)} />
          </TextField>
          <TextField label="Logo Dark URL">
            <Input value={settings.appearance.logo_dark} onChange={(e) => updateField('appearance', 'logo_dark', e.target.value)} />
          </TextField>
          <TextField label="Favicon URL">
            <Input value={settings.appearance.favicon} onChange={(e) => updateField('appearance', 'favicon', e.target.value)} />
          </TextField>
          <TextField label="Logo Alt Text">
            <Input value={settings.appearance.logo_alt} onChange={(e) => updateField('appearance', 'logo_alt', e.target.value)} />
          </TextField>
        </div>
      );
    }

    if (currentTab.id === 'login') {
      return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <TextField label="Login Form Title">
              <Input value={settings.appearance.auth_form_title} onChange={(e) => updateField('appearance', 'auth_form_title', e.target.value)} />
            </TextField>
            <TextField label="Login Form Subtitle">
              <Textarea value={settings.appearance.auth_form_subtitle} onChange={(e) => updateField('appearance', 'auth_form_subtitle', e.target.value)} className="min-h-24" />
            </TextField>
            <TextField label="Hero Title">
              <Input value={settings.appearance.auth_hero_title} onChange={(e) => updateField('appearance', 'auth_hero_title', e.target.value)} />
            </TextField>
            <TextField label="Hero Description">
              <Textarea value={settings.appearance.auth_hero_description} onChange={(e) => updateField('appearance', 'auth_hero_description', e.target.value)} className="min-h-28" />
            </TextField>
            <TextField label="Hero Image URL">
              <Input value={settings.appearance.auth_hero_image} onChange={(e) => updateField('appearance', 'auth_hero_image', e.target.value)} />
            </TextField>
          </div>

          <div className="overflow-hidden rounded-3xl bg-[#16090d] text-white">
            <div className="relative min-h-[420px] p-6">
              {settings.appearance.auth_hero_image ? (
                <SafeImage src={settings.appearance.auth_hero_image} alt={settings.appearance.auth_hero_title} fill className="object-cover opacity-25" fallback={null} sizes="360px" />
              ) : null}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,29,72,0.35),transparent_42%),linear-gradient(135deg,rgba(36,8,18,0.98),rgba(10,10,10,0.9))]" />
              <div className="relative z-10 space-y-6">
                <div className="font-semibold">{settings.appearance.app_name}</div>
                <div>
                  <div className="text-3xl font-semibold">{settings.appearance.auth_hero_title}</div>
                  <p className="mt-3 text-sm leading-6 text-white/70">{settings.appearance.auth_hero_description}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    [settings.appearance.auth_stat_1_value, settings.appearance.auth_stat_1_label],
                    [settings.appearance.auth_stat_2_value, settings.appearance.auth_stat_2_label],
                    [settings.appearance.auth_stat_3_value, settings.appearance.auth_stat_3_label],
                  ].map(([value, label], index) => (
                    <div key={`${label}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                      <div className="text-xl font-bold">{value}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/55">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentTab.id === 'admin') {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Admin Panel Name">
            <Input value={settings.appearance.admin_panel_name} onChange={(e) => updateField('appearance', 'admin_panel_name', e.target.value)} />
          </TextField>
          <TextField label="Admin Panel Subtitle">
            <Input value={settings.appearance.admin_panel_subtitle} onChange={(e) => updateField('appearance', 'admin_panel_subtitle', e.target.value)} />
          </TextField>
          <TextField label="Compact Logo Label">
            <Input value={settings.appearance.logo_compact_label} onChange={(e) => updateField('appearance', 'logo_compact_label', e.target.value)} />
          </TextField>
        </div>
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="SACCO Header Name">
          <Input value={settings.appearance.sacco_name} onChange={(e) => updateField('appearance', 'sacco_name', e.target.value)} />
        </TextField>
        <TextField label="SACCO Header Tagline">
          <Input value={settings.appearance.sacco_tagline} onChange={(e) => updateField('appearance', 'sacco_tagline', e.target.value)} />
        </TextField>
      </div>
    );
  }

  function renderUsers() {
    if (!currentTab) return null;

    if (currentTab.id === 'registration') {
      return (
        <div className="space-y-5">
          <SettingPanel title="User Registration" description="Allow new users to register accounts on Tesotunes." action={<ToggleSwitch checked={settings.users.user_registration_enabled} onChange={(value) => updateField('users', 'user_registration_enabled', value)} />} />
          <div className="grid gap-5 md:grid-cols-2">
            <SettingPanel title="Email verification required" description="Require new users to verify their email before using the platform." action={<ToggleSwitch checked={settings.users.email_verification_required} onChange={(value) => updateField('users', 'email_verification_required', value)} />} />
            <SettingPanel title="Phone verification enabled" description="Allow phone verification to be used during onboarding and support flows." action={<ToggleSwitch checked={settings.users.phone_verification_enabled} onChange={(value) => updateField('users', 'phone_verification_enabled', value)} />} />
            <SettingPanel title="Artist approval required" description="Manually review artist accounts before they are activated." action={<ToggleSwitch checked={settings.users.artist_approval_required} onChange={(value) => updateField('users', 'artist_approval_required', value)} />} />
            <SettingPanel title="Social login available" description="Expose third-party sign-in options where configured." action={<ToggleSwitch checked={settings.users.social_login_enabled} onChange={(value) => updateField('users', 'social_login_enabled', value)} />} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Default User Role">
              <Select value={settings.users.default_user_role} onChange={(e) => updateField('users', 'default_user_role', e.target.value)}>
                <option value="user">User</option>
                <option value="artist">Artist</option>
                <option value="fan">Fan</option>
              </Select>
            </TextField>
            <TextField label="Registration Limit Per IP">
              <Input type="number" min={1} value={settings.users.registration_limit_per_ip} onChange={(e) => updateField('users', 'registration_limit_per_ip', Number(e.target.value))} />
            </TextField>
          </div>
        </div>
      );
    }

    if (currentTab.id === 'permissions') {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <SettingPanel title="Users can upload music" description="Allow standard users or artists to upload tracks." action={<ToggleSwitch checked={settings.users.user_can_upload_music} onChange={(value) => updateField('users', 'user_can_upload_music', value)} />} />
            <SettingPanel title="Users can create playlists" description="Enable playlist creation and library curation." action={<ToggleSwitch checked={settings.users.user_can_create_playlists} onChange={(value) => updateField('users', 'user_can_create_playlists', value)} />} />
            <SettingPanel title="Users can comment" description="Control audience commenting across songs, events, and community surfaces." action={<ToggleSwitch checked={settings.users.user_can_comment} onChange={(value) => updateField('users', 'user_can_comment', value)} />} />
            <SettingPanel title="Users can download" description="Allow downloadable music files where the catalog permits it." action={<ToggleSwitch checked={settings.users.user_can_download} onChange={(value) => updateField('users', 'user_can_download', value)} />} />
            <SettingPanel title="Artists can create events" description="Allow verified artists to create public event listings." action={<ToggleSwitch checked={settings.users.artist_can_create_events} onChange={(value) => updateField('users', 'artist_can_create_events', value)} />} />
            <SettingPanel title="Artists can sell tickets" description="Enable event ticketing and checkout for artist accounts." action={<ToggleSwitch checked={settings.users.artist_can_sell_tickets} onChange={(value) => updateField('users', 'artist_can_sell_tickets', value)} />} />
            <SettingPanel title="Artists can monetize" description="Allow artist earning flows such as payouts and revenue participation." action={<ToggleSwitch checked={settings.users.artist_can_monetize} onChange={(value) => updateField('users', 'artist_can_monetize', value)} />} />
            <SettingPanel title="Artist analytics access" description="Expose artist analytics dashboards and performance insights." action={<ToggleSwitch checked={settings.users.artist_has_analytics} onChange={(value) => updateField('users', 'artist_has_analytics', value)} />} />
          </div>
          <LinkWorkspace
            title="Permission Workspaces"
            description="Use these operational screens when you need to inspect people, admin access, or live enforcement beyond the policy defaults configured here."
            links={sectionLinks.users_permissions}
            tone="blue"
          />
        </div>
      );
    }

    if (currentTab.id === 'restrictions') {
      return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Max Upload Size (MB)">
            <Input type="number" min={1} value={settings.users.max_upload_size_mb} onChange={(e) => updateField('users', 'max_upload_size_mb', Number(e.target.value))} />
          </TextField>
          <TextField label="Daily Upload Limit">
            <Input type="number" min={1} value={settings.users.daily_upload_limit} onChange={(e) => updateField('users', 'daily_upload_limit', Number(e.target.value))} />
          </TextField>
          <TextField label="Max Playlists Per User">
            <Input type="number" min={1} value={settings.users.max_playlists_per_user} onChange={(e) => updateField('users', 'max_playlists_per_user', Number(e.target.value))} />
          </TextField>
          <TextField label="Max Events Per Artist / Month">
            <Input type="number" min={0} value={settings.users.max_events_per_artist_monthly} onChange={(e) => updateField('users', 'max_events_per_artist_monthly', Number(e.target.value))} />
          </TextField>
          <TextField label="Comment Character Limit">
            <Input type="number" min={50} value={settings.users.comment_character_limit} onChange={(e) => updateField('users', 'comment_character_limit', Number(e.target.value))} />
          </TextField>
          <TextField label="User Session Timeout (minutes)">
            <Input type="number" min={5} value={settings.users.session_timeout_minutes} onChange={(e) => updateField('users', 'session_timeout_minutes', Number(e.target.value))} />
          </TextField>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <SettingPanel title="Profanity filter" description="Detect and reduce offensive language in user-submitted text." action={<ToggleSwitch checked={settings.users.profanity_filter_enabled} onChange={(value) => updateField('users', 'profanity_filter_enabled', value)} />} />
          <SettingPanel title="Auto-moderate comments" description="Automatically queue or suppress risky comments before they go live." action={<ToggleSwitch checked={settings.users.auto_moderate_comments} onChange={(value) => updateField('users', 'auto_moderate_comments', value)} />} />
          <SettingPanel title="Spam detection" description="Use spam heuristics to flag suspicious community activity." action={<ToggleSwitch checked={settings.users.spam_detection_enabled} onChange={(value) => updateField('users', 'spam_detection_enabled', value)} />} />
          <SettingPanel title="Rate limiting" description="Limit repetitive abusive actions from the same actor or network." action={<ToggleSwitch checked={settings.users.rate_limiting_enabled} onChange={(value) => updateField('users', 'rate_limiting_enabled', value)} />} />
          <SettingPanel title="IP blocking" description="Allow operator-driven IP blocking for repeated abuse." action={<ToggleSwitch checked={settings.users.ip_blocking_enabled} onChange={(value) => updateField('users', 'ip_blocking_enabled', value)} />} />
          <SettingPanel title="Moderation email alerts" description="Send moderation notifications to the operations inbox." action={<ToggleSwitch checked={settings.users.moderation_email_notifications} onChange={(value) => updateField('users', 'moderation_email_notifications', value)} />} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Warnings Before Ban">
            <Input type="number" min={0} value={settings.users.warnings_before_ban} onChange={(e) => updateField('users', 'warnings_before_ban', Number(e.target.value))} />
          </TextField>
          <TextField label="Auto-Ban After Violations">
            <Input type="number" min={1} value={settings.users.auto_ban_after_violations} onChange={(e) => updateField('users', 'auto_ban_after_violations', Number(e.target.value))} />
          </TextField>
        </div>
        <LinkWorkspace
          title="Moderation Workspaces"
          description="The rules above define moderation posture. These linked tools are where operators review incidents, reports, and community activity in practice."
          links={sectionLinks.users_moderation}
          tone="amber"
        />
      </div>
    );
  }

  function renderCredits() {
    if (!currentTab) return null;

    if (currentTab.id === 'revenue') {
      return (
        <div className="space-y-5">
          <SettingPanel title="Artist Revenue Share" description="Used for song purchase distribution and other revenue-sharing surfaces." tone="green">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={settings.payments.artist_revenue_share}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  const safe = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;
                  updateField('payments', 'artist_revenue_share', safe);
                }}
              />
              <div className="rounded-2xl border border-green-200 bg-white px-4 py-3 text-sm dark:border-green-900/60 dark:bg-slate-900">
                <div className="text-slate-500 dark:text-slate-400">Platform Share</div>
                <div className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{(100 - Number(settings.payments.artist_revenue_share || 0)).toFixed(2)}%</div>
              </div>
            </div>
          </SettingPanel>
        </div>
      );
    }

    if (currentTab.id === 'packages') {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <SettingPanel title="Credit system enabled" description="Turn credit-based flows on across Tesotunes products." action={<ToggleSwitch checked={settings.credits.credits_enabled} onChange={(value) => updateField('credits', 'credits_enabled', value)} />} />
            <SettingPanel title="Credit purchase enabled" description="Allow users to buy credits directly." action={<ToggleSwitch checked={settings.credits.credit_purchase_enabled} onChange={(value) => updateField('credits', 'credit_purchase_enabled', value)} />} />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <TextField label="UGX Per Credit">
              <Input type="number" min={1} value={settings.credits.credit_to_ugx_rate} onChange={(e) => updateField('credits', 'credit_to_ugx_rate', Number(e.target.value))} />
            </TextField>
            <TextField label="Credits Per Song Upload">
              <Input type="number" min={0} value={settings.credits.credits_per_song_upload} onChange={(e) => updateField('credits', 'credits_per_song_upload', Number(e.target.value))} />
            </TextField>
            <TextField label="Credits Per Event Ticket">
              <Input type="number" min={0} value={settings.credits.credits_per_event_ticket} onChange={(e) => updateField('credits', 'credits_per_event_ticket', Number(e.target.value))} />
            </TextField>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div className="mb-4 flex items-center justify-between">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">Package {index}</div>
                  <ToggleSwitch
                    checked={settings.credits[`package_${index}_active` as 'package_1_active' | 'package_2_active' | 'package_3_active']}
                    onChange={(value) => updateField('credits', `package_${index}_active` as 'package_1_active' | 'package_2_active' | 'package_3_active', value)}
                  />
                </div>
                <div className="space-y-4">
                  <TextField label="Credits">
                    <Input
                      type="number"
                      min={0}
                      value={settings.credits[`package_${index}_credits` as 'package_1_credits' | 'package_2_credits' | 'package_3_credits']}
                      onChange={(e) => updateField('credits', `package_${index}_credits` as 'package_1_credits' | 'package_2_credits' | 'package_3_credits', Number(e.target.value))}
                    />
                  </TextField>
                  <TextField label="Price (UGX)">
                    <Input
                      type="number"
                      min={0}
                      value={settings.credits[`package_${index}_price` as 'package_1_price' | 'package_2_price' | 'package_3_price']}
                      onChange={(e) => updateField('credits', `package_${index}_price` as 'package_1_price' | 'package_2_price' | 'package_3_price', Number(e.target.value))}
                    />
                  </TextField>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentTab.id === 'subscriptions') {
      return (
        <LinkWorkspace
          title="Commercial Growth Workspaces"
          description="Subscription plans and promotions are still operated in dedicated screens, but they now sit under this credit and monetization strategy area."
          links={sectionLinks.credits_subscriptions}
          tone="green"
        />
      );
    }

    return (
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Share Price (UGX)">
            <Input type="number" value={settings.sacco.share_price_ugx} onChange={(e) => updateField('sacco', 'share_price_ugx', Number(e.target.value))} />
          </TextField>
          <TextField label="Default Join Deposit (UGX)">
            <Input type="number" value={settings.sacco.default_join_deposit_ugx} onChange={(e) => updateField('sacco', 'default_join_deposit_ugx', Number(e.target.value))} />
          </TextField>
          <TextField label="Monthly Savings Target (UGX)">
            <Input type="number" value={settings.sacco.monthly_savings_target_ugx} onChange={(e) => updateField('sacco', 'monthly_savings_target_ugx', Number(e.target.value))} />
          </TextField>
          <TextField label="Annual Interest Rate (%)">
            <Input type="number" step="0.1" value={settings.sacco.annual_interest_rate} onChange={(e) => updateField('sacco', 'annual_interest_rate', Number(e.target.value))} />
          </TextField>
          <TextField label="Annual Dividend Rate (%)">
            <Input type="number" step="0.1" value={settings.sacco.annual_dividend_rate} onChange={(e) => updateField('sacco', 'annual_dividend_rate', Number(e.target.value))} />
          </TextField>
          <TextField label="Maximum Loan Multiplier">
            <Input type="number" step="0.1" value={settings.sacco.max_loan_multiplier} onChange={(e) => updateField('sacco', 'max_loan_multiplier', Number(e.target.value))} />
          </TextField>
        </div>
        <LinkWorkspace
          title="SACCO Operations"
          description="SACCO configuration belongs here in Settings. Use these linked operational screens for members, loans, and governance execution."
          links={sectionLinks.sacco_operations}
          tone="green"
        />
      </div>
    );
  }

  function renderPayments() {
    if (!currentTab) return null;

    if (currentTab.id === 'gateway') {
      return (
        <div className="space-y-6">
          <SettingPanel title="ZengaPay Gateway" description="Tesotunes is currently using ZengaPay only. MTN and Airtel settings from the Laravel original are intentionally removed here." tone="blue">
            <div className="mt-4 space-y-4">
              <SettingPanel
                title="Enable ZengaPay"
                description="Use ZengaPay for supported card and payment processing flows."
                action={<ToggleSwitch checked={settings.payments.zengapay_enabled} onChange={(value) => updateField('payments', 'zengapay_enabled', value)} />}
              />
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Merchant ID">
                  <Input value={settings.payments.zengapay_merchant_id} onChange={(e) => updateField('payments', 'zengapay_merchant_id', e.target.value)} />
                </TextField>
                <TextField label="API Key">
                  <Input type="password" value={settings.payments.zengapay_api_key} onChange={(e) => updateField('payments', 'zengapay_api_key', e.target.value)} />
                </TextField>
              </div>
            </div>
          </SettingPanel>
        </div>
      );
    }

    if (currentTab.id === 'operations') {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <SettingPanel title="Payouts enabled" description="Allow artist payouts to be scheduled and processed." action={<ToggleSwitch checked={settings.payments.payouts_enabled} onChange={(value) => updateField('payments', 'payouts_enabled', value)} />} />
            <SettingPanel title="Gateway notification posture" description={settings.notifications.notify_failed_payments ? 'Failed payment alerts are enabled for operators.' : 'Failed payment alerts are currently disabled.'} tone={settings.notifications.notify_failed_payments ? 'green' : 'amber'} />
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <TextField label="Transaction Fee (%)">
              <Input type="number" min={0} max={100} step="0.01" value={settings.payments.transaction_fee_percentage} onChange={(e) => updateField('payments', 'transaction_fee_percentage', Number(e.target.value))} />
            </TextField>
            <TextField label="Minimum Payout (UGX)">
              <Input type="number" min={0} value={settings.payments.minimum_payout_ugx} onChange={(e) => updateField('payments', 'minimum_payout_ugx', Number(e.target.value))} />
            </TextField>
            <TextField label="Payout Hold Days">
              <Input type="number" min={0} value={settings.payments.payout_hold_days} onChange={(e) => updateField('payments', 'payout_hold_days', Number(e.target.value))} />
            </TextField>
            <TextField label="Payout Schedule">
              <Select value={settings.payments.payout_schedule} onChange={(e) => updateField('payments', 'payout_schedule', e.target.value)}>
                <option value="manual">Manual</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </TextField>
          </div>
          <TextField label="Webhook Secret">
            <Input type="password" value={settings.payments.zengapay_webhook_secret} onChange={(e) => updateField('payments', 'zengapay_webhook_secret', e.target.value)} />
          </TextField>
          <LinkWorkspace
            title="Payment Operations"
            description="Investigations, analytics, and sensitive payment audits stay in their dedicated tools. This page owns gateway policy and platform payment defaults."
            links={sectionLinks.payments_operations}
            tone="blue"
          />
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
        The original Laravel screen included MTN Mobile Money and Airtel Money. This Next implementation intentionally keeps only ZengaPay because that is the active Tesotunes provider today.
      </div>
    );
  }

  function renderNotifications() {
    if (!currentTab) return null;

    if (currentTab.id === 'channels') {
      return (
        <div className="space-y-4">
          <SettingPanel title="Push Notifications" description="Browser and device push notifications." action={<ToggleSwitch checked={settings.notifications.push_enabled} onChange={(value) => updateField('notifications', 'push_enabled', value)} />} />
          <SettingPanel title="Email Notifications" description="Send emails for important product and commerce events." action={<ToggleSwitch checked={settings.notifications.email_enabled} onChange={(value) => updateField('notifications', 'email_enabled', value)} />} />
          <SettingPanel title="SMS Notifications" description="Critical SMS alerts and time-sensitive communication." action={<ToggleSwitch checked={settings.notifications.sms_enabled} onChange={(value) => updateField('notifications', 'sms_enabled', value)} />} />
          <div className="grid gap-4 md:grid-cols-2">
            <SettingPanel title="Notify new registrations" description="Alert the team when new users join the platform." action={<ToggleSwitch checked={settings.notifications.notify_new_registrations} onChange={(value) => updateField('notifications', 'notify_new_registrations', value)} />} />
            <SettingPanel title="Notify new uploads" description="Alert operations when new music or catalog content is submitted." action={<ToggleSwitch checked={settings.notifications.notify_new_uploads} onChange={(value) => updateField('notifications', 'notify_new_uploads', value)} />} />
            <SettingPanel title="Notify payout requests" description="Alert finance operators when artists request payouts." action={<ToggleSwitch checked={settings.notifications.notify_payout_requests} onChange={(value) => updateField('notifications', 'notify_payout_requests', value)} />} />
            <SettingPanel title="Notify content reports" description="Alert moderators when abusive content is reported." action={<ToggleSwitch checked={settings.notifications.notify_content_reports} onChange={(value) => updateField('notifications', 'notify_content_reports', value)} />} />
            <SettingPanel title="Notify new orders" description="Send alerts when store or commerce orders are created." action={<ToggleSwitch checked={settings.notifications.notify_new_orders} onChange={(value) => updateField('notifications', 'notify_new_orders', value)} />} />
            <SettingPanel title="Notify failed payments" description="Alert staff about failed gateway transactions or settlement issues." action={<ToggleSwitch checked={settings.notifications.notify_failed_payments} onChange={(value) => updateField('notifications', 'notify_failed_payments', value)} />} />
          </div>
          <TextField label="Digest Frequency">
            <Select value={settings.notifications.digest_frequency} onChange={(e) => updateField('notifications', 'digest_frequency', e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </Select>
          </TextField>
        </div>
      );
    }

    if (currentTab.id === 'delivery') {
      const health = notificationHealthData?.data;
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">Live delivery diagnostics</div>
            {notificationHealthLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
          </div>
          {health ? (
            <div className="grid gap-4 md:grid-cols-3">
              <SettingPanel title="Mail" description={`Mailer: ${health.mail.mailer}`} tone={health.checks.mail_ready ? 'green' : 'amber'} />
              <SettingPanel title="Queue" description={`Connection: ${health.queue.connection}`} tone={health.checks.queue_ready ? 'green' : 'amber'} />
              <SettingPanel title="Push" description={`Active tokens: ${health.push.active_device_tokens ?? 'n/a'}`} tone={health.checks.push_ready ? 'green' : 'amber'} />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Notification diagnostics are unavailable right now.
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="SMTP Host">
          <Input value={settings.email.smtp_host} onChange={(e) => updateField('email', 'smtp_host', e.target.value)} />
        </TextField>
        <TextField label="SMTP Port">
          <Input type="number" value={settings.email.smtp_port} onChange={(e) => updateField('email', 'smtp_port', Number(e.target.value))} />
        </TextField>
        <TextField label="SMTP Username">
          <Input value={settings.email.smtp_username} onChange={(e) => updateField('email', 'smtp_username', e.target.value)} />
        </TextField>
        <TextField label="From Name">
          <Input value={settings.email.smtp_from_name} onChange={(e) => updateField('email', 'smtp_from_name', e.target.value)} />
        </TextField>
      </div>
    );
  }

  function renderMobileVerification() {
    if (!currentTab) return null;
    if (currentTab.id === 'operations') {
      return (
        <LinkWorkspace
          title="Verification Operations"
          description="The verification policy lives here. Use these linked workspaces when staff need to review user identity cases or handle enforcement actions."
          links={sectionLinks.mobile_operations}
          tone="amber"
        />
      );
    }

    return (
      <div className="space-y-5">
        <SettingPanel title="Mobile verification enabled" description="Turn SMS or phone-based verification flows on for Tesotunes." action={<ToggleSwitch checked={settings.mobile.mobile_verification_enabled} onChange={(value) => updateField('mobile', 'mobile_verification_enabled', value)} />} />
        <div className="grid gap-4 md:grid-cols-2">
          <SettingPanel title="Required for signup" description="Enforce phone verification during account creation." action={<ToggleSwitch checked={settings.mobile.mobile_verification_required_for_signup} onChange={(value) => updateField('mobile', 'mobile_verification_required_for_signup', value)} />} />
          <SettingPanel title="Required for login" description="Require verified phone ownership before login completes." action={<ToggleSwitch checked={settings.mobile.mobile_verification_required_for_login} onChange={(value) => updateField('mobile', 'mobile_verification_required_for_login', value)} />} />
          <SettingPanel title="Required for events" description="Verify phone numbers before users can access event flows." action={<ToggleSwitch checked={settings.mobile.mobile_verification_required_for_events} onChange={(value) => updateField('mobile', 'mobile_verification_required_for_events', value)} />} />
          <SettingPanel title="Required for artists" description="Verify artist phone numbers before artist capabilities are unlocked." action={<ToggleSwitch checked={settings.mobile.mobile_verification_required_for_artists} onChange={(value) => updateField('mobile', 'mobile_verification_required_for_artists', value)} />} />
          <SettingPanel title="Required for payouts" description="Add phone verification to sensitive payout or withdrawal actions." action={<ToggleSwitch checked={settings.mobile.mobile_verification_required_for_payouts} onChange={(value) => updateField('mobile', 'mobile_verification_required_for_payouts', value)} />} />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <TextField label="SMS Provider">
            <Select value={settings.mobile.sms_provider} onChange={(e) => updateField('mobile', 'sms_provider', e.target.value)}>
              <option value="local">Local</option>
              <option value="twilio">Twilio</option>
              <option value="africastalking">Africa&apos;s Talking</option>
              <option value="termii">Termii</option>
            </Select>
          </TextField>
          <TextField label="Code Length">
            <Input type="number" min={4} max={8} value={settings.mobile.verification_code_length} onChange={(e) => updateField('mobile', 'verification_code_length', Number(e.target.value))} />
          </TextField>
          <TextField label="Expiry (minutes)">
            <Input type="number" min={1} max={60} value={settings.mobile.verification_expiry_minutes} onChange={(e) => updateField('mobile', 'verification_expiry_minutes', Number(e.target.value))} />
          </TextField>
          <TextField label="Max Attempts">
            <Input type="number" min={1} max={10} value={settings.mobile.max_verification_attempts} onChange={(e) => updateField('mobile', 'max_verification_attempts', Number(e.target.value))} />
          </TextField>
        </div>
        <TextField label="Resend Cooldown (seconds)">
          <Input type="number" min={0} value={settings.mobile.resend_cooldown_seconds} onChange={(e) => updateField('mobile', 'resend_cooldown_seconds', Number(e.target.value))} className="max-w-xs" />
        </TextField>
      </div>
    );
  }

  function renderSecurity() {
    if (!currentTab) return null;

    if (currentTab.id === 'authentication') {
      return (
        <div className="space-y-6">
          <SettingPanel
            title="Two-Factor Authentication for Admins"
            description="Require admin users to use 2FA for enhanced security."
            tone="red"
            action={<ToggleSwitch checked={settings.security.two_factor_required} onChange={(value) => updateField('security', 'two_factor_required', value)} />}
          />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Session Management</h4>
            <SettingPanel
              title="Enable Session Timeout"
              description="Automatically log out inactive users."
              action={<ToggleSwitch checked={settings.security.enable_session_timeout} onChange={(value) => updateField('security', 'enable_session_timeout', value)} />}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Session Timeout (minutes)" description="Users will be logged out after this period of inactivity">
                <Input type="number" min={5} value={settings.security.session_timeout_minutes} onChange={(e) => updateField('security', 'session_timeout_minutes', Number(e.target.value))} />
              </TextField>
              <TextField label="Max Login Attempts" description="Account will be locked after this many failed attempts">
                <Input type="number" min={1} value={settings.security.max_login_attempts} onChange={(e) => updateField('security', 'max_login_attempts', Number(e.target.value))} />
              </TextField>
              <TextField label="Lockout Duration (minutes)" description="How long to lock the account after too many failed attempts">
                <Input type="number" min={1} value={settings.security.lockout_duration_minutes} onChange={(e) => updateField('security', 'lockout_duration_minutes', Number(e.target.value))} />
              </TextField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SettingPanel title="Allow remember me" description="Permit long-lived remembered sessions on trusted devices." action={<ToggleSwitch checked={settings.security.allow_remember_me} onChange={(value) => updateField('security', 'allow_remember_me', value)} />} />
              <SettingPanel title="Enforce single session" description="Sign users out of previous sessions when they authenticate again." action={<ToggleSwitch checked={settings.security.enforce_single_session} onChange={(value) => updateField('security', 'enforce_single_session', value)} />} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <SettingPanel title="Log security events" description="Keep a record of important authentication and security changes." action={<ToggleSwitch checked={settings.security.log_security_events} onChange={(value) => updateField('security', 'log_security_events', value)} />} />
              <SettingPanel title="Log failed logins" description="Track invalid sign-in attempts for auditing and investigations." action={<ToggleSwitch checked={settings.security.log_failed_logins} onChange={(value) => updateField('security', 'log_failed_logins', value)} />} />
              <SettingPanel title="Log password changes" description="Keep a trail of password resets and password update activity." action={<ToggleSwitch checked={settings.security.log_password_changes} onChange={(value) => updateField('security', 'log_password_changes', value)} />} />
            </div>
          </div>
        </div>
      );
    }

    if (currentTab.id === 'password') {
      return (
        <div className="space-y-6">
          <TextField label="Minimum Password Length" description="Recommended: 8 or more characters">
            <Input type="number" min={6} max={128} value={settings.security.password_min_length} onChange={(e) => updateField('security', 'password_min_length', Number(e.target.value))} className="max-w-xs" />
          </TextField>
          <div className="grid gap-3 md:grid-cols-2">
            <SettingPanel title="Require uppercase letters" description="At least one uppercase letter in every password." action={<ToggleSwitch checked={settings.security.password_require_uppercase} onChange={(value) => updateField('security', 'password_require_uppercase', value)} />} />
            <SettingPanel title="Require lowercase letters" description="At least one lowercase letter in every password." action={<ToggleSwitch checked={settings.security.password_require_lowercase} onChange={(value) => updateField('security', 'password_require_lowercase', value)} />} />
            <SettingPanel title="Require numbers" description="At least one digit in every password." action={<ToggleSwitch checked={settings.security.password_require_numbers} onChange={(value) => updateField('security', 'password_require_numbers', value)} />} />
            <SettingPanel title="Require symbols" description="Require a special character for higher password entropy." action={<ToggleSwitch checked={settings.security.password_require_symbols} onChange={(value) => updateField('security', 'password_require_symbols', value)} />} />
          </div>
          <div className="rounded-2xl border-2 border-dashed border-green-200 bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 p-5 dark:border-green-900/50 dark:from-green-950/10 dark:via-blue-950/10 dark:to-slate-900">
            <div className="font-semibold text-green-700 dark:text-green-300">Example strong password</div>
            <div className="mt-3 rounded-xl bg-white px-4 py-3 font-mono text-sm dark:bg-slate-950">MyMusic@Platform2024!</div>
          </div>
        </div>
      );
    }

    if (currentTab.id === 'access') {
      return (
        <LinkWorkspace
          title="Security Operations"
          description="These admin workspaces were removed from the main sidebar to reduce duplicate navigation. Reach them from here when adjusting access, auditing changes, or gating risky features."
          links={sectionLinks.security_access}
          tone="red"
        />
      );
    }

    if (currentTab.id === 'social') {
      if (!isSuperAdmin) {
        return <SettingPanel title="Social credentials restricted" description="Only super admins can manage OAuth credentials from this page." tone="amber" />;
      }

      if (environmentLoading && !environmentData) {
        return (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        );
      }

      if (environmentError) {
        return <SettingPanel title="Social credentials unavailable" description="Failed to load environment settings." tone="red" />;
      }

      const oauthGroups = environmentData?.data.groups.filter((group) => group.id === 'oauth') ?? [];

      return (
        <div className="space-y-5">
          <SettingPanel
            title="Social provider credentials"
            description="Update OAuth client IDs and secrets used by the API social token exchange flow. Frontend runtime keys still require deployment environment updates."
            tone="amber"
          />
          {oauthGroups.length === 0 ? (
            <SettingPanel
              title="No OAuth fields configured"
              description="The API environment service did not return OAuth credential fields."
              tone="red"
            />
          ) : null}
          {oauthGroups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
              <div className="mb-4">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{group.label}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{group.description}</div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {group.fields.map((field) => (
                  <TextField key={field.key} label={field.label} description={field.description}>
                    {field.options?.length ? (
                      <Select
                        value={String(environmentDraft[field.key] ?? '')}
                        onChange={(e) => setEnvironmentDraft((current) => ({ ...current, [field.key]: e.target.value }))}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={field.secret ? 'password' : field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
                        value={String(environmentDraft[field.key] ?? '')}
                        onChange={(e) =>
                          setEnvironmentDraft((current) => ({
                            ...current,
                            [field.key]: field.type === 'integer' || field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
                          }))
                        }
                      />
                    )}
                  </TextField>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <SettingPanel title="Expose social sign-in" description="Master switch for allowing social providers on the login screen." action={<ToggleSwitch checked={settings.users.social_login_enabled} onChange={(value) => updateField('users', 'social_login_enabled', value)} />} />
        <div className="grid gap-4 md:grid-cols-3">
          <SettingPanel title="Google login" description="Enable Google as a sign-in provider once environment keys are configured." action={<ToggleSwitch checked={settings.security.google_login_enabled} onChange={(value) => updateField('security', 'google_login_enabled', value)} />} />
          <SettingPanel title="Facebook login" description="Enable Facebook sign-in for supported users." action={<ToggleSwitch checked={settings.security.facebook_login_enabled} onChange={(value) => updateField('security', 'facebook_login_enabled', value)} />} />
          <SettingPanel title="Apple login" description="Enable Apple sign-in for compatible devices and regions." action={<ToggleSwitch checked={settings.security.apple_login_enabled} onChange={(value) => updateField('security', 'apple_login_enabled', value)} />} />
        </div>
        <SettingPanel title="Provider configuration note" description="Client IDs and secrets remain in the environment editor. These toggles only expose or hide providers that have already been configured." tone="blue" />
      </div>
    );
  }

  function renderAwards() {
    return (
      <LinkWorkspace
        title={currentTab?.id === 'operations' ? 'Awards Operations' : 'Awards Workspaces'}
        description={currentTab?.id === 'operations'
          ? 'Category management and dispute handling stay in focused workspaces while this settings area acts as the curated anchor.'
          : 'Awards management remains operational, but it is grouped here so settings and adjacent tools stay easy to find.'}
        links={sectionLinks[currentTab?.id === 'operations' ? 'awards_operations' : 'awards_overview']}
        tone="amber"
      />
    );
  }

  function renderEvents() {
    return (
      <LinkWorkspace
        title={currentTab?.id === 'commerce' ? 'Event Commerce' : 'Event Workspaces'}
        description={currentTab?.id === 'commerce'
          ? 'Payment and event performance workflows stay in their dedicated tools, while this settings area owns the supporting policy.'
          : 'Events remain an operational domain, and this page now works as the curated navigation point into those workflows.'}
        links={sectionLinks[currentTab?.id === 'commerce' ? 'events_commerce' : 'events_overview']}
        tone="blue"
      />
    );
  }

  function renderArtists() {
    if (!currentTab) return null;
    return (
      <LinkWorkspace
        title={
          currentTab.id === 'catalog'
            ? 'Artist & Catalog Workspaces'
            : currentTab.id === 'podcasts'
              ? 'Podcast & Taxonomy Workspaces'
              : 'Promotion & Discovery Workspaces'
        }
        description="Artist operations still live in their own focused admin tools. This section groups those destinations so related controls stay together."
        links={sectionLinks[`artists_${currentTab.id}`]}
        tone="blue"
      />
    );
  }

  function renderOperations() {
    if (!currentTab) return null;

    const copy = {
      diagnostics: {
        title: 'Diagnostics Workspaces',
        description: 'The operational pages removed from the main admin sidebar now live here so health checks, observability, and runtime inspection are still easy to reach.',
      },
      observability: {
        title: 'Observability Workspaces',
        description: 'Use these surfaces to inspect telemetry, moderation signals, and reporting evidence without crowding the main operations sidebar.',
      },
      access: {
        title: 'Audit & Access Workspaces',
        description: 'Audit logs, roles, and the security console stay grouped here because they support settings governance rather than day-to-day content operations.',
      },
      rollout: {
        title: 'Rollout Workspaces',
        description: 'Feature flags and system health checks are grouped here for safer launches, migrations, and operational changes.',
      },
    } as const;

    const activeCopy = copy[currentTab.id as keyof typeof copy] ?? copy.diagnostics;

    return (
      <LinkWorkspace
        title={activeCopy.title}
        description={activeCopy.description}
        links={sectionLinks[`operations_${currentTab.id}`] ?? sectionLinks.operations_diagnostics}
        tone={currentTab.id === 'rollout' ? 'amber' : currentTab.id === 'access' ? 'red' : 'blue'}
      />
    );
  }

  function renderStorage() {
    if (!currentTab) return null;

    if (currentTab.id === 'storage') {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Storage Driver">
            <Select value={settings.storage.driver} onChange={(e) => updateField('storage', 'driver', e.target.value)}>
              <option value="local">Local Disk</option>
              <option value="s3">Amazon S3</option>
              <option value="gcs">Google Cloud Storage</option>
              <option value="do_spaces">DigitalOcean Spaces</option>
            </Select>
          </TextField>
          <TextField label="Max Upload Size (MB)">
            <Input type="number" min={1} value={settings.storage.max_upload_mb} onChange={(e) => updateField('storage', 'max_upload_mb', Number(e.target.value))} />
          </TextField>
          <div className="md:col-span-2">
            <TextField label="Allowed Audio Formats">
              <Input value={settings.storage.allowed_audio_formats} onChange={(e) => updateField('storage', 'allowed_audio_formats', e.target.value)} />
            </TextField>
          </div>
          <div className="md:col-span-2">
            <TextField label="Allowed Image Formats">
              <Input value={settings.storage.allowed_image_formats} onChange={(e) => updateField('storage', 'allowed_image_formats', e.target.value)} />
            </TextField>
          </div>
        </div>
      );
    }

    if (currentTab.id === 'environment') {
      if (!isSuperAdmin) {
        return <SettingPanel title="Environment editor restricted" description="Only super admins can edit runtime environment values from this page." tone="amber" />;
      }

      if (environmentLoading && !environmentData) {
        return (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        );
      }

      if (environmentError) {
        return <SettingPanel title="Environment unavailable" description="Failed to load environment settings." tone="red" />;
      }

      return (
        <div className="space-y-5">
          <SettingPanel title="Runtime environment" description={environmentData?.data.frontend_note ?? 'Manage operational environment variables for the API runtime.'} tone="amber" />
          {environmentData?.data.groups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
              <div className="mb-4">
                <div className="font-semibold text-slate-800 dark:text-slate-100">{group.label}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{group.description}</div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {group.fields.map((field) => (
                  <TextField key={field.key} label={field.label} description={field.description}>
                    {field.type === 'boolean' ? (
                      <div className="flex min-h-12 items-center">
                        <ToggleSwitch
                          checked={Boolean(environmentDraft[field.key])}
                          onChange={(value) => setEnvironmentDraft((current) => ({ ...current, [field.key]: value }))}
                        />
                      </div>
                    ) : field.options?.length ? (
                      <Select
                        value={String(environmentDraft[field.key] ?? '')}
                        onChange={(e) => setEnvironmentDraft((current) => ({ ...current, [field.key]: e.target.value }))}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={field.secret ? 'password' : field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
                        value={String(environmentDraft[field.key] ?? '')}
                        onChange={(e) =>
                          setEnvironmentDraft((current) => ({
                            ...current,
                            [field.key]: field.type === 'integer' || field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
                          }))
                        }
                      />
                    )}
                  </TextField>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  function renderCurrentContent() {
    if (!currentSection || !currentTab) return null;

    switch (currentSection.id) {
      case 'general':
        return renderGeneral();
      case 'frontend':
        return renderFrontend();
      case 'users':
        return renderUsers();
      case 'credits':
        return renderCredits();
      case 'payments':
        return renderPayments();
      case 'notifications':
        return renderNotifications();
      case 'mobile':
        return renderMobileVerification();
      case 'security':
        return renderSecurity();
      case 'awards':
        return renderAwards();
      case 'events':
        return renderEvents();
      case 'artists':
        return renderArtists();
      case 'operations':
        return renderOperations();
      case 'storage':
        return renderStorage();
      default:
        return null;
    }
  }

  return (
    <div className="p-6 font-sans">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">System Settings</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="sticky top-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#101012]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search settings" className="pl-10" />
              </div>
            </div>

            {filteredSections.map((section) => (
              <SidebarCard key={section.id} section={section} active={activeSection === section.id} onClick={() => setActiveSection(section.id)} />
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          {currentSection && currentTab ? (
            <SectionCard
              title={currentSection.id === 'security' ? 'Security & Authentication' : currentSection.label}
              description={currentSection.id === 'security' ? 'Manage authentication, security, logging, and access control' : currentSection.subtitle}
              badge={
                currentSection.id === 'security' ? (
                  <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    {securityLevel} ({securityScore}%)
                  </div>
                ) : currentSection.id === 'payments' ? (
                  <div className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">
                    {settings.payments.zengapay_enabled ? 'ZengaPay Active' : 'Gateway Inactive'}
                  </div>
                ) : currentSection.id === 'storage' ? (
                  <div className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {settings.storage.driver.toUpperCase()}
                  </div>
                ) : undefined
              }
              tabs={currentSection.tabs.filter((tab) => (tab.mode === 'environment' ? isSuperAdmin : true))}
              activeTab={currentTab.id}
              onTabChange={(tabId) => setActiveTab(currentSection.id, tabId)}
            >
              {renderCurrentContent()}

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={currentTab.mode === 'links' || currentTab.mode === 'info' || (!isDirty && !environmentDirty)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saveEnvironment.isPending || saveSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {saveButtonLabel()}
                </button>
              </div>
            </SectionCard>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-[#101012] dark:text-slate-400">
              No settings section matches that search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
