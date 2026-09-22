'use client';

import { use, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Ban,
  Building2,
  Check,
  CheckCircle,
  Clipboard,
  CreditCard,
  Edit,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  KeyRound,
  Mail,
  MapPin,
  Music2,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  Trash2,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { ConfirmDialog, PageHeader } from '@/components/admin';
import { cn } from '@/lib/utils';
import { isModeratorOnlyRole } from '@/lib/roles';

type Risk = { severity: 'warning' | 'critical'; title: string; detail: string };
type AuditItem = {
  id: number;
  action: string;
  actor?: { id: number; name: string; email: string } | null;
  ip_address?: string | null;
  request_id?: string | null;
  trace_id?: string | null;
  created_at?: string | null;
};

type UserDetail = {
  id: number;
  uuid?: string;
  name: string;
  full_name?: string | null;
  username: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  role: string;
  active_roles: Array<{
    id: number;
    name: string;
    display_name: string;
    priority: number;
  }>;
  permissions: string[];
  is_active: boolean;
  email_verified_at?: string | null;
  avatar_url?: string | null;
  artist?: {
    id: number;
    stage_name: string;
    slug: string;
    status: string;
  } | null;
  created_at: string;
  updated_at: string;
  event_organizer?: {
    enabled: boolean;
    business_name?: string | null;
    support_email?: string | null;
    support_phone?: string | null;
    notes?: string | null;
    ready_for_events?: boolean;
    payout_method?: string | null;
    mobile_money_provider?: string | null;
    mobile_money_number?: string | null;
    bank_name?: string | null;
    bank_account?: string | null;
  } | null;
  review: {
    risks: Risk[];
    account: {
      is_online: boolean;
      last_seen_at?: string | null;
      last_login_at?: string | null;
      email_verified: boolean;
      phone_verified: boolean;
      two_factor_enabled: boolean;
      profile_completion_percentage: number;
      account_age_days?: number | null;
    };
    identity: {
      status: string;
      submitted_at?: string | null;
      verified_at?: string | null;
      expires_at?: string | null;
      rejection_reason?: string | null;
      documents: {
        total: number;
        pending: number;
        verified: number;
        rejected: number;
      };
    };
    wallet: {
      balance_ugx: number;
      credits: number;
      pin_set: boolean;
      pin_locked_until?: string | null;
      payments: {
        total: number;
        in_flight: number;
        completed: number;
        failed: number;
        completed_volume_ugx: number;
      };
    };
    activity: {
      songs: number;
      published_songs: number;
      playlists: number;
      comments: number;
      orders: { total: number; paid: number; failed: number };
    };
    capabilities: Array<{
      capability: string;
      label: string;
      status: string;
      status_reason?: string | null;
      applied_at?: string | null;
      granted_at?: string | null;
      updated_at?: string | null;
    }>;
    recent_audit: AuditItem[];
  };
};

const statusTone: Record<string, string> = {
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  granted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  pending_review: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  partial: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  revoked: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  none: 'bg-muted text-muted-foreground',
};

function formatDate(value?: string | null) {
  if (!value) return 'Never';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(value);
}

function sentence(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusPill({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
        statusTone[value] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {label ?? sentence(value)}
    </span>
  );
}

function Panel({
  title,
  icon,
  action,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border bg-card', className)}>
      <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-2 font-semibold">
          {icon}
          {title}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Metric({ label, value, detail, icon }: { label: string; value: ReactNode; detail?: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
    </div>
  );
}

function CopyValue({ label, value }: { label: string; value?: string | number | null }) {
  const [copied, setCopied] = useState(false);
  if (value === undefined || value === null || value === '') return null;

  return (
    <button
      type="button"
      className="group flex w-full items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-left"
      onClick={async () => {
        await navigator.clipboard.writeText(String(value));
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title={`Copy ${label}`}
    >
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="block truncate font-mono text-xs">{value}</span>
      </span>
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Clipboard className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
      )}
    </button>
  );
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const { data: session } = useSession();
  const isModeratorOnly = isModeratorOnlyRole(session?.user?.role);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => apiGet<{ data: UserDetail }>(`/admin/users/${id}`),
  });

  const user = data?.data;

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete<{ message?: string }>(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success('User deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      router.push('/admin/users');
    },
    onError: () => toast.error('Failed to deactivate user'),
  });

  const activateMutation = useMutation({
    mutationFn: () => apiPost<{ message?: string }>(`/admin/users/${id}/activate`),
    onSuccess: () => {
      toast.success('User activated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to activate user'),
  });

  const banMutation = useMutation({
    mutationFn: () => apiPost<{ message?: string }>(`/admin/users/${id}/ban`),
    onSuccess: () => {
      toast.success('User banned successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowBanDialog(false);
    },
    onError: () => toast.error('Failed to ban user'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-56 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-xl border bg-card py-14 text-center">
        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">{error ? 'Could not load this user' : 'User not found'}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'The account may have been removed or you may not have access.'}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Try again
          </button>
          <Link href="/admin/users" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.full_name || user.username;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const review = user.review;

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description={`User #${user.id} · @${user.username}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: displayName },
        ]}
        backHref="/admin/users"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} /> Refresh
            </button>
            <Link
              href={`/user/${user.username}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
            >
              Public profile <ExternalLink className="h-4 w-4" />
            </Link>
            {!isModeratorOnly && (
              <Link
                href={`/admin/users/${id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="h-4 w-4" /> Edit user
              </Link>
            )}
          </div>
        }
      />

      {review.risks.length > 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Needs attention</p>
              <div className="mt-2 grid gap-2 lg:grid-cols-2">
                {review.risks.map((risk) => (
                  <div key={risk.title} className="rounded-lg bg-background/70 px-3 py-2">
                    <p className={cn('text-sm font-medium', risk.severity === 'critical' && 'text-destructive')}>
                      {risk.title}
                    </p>
                    <p className="text-xs opacity-80">{risk.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <BadgeCheck className="h-5 w-5" /> No account review flags detected.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="KYC"
          value={<StatusPill value={review.identity.status} />}
          detail={`${review.identity.documents.total} documents · ${review.identity.documents.pending} pending`}
          icon={<FileCheck2 className="h-5 w-5" />}
        />
        <Metric
          label="Wallet"
          value={formatMoney(review.wallet.balance_ugx)}
          detail={`${review.wallet.credits.toLocaleString()} credits · ${review.wallet.payments.in_flight} payments in flight`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <Metric
          label="Music"
          value={review.activity.songs}
          detail={`${review.activity.published_songs} published · ${review.activity.playlists} playlists`}
          icon={<Music2 className="h-5 w-5" />}
        />
        <Metric
          label="Account health"
          value={
            review.risks.length === 0 ? 'Clear' : `${review.risks.length} flag${review.risks.length === 1 ? '' : 's'}`
          }
          detail={review.account.is_online ? 'Online now' : `Last seen ${formatDate(review.account.last_seen_at)}`}
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Panel title="Profile and contact" icon={<User className="h-5 w-5 text-primary" />}>
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted text-2xl font-semibold text-muted-foreground">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={displayName} fill sizes="96px" className="object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{displayName}</h2>
                  <StatusPill
                    value={user.is_active ? 'active' : 'rejected'}
                    label={user.is_active ? 'Active' : 'Inactive'}
                  />
                  {review.account.is_online && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
                <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{user.email}</span>
                    {review.account.email_verified && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone || 'No phone'}</span>
                    {review.account.phone_verified && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {[user.city, user.country].filter(Boolean).join(', ') || 'Location not provided'}
                  </div>
                </div>
                <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">{user.bio || 'No bio provided.'}</p>
              </div>
            </div>
          </Panel>

          <Panel
            title="Identity verification"
            icon={<Fingerprint className="h-5 w-5 text-primary" />}
            action={
              review.identity.status === 'pending_review' ? (
                <Link
                  href={`/admin/kyc?user=${user.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                >
                  Review KYC <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusPill value={review.identity.status} />
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd className="text-right">{formatDate(review.identity.submitted_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Verified</dt>
                    <dd className="text-right">{formatDate(review.identity.verified_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Expires</dt>
                    <dd className="text-right">{formatDate(review.identity.expires_at)}</dd>
                  </div>
                </dl>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Documents', review.identity.documents.total],
                  ['Pending', review.identity.documents.pending],
                  ['Verified', review.identity.documents.verified],
                  ['Rejected', review.identity.documents.rejected],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            {review.identity.rejection_reason && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                <strong>Resubmission reason:</strong> {review.identity.rejection_reason}
              </div>
            )}
          </Panel>

          <Panel title="Payments, orders and content" icon={<CreditCard className="h-5 w-5 text-primary" />}>
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payments</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt>Total attempts</dt>
                    <dd className="font-medium">{review.wallet.payments.total}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Completed</dt>
                    <dd className="font-medium text-emerald-600">{review.wallet.payments.completed}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Failed</dt>
                    <dd className="font-medium text-red-600">{review.wallet.payments.failed}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>UGX volume</dt>
                    <dd className="font-medium">{formatMoney(review.wallet.payments.completed_volume_ugx)}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Store orders</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt>Total</dt>
                    <dd className="font-medium">{review.activity.orders.total}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Paid</dt>
                    <dd className="font-medium text-emerald-600">{review.activity.orders.paid}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Failed</dt>
                    <dd className="font-medium text-red-600">{review.activity.orders.failed}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt>Songs</dt>
                    <dd className="font-medium">{review.activity.songs}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Published</dt>
                    <dd className="font-medium">{review.activity.published_songs}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Playlists</dt>
                    <dd className="font-medium">{review.activity.playlists}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Comments</dt>
                    <dd className="font-medium">{review.activity.comments}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Panel>

          <Panel
            title="Recent audit trail"
            icon={<Activity className="h-5 w-5 text-primary" />}
            action={<span className="text-xs text-muted-foreground">Latest 10</span>}
          >
            {review.recent_audit.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No audit events recorded for this account.
              </p>
            ) : (
              <div className="divide-y">
                {review.recent_audit.map((item) => (
                  <div key={item.id} className="grid gap-2 py-3 first:pt-0 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="text-sm font-medium">{sentence(item.action)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.actor?.name || 'System'} · {formatDate(item.created_at)}
                        {item.ip_address ? ` · ${item.ip_address}` : ''}
                      </p>
                    </div>
                    {(item.request_id || item.trace_id) && (
                      <span
                        className="self-center font-mono text-[10px] text-muted-foreground"
                        title={item.trace_id || item.request_id || ''}
                      >
                        {(item.trace_id || item.request_id)?.slice(0, 18)}…
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {user.event_organizer?.enabled && (
            <Panel title="Organizer setup" icon={<Building2 className="h-5 w-5 text-primary" />}>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Business:</span>{' '}
                  {user.event_organizer.business_name || 'Not set'}
                </div>
                <div>
                  <span className="text-muted-foreground">Ready:</span>{' '}
                  {user.event_organizer.ready_for_events ? 'Yes' : 'Needs setup'}
                </div>
                <div>
                  <span className="text-muted-foreground">Support email:</span>{' '}
                  {user.event_organizer.support_email || 'Not set'}
                </div>
                <div>
                  <span className="text-muted-foreground">Support phone:</span>{' '}
                  {user.event_organizer.support_phone || 'Not set'}
                </div>
              </div>
              <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="font-medium">Payout · {user.event_organizer.payout_method || 'Not set'}</p>
                <p className="mt-1 text-muted-foreground">
                  {user.event_organizer.payout_method === 'bank'
                    ? `${user.event_organizer.bank_name || 'Bank not set'} / ${user.event_organizer.bank_account || 'Account not set'}`
                    : `${user.event_organizer.mobile_money_provider || 'Provider not set'} / ${user.event_organizer.mobile_money_number || 'Number not set'}`}
                </p>
              </div>
            </Panel>
          )}
        </div>

        <aside className="space-y-6">
          <Panel title="Account security" icon={<Shield className="h-5 w-5 text-primary" />}>
            <dl className="space-y-3 text-sm">
              {[
                ['Email verified', review.account.email_verified],
                ['Phone verified', review.account.phone_verified],
                ['Two-factor authentication', review.account.two_factor_enabled],
                ['Wallet PIN', review.wallet.pin_set],
              ].map(([label, enabled]) => (
                <div key={String(label)} className="flex items-center justify-between gap-3">
                  <dt>{label}</dt>
                  <dd className={cn('font-medium', enabled ? 'text-emerald-600' : 'text-amber-600')}>
                    {enabled ? 'Yes' : 'No'}
                  </dd>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Profile complete</dt>
                  <dd className="font-medium">{review.account.profile_completion_percentage}%</dd>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, review.account.profile_completion_percentage)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Last login</dt>
                <dd className="text-right">{formatDate(review.account.last_login_at)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Account age</dt>
                <dd>{review.account.account_age_days ?? 0} days</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Access and capabilities" icon={<KeyRound className="h-5 w-5 text-primary" />}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(user.active_roles.length
                  ? user.active_roles
                  : [
                      {
                        id: 0,
                        name: user.role,
                        display_name: sentence(user.role),
                        priority: 0,
                      },
                    ]
                ).map((role) => (
                  <StatusPill key={role.id || role.name} value="partial" label={role.display_name} />
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Capabilities</p>
              {review.capabilities.length ? (
                <div className="mt-2 space-y-2">
                  {review.capabilities.map((grant) => (
                    <div key={grant.capability} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{grant.label}</span>
                        <StatusPill value={grant.status} />
                      </div>
                      {grant.status_reason && (
                        <p className="mt-1 text-xs text-muted-foreground">{grant.status_reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No capability grants.</p>
              )}
            </div>
            <details className="mt-5 border-t pt-4">
              <summary className="cursor-pointer text-sm font-medium">
                {user.permissions.length} effective permissions
              </summary>
              <div className="mt-3 max-h-52 space-y-1 overflow-auto">
                {user.permissions.map((permission) => (
                  <div key={permission} className="rounded bg-muted/50 px-2 py-1 font-mono text-[11px]">
                    {permission}
                  </div>
                ))}
              </div>
            </details>
          </Panel>

          <Panel title="Identifiers" icon={<Fingerprint className="h-5 w-5 text-primary" />}>
            <div className="space-y-2">
              <CopyValue label="User ID" value={user.id} />
              <CopyValue label="UUID" value={user.uuid} />
              <CopyValue label="Username" value={user.username} />
              {user.artist && <CopyValue label="Artist ID" value={user.artist.id} />}
            </div>
            {user.artist && (
              <Link
                href={`/artists/${user.artist.slug}`}
                target="_blank"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {user.artist.stage_name} artist page <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </Panel>

          {!isModeratorOnly && (
            <Panel title="Account actions" icon={<Users className="h-5 w-5 text-primary" />}>
              <div className="space-y-2">
                {user.is_active ? (
                  <button
                    type="button"
                    onClick={() => setShowBanDialog(true)}
                    className="inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <Ban className="h-4 w-4" /> Ban user
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => activateMutation.mutate()}
                    disabled={activateMutation.isPending}
                    className="inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-60"
                  >
                    <CheckCircle className="h-4 w-4" /> Activate user
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="inline-flex w-full items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" /> Deactivate account
                </button>
              </div>
            </Panel>
          )}

          <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
            <p>Created: {formatDate(user.created_at)}</p>
            <p className="mt-1">Updated: {formatDate(user.updated_at)}</p>
          </div>
        </aside>
      </div>

      {!isModeratorOnly && (
        <>
          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Deactivate user"
            description="This user will lose access until an administrator reactivates the account."
            confirmLabel="Deactivate"
            variant="destructive"
            onConfirm={() => deleteMutation.mutate()}
          />
          <ConfirmDialog
            open={showBanDialog}
            onOpenChange={setShowBanDialog}
            title="Ban user"
            description="This marks the account inactive and restricts protected actions."
            confirmLabel="Ban"
            variant="destructive"
            onConfirm={() => banMutation.mutate()}
          />
        </>
      )}
    </div>
  );
}
