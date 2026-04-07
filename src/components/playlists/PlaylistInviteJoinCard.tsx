'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Lock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useJoinPlaylistInvite } from '@/hooks/api';
import type { Playlist } from '@/types';

interface PlaylistInviteJoinCardProps {
  token: string;
  playlist: Playlist;
  requiresApproval: boolean;
  membership?: {
    status: string;
    role: string;
  } | null;
}

export function PlaylistInviteJoinCard({
  token,
  playlist,
  requiresApproval,
  membership,
}: PlaylistInviteJoinCardProps) {
  const router = useRouter();
  const joinInvite = useJoinPlaylistInvite();

  const joinLabel = membership?.status === 'accepted'
    ? 'Already joined'
    : membership?.status === 'pending'
      ? 'Awaiting approval'
      : requiresApproval
        ? 'Request to join'
        : 'Join playlist';

  return (
    <div className="mx-auto max-w-xl rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {playlist.artwork_url ? (
            <Image src={playlist.artwork_url} alt={playlist.name} fill className="object-cover" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Playlist invite</p>
          <h1 className="mt-2 text-2xl font-bold">{playlist.name}</h1>
          {playlist.description && (
            <p className="mt-2 text-sm text-muted-foreground">{playlist.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border px-3 py-1">{playlist.song_count ?? 0} songs</span>
            <span className="rounded-full border px-3 py-1">
              {requiresApproval ? 'Approval required' : 'Instant join'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        {requiresApproval
          ? 'Joining this playlist creates a request for the owner or an admin collaborator to approve.'
          : 'Once you join, you can collaborate immediately based on the role assigned to you.'}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            joinInvite.mutate(token, {
              onSuccess: () => {
                toast.success(requiresApproval ? 'Join request sent' : 'Playlist joined');
                router.refresh();
              },
              onError: () => {
                toast.error('Unable to join playlist right now');
              },
            });
          }}
          disabled={joinInvite.isPending || membership?.status === 'accepted' || membership?.status === 'pending'}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {joinInvite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : requiresApproval ? <Lock className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {joinLabel}
        </button>

        {membership?.status === 'accepted' && (
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
            <Check className="h-4 w-4 text-green-600" />
            Collaborator role: {membership.role}
          </div>
        )}
      </div>
    </div>
  );
}
