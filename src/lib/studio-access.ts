/**
 * Who may open the creator studio at /artist/*.
 *
 * The studio is shared. Promotions and store live under /artist/* but belong to
 * whoever holds the promoter or seller capability, artist or not — which is
 * what the (artist) layout has always intended. Gating the whole tree on the
 * artist role locked sellers out of their own sections, so those two subtrees
 * admit their capability holders while everything else stays artist-only.
 *
 * Kept as a pure function so middleware and the client hooks decide from one
 * rule rather than drifting apart, which is how the original bug arose.
 */

const ADMIN_ROLES = new Set(['admin', 'super admin', 'super_admin', 'moderator', 'content_moderator']);
const ARTIST_ROLES = new Set(['artist']);

/** Capabilities that own a studio section without being an artist. */
export const SELLER_CAPABILITIES = ['promoter', 'seller'] as const;

/** Studio subtrees a seller capability unlocks on its own. */
const SELLER_SUBTREES = ['/artist/promotions', '/artist/store'];

export interface StudioIdentity {
  role?: string | null;
  isArtist?: boolean;
  isEventOrganizer?: boolean;
  capabilities?: string[] | null;
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function holdsSellerCapability(identity: StudioIdentity): boolean {
  const capabilities = identity.capabilities ?? [];

  return SELLER_CAPABILITIES.some((capability) => capabilities.includes(capability));
}

/** True for accounts that may open any part of the studio. */
export function hasFullStudioAccess(identity: StudioIdentity): boolean {
  const role = (identity.role ?? '').trim().toLowerCase();

  return (
    ADMIN_ROLES.has(role) ||
    ARTIST_ROLES.has(role) ||
    Boolean(identity.isArtist) ||
    Boolean(identity.isEventOrganizer)
  );
}

/** True when this account may open this particular studio path. */
export function canEnterStudioPath(pathname: string, identity: StudioIdentity): boolean {
  if (hasFullStudioAccess(identity)) {
    return true;
  }

  const inSellerSubtree = SELLER_SUBTREES.some((subtree) => matchesPrefix(pathname, subtree));

  return inSellerSubtree && holdsSellerCapability(identity);
}
