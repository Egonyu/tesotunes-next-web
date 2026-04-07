import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import type { Playlist } from '@/types';
import { PlaylistInviteJoinCard } from '@/components/playlists/PlaylistInviteJoinCard';

interface PlaylistInvitePageProps {
  params: Promise<{ token: string }>;
}

async function getInvitePreview(token: string) {
  try {
    return await serverFetch<{
      data: {
        playlist: Playlist;
        requires_approval: boolean;
        expires_at?: string | null;
        membership?: {
          status: string;
          role: string;
        } | null;
      };
    }>(`/playlists/invites/${token}`);
  } catch {
    return null;
  }
}

export default async function PlaylistInvitePage({ params }: PlaylistInvitePageProps) {
  const { token } = await params;
  const invite = await getInvitePreview(token);

  if (!invite) {
    notFound();
  }

  return (
    <div className="min-h-[70vh] px-6 py-12">
      <PlaylistInviteJoinCard
        token={token}
        playlist={invite.data.playlist}
        requiresApproval={invite.data.requires_approval}
        membership={invite.data.membership}
      />
    </div>
  );
}
