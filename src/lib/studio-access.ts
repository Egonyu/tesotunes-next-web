/**
 * Who may open the creator studio at /artist/*.
 *
 * The studio is shared. The store section belongs to whoever holds the seller
 * capability, artist or not, so that subtree admits sellers while everything
 * else stays artist-only. Promoters used to be let in the same way for
 * /artist/promotions; promoter work now lives in its own workspace at
 * /promoter (outside the studio), and the old URLs redirect there.
 *
 * Kept as a pure function so middleware and the client hooks decide from one
 * rule rather than drifting apart, which is how the original bug arose.
 */

const ADMIN_ROLES = new Set(['admin', 'super admin', 'super_admin', 'moderator', 'content_moderator']);
const ARTIST_ROLES = new Set(['artist']);

/** Capabilities that own a studio section without being an artist. */
export const SELLER_CAPABILITIES = ['seller'] as const;

/** Studio subtrees a seller capability unlocks on its own. */
const SELLER_SUBTREES = ['/artist/store'];

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

/** True for accounts that may use the /promoter workspace. */
export function isPromoterIdentity(identity: StudioIdentity): boolean {
  const role = (identity.role ?? '').trim().toLowerCase();

  return ADMIN_ROLES.has(role) || (identity.capabilities ?? []).includes('promoter');
}
