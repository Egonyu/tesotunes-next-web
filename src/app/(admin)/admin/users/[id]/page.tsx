'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { PageHeader, ConfirmDialog } from '@/components/admin';
import { Ban, Building2, CheckCircle, Edit, Mail, MapPin, Phone, Trash2, User, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { isModeratorOnlyRole } from '@/lib/roles';

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
  role: 'user' | 'artist' | 'moderator' | 'admin';
  is_active: boolean;
  email_verified_at?: string | null;
  avatar_url?: string | null;
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
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const { data: session } = useSession();
  const isModeratorOnly = isModeratorOnlyRole(session?.user?.role);

  const { data, isLoading } = useQuery({
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
        <div className="h-8 w-44 rounded bg-muted animate-pulse" />
        <div className="h-80 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">User not found</h2>
        <Link href="/admin/users" className="mt-2 inline-block text-primary hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  const displayName = user.name || user.full_name || user.username;

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayName}
        description={`@${user.username}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: displayName },
        ]}
        backHref="/admin/users"
        actions={
          <div className="flex items-center gap-2">
            {!isModeratorOnly && (
              <>
                <Link
                  href={`/admin/users/${id}/edit`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  <Edit className="h-4 w-4" />
                  Edit User
                </Link>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
                {user.avatar_url && (
                  <Image src={user.avatar_url} alt={displayName} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full border px-3 py-1 text-xs font-medium uppercase">{user.role}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {user.email_verified_at && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      <CheckCircle className="h-3 w-3" /> Email Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> {user.email}
              </div>
              {user.phone && (
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {user.phone}
                </div>
              )}
              {(user.city || user.country) && (
                <div className="inline-flex items-center gap-2 text-muted-foreground md:col-span-2">
                  <MapPin className="h-4 w-4" /> {[user.city, user.country].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Bio</p>
              <p className="mt-1 text-sm">{user.bio || 'No bio provided.'}</p>
            </div>
          </div>

          {user.event_organizer?.enabled && (
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Organizer Setup</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Business:</span> {user.event_organizer.business_name || 'Not set'}</div>
                <div><span className="text-muted-foreground">Support Email:</span> {user.event_organizer.support_email || 'Not set'}</div>
                <div><span className="text-muted-foreground">Support Phone:</span> {user.event_organizer.support_phone || 'Not set'}</div>
                <div><span className="text-muted-foreground">Ready:</span> {user.event_organizer.ready_for_events ? 'Yes' : 'Needs setup'}</div>
              </div>
              <div className="mt-4 rounded-lg border bg-muted/30 p-4 text-sm">
                <div className="inline-flex items-center gap-2 font-medium">
                  <Wallet className="h-4 w-4" />
                  Payout
                </div>
                <p className="mt-2 text-muted-foreground">Method: {user.event_organizer.payout_method || 'Not set'}</p>
                {user.event_organizer.payout_method === 'bank' ? (
                  <p className="text-muted-foreground">
                    {user.event_organizer.bank_name || 'Bank not set'} / {user.event_organizer.bank_account || 'Account not set'}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {user.event_organizer.mobile_money_provider || 'Provider not set'} / {user.event_organizer.mobile_money_number || 'Number not set'}
                  </p>
                )}
                {user.event_organizer.notes && (
                  <p className="mt-2 text-muted-foreground">{user.event_organizer.notes}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {!isModeratorOnly && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account Actions</h3>
              <div className="space-y-2">
                {user.is_active ? (
                  <button
                    onClick={() => setShowBanDialog(true)}
                    className="inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <Ban className="h-4 w-4" /> Ban User
                  </button>
                ) : (
                  <button
                    onClick={() => activateMutation.mutate()}
                    className="inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <CheckCircle className="h-4 w-4" /> Activate User
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-6 text-xs text-muted-foreground">
            <p>Created: {new Date(user.created_at).toLocaleString()}</p>
            <p className="mt-1">Updated: {new Date(user.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {!isModeratorOnly && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Deactivate User"
          description="This user will be deactivated."
          confirmLabel="Deactivate"
          variant="destructive"
          onConfirm={() => deleteMutation.mutate()}
        />
      )}

      {!isModeratorOnly && (
        <ConfirmDialog
          open={showBanDialog}
          onOpenChange={setShowBanDialog}
          title="Ban User"
          description="This action marks the account inactive and restricted."
          confirmLabel="Ban"
          variant="destructive"
          onConfirm={() => banMutation.mutate()}
        />
      )}
    </div>
  );
}
