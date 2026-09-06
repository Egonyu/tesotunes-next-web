import { useSession } from 'next-auth/react';
import {
  hasFullStudioAccess,
  holdsSellerCapability,
  type StudioIdentity,
} from '@/lib/studio-access';

function useStudioIdentity(): StudioIdentity | null {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const user = session.user as {
    role?: string;
    isArtist?: boolean;
    isEventOrganizer?: boolean;
    capabilities?: string[];
  };

  return {
    role: user.role,
    isArtist: user.isArtist,
    isEventOrganizer: user.isEventOrganizer,
    capabilities: user.capabilities,
  };
}

/**
 * Whether this account can open the creator studio at /artist/*.
 *
 * Middleware guards those routes with the same rule from the same session
 * token, so a creator link that renders is one that opens. Deciding from any
 * other source is how the two drifted apart and produced a Dashboard button
 * that bounced to sign-in.
 */
export function useCreatorAccess(): boolean {
  const identity = useStudioIdentity();

  return identity ? hasFullStudioAccess(identity) : false;
}

/**
 * Whether this account can open the seller sections — /artist/promotions and
 * /artist/store — which promoters and sellers hold without being artists.
 */
export function useSellerAccess(): boolean {
  const identity = useStudioIdentity();

  if (!identity) {
    return false;
  }

  return hasFullStudioAccess(identity) || holdsSellerCapability(identity);
}
