const ADMIN_ROLE_NAMES = ["admin", "super admin", "super_admin"];
const ARTIST_ROLE_NAMES = ["artist"];

function normalizeRole(role: string | null | undefined): string {
  return role?.toLowerCase().trim() ?? "";
}

export function isAdminRole(role: string | null | undefined): boolean {
  return ADMIN_ROLE_NAMES.includes(normalizeRole(role));
}

export function isArtistRole(role: string | null | undefined): boolean {
  return ARTIST_ROLE_NAMES.includes(normalizeRole(role));
}

export function canAccessArtistStudio(role: string | null | undefined, isArtist = false): boolean {
  return isArtist || isArtistRole(role) || isAdminRole(role);
}
