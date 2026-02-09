'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Edit, Trash2, User, Mail, Phone, MapPin, Calendar,
  Shield, CheckCircle, XCircle, Ban, Music, Heart,
  Headphones, Clock, CreditCard, AlertTriangle
} from 'lucide-react';
import { PageHeader, StatusBadge, ConfirmDialog } from '@/components/admin';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  country: string;
  city: string;
  bio: string;
  avatar_url: string;
  role: string;
  status: string;
  email_verified_at: string | null;
  is_artist: boolean;
  artist?: { id: string; name: string; slug: string };
  subscription?: {
    plan: string;
    status: string;
    ends_at: string;
  };
  stats: {
    playlists: number;
    followers: number;
    following: number;
    total_plays: number;
    listening_time: number;
    liked_songs: number;
  };
  recent_activity: {
    type: string;
    description: string;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

const roleColors: Record<string, string> = {
  user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  artist: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  moderator: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  admin: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  super_admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => apiGet<{ data: UserDetail }>(`/admin/users/${id}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      router.push('/admin/users');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: () => apiPost(`/admin/users/${id}/suspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      setShowSuspendDialog(false);
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => apiPost(`/admin/users/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: () => apiPost(`/admin/users/${id}/verify-email`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => apiPost(`/admin/users/${id}/reset-password`),
    onSuccess: () => {
      alert('Password reset email sent to user');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user?.data) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">User not found</h2>
        <Link href="/admin/users" className="text-primary hover:underline mt-2 inline-block">
          Back to users
        </Link>
      </div>
    );
  }

  const u = user.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={u.name}
        description={`@${u.username}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: u.name },
        ]}
        backHref="/admin/users"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/users/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Card */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                {u.avatar_url ? (
                  <Image
                    src={u.avatar_url}
                    alt={u.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{u.name}</h2>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${roleColors[u.role] || roleColors.user}`}>
                    {u.role.toUpperCase()}
                  </span>
                  <StatusBadge status={u.status} />
                </div>
                
                <p className="text-muted-foreground mb-4">@{u.username}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{u.email}</span>
                    {u.email_verified_at ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                  {(u.city || u.country) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[u.city, u.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {u.bio && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-muted-foreground">{u.bio}</p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Headphones className="h-4 w-4" />
                <span className="text-sm">Total Plays</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(u.stats.total_plays)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Listening Time</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(u.stats.listening_time)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Liked Songs</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(u.stats.liked_songs)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Music className="h-4 w-4" />
                <span className="text-sm">Playlists</span>
              </div>
              <p className="text-2xl font-bold">{u.stats.playlists}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                <span className="text-sm">Followers</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(u.stats.followers)}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                <span className="text-sm">Following</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(u.stats.following)}</p>
            </div>
          </div>

          {/* Recent Activity */}
          {u.recent_activity?.length > 0 && (
            <div className="rounded-xl border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="divide-y">
                {u.recent_activity.map((activity, index) => (
                  <div key={index} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {u.status === 'suspended' ? (
                <button
                  onClick={() => activateMutation.mutate()}
                  className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2 text-green-600"
                  disabled={activateMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4" />
                  Activate Account
                </button>
              ) : (
                <button
                  onClick={() => setShowSuspendDialog(true)}
                  className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2 text-orange-600"
                >
                  <Ban className="h-4 w-4" />
                  Suspend Account
                </button>
              )}
              
              {!u.email_verified_at && (
                <button
                  onClick={() => verifyEmailMutation.mutate()}
                  className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
                  disabled={verifyEmailMutation.isPending}
                >
                  <Mail className="h-4 w-4" />
                  Verify Email
                </button>
              )}
              
              <button
                onClick={() => resetPasswordMutation.mutate()}
                className="w-full px-4 py-2 text-left border rounded-lg hover:bg-muted flex items-center gap-2"
                disabled={resetPasswordMutation.isPending}
              >
                <Shield className="h-4 w-4" />
                Send Password Reset
              </button>
            </div>
          </div>

          {/* Artist Link */}
          {u.is_artist && u.artist && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Music className="h-4 w-4" />
                Artist Profile
              </h3>
              <Link
                href={`/admin/artists/${u.artist.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Music className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{u.artist.name}</p>
                  <p className="text-xs text-muted-foreground">View artist profile</p>
                </div>
              </Link>
            </div>
          )}

          {/* Subscription */}
          {u.subscription && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="font-medium capitalize">{u.subscription.plan}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={u.subscription.status} />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expires</dt>
                  <dd>{new Date(u.subscription.ends_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Account Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Joined</dt>
                <dd>{new Date(u.created_at).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last Login</dt>
                <dd>{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(u.updated_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete User"
        description={`Are you sure you want to delete "${u.name}"? This will permanently remove their account and all associated data.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />

      <ConfirmDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        title="Suspend User"
        description={`Are you sure you want to suspend "${u.name}"? They will not be able to access their account until reactivated.`}
        confirmLabel="Suspend"
        variant="destructive"
        isLoading={suspendMutation.isPending}
        onConfirm={() => suspendMutation.mutate()}
      />
    </div>
  );
}
