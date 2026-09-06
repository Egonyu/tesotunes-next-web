import { useSession } from 'next-auth/react';

const CREATOR_ROLES = new Set(['artist', 'admin', 'super_admin']);

/**
 * Whether this account can actually open the creator studio at /artist/*.
 *
 * Middleware guards those routes on the session token — role, isArtist,
 * isEventOrganizer — so anything that decides from a different source will
 * eventually disagree with it and offer a link that bounces to sign-in. This
 * reads the same token, so a rendered creator link is one that will open.
 */
export function useCreatorAccess(): boolean {
  const { data: session } = useSession();

  if (!session?.user) {
    return false;
  }

  const user = session.user as {
    role?: string;
    isArtist?: boolean;
    isEventOrganizer?: boolean;
  };

  return (
    CREATOR_ROLES.has((user.role ?? '').toLowerCase()) ||
    Boolean(user.isArtist) ||
    Boolean(user.isEventOrganizer)
  );
}
