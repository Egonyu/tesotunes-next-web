import { hasAnyPermission } from './permissions';
import { isAdminRole, isModeratorRole, isPrivilegedAdminRole } from './roles';

export const MODERATOR_DEFAULT_ADMIN_PERMISSIONS = [
  'song.view',
  'song.edit',
  'song.upload',
  'song.review',
  'artist.view',
  'artist.edit',
  'artist.review',
  'music.moderate',
  'view-reports',
  'manage-reports',
  'moderate-content',
  'report.handle',
  'catalog.claim.review',
  'comment.moderate',
  'user.moderate',
  'view-users',
];

const MODERATOR_ENTRY_CANDIDATES: Array<{ href: string; permissions: string[] }> = [
  { href: '/admin/songs?status=pending', permissions: ['song.review', 'song.view', 'song.edit', 'song.upload', 'music.moderate'] },
  { href: '/admin/artists', permissions: ['artist.review', 'artist.view', 'artist.edit'] },
  { href: '/admin/reports', permissions: ['manage-reports', 'view-reports', 'admin.reports', 'moderate-content', 'report.handle'] },
  { href: '/admin/catalog/claims', permissions: ['catalog.claim.review'] },
  { href: '/admin/catalog', permissions: ['catalog.view', 'catalog.upload'] },
  { href: '/admin/users', permissions: ['view-users', 'manage-users', 'admin.users', 'user.view', 'user.moderate'] },
];

export function canAccessAdminShell(role: string | null | undefined): boolean {
  return isPrivilegedAdminRole(role);
}

export function getEffectiveAdminPermissions(
  role: string | null | undefined,
  permissions: string[] | null | undefined
): string[] {
  const grantedPermissions = permissions ?? [];

  if (!isModeratorRole(role)) {
    return grantedPermissions;
  }

  return Array.from(new Set([...grantedPermissions, ...MODERATOR_DEFAULT_ADMIN_PERMISSIONS]));
}

export function getAdminEntryPath(
  role: string | null | undefined,
  permissions: string[] | null | undefined
): string | null {
  if (isAdminRole(role)) {
    return '/admin';
  }

  if (!isModeratorRole(role)) {
    return null;
  }

  const grantedPermissions = permissions ?? [];

  for (const candidate of MODERATOR_ENTRY_CANDIDATES) {
    if (hasAnyPermission(grantedPermissions, candidate.permissions)) {
      return candidate.href;
    }
  }

  // Moderators without an explicitly-granted workspace permission fall back to
  // the reports/moderation queue — the safe default moderation workspace.
  // (Role defaults always include reporting permissions, so this route is
  // always reachable; see MODERATOR_DEFAULT_ADMIN_PERMISSIONS.)
  return '/admin/reports';
}
