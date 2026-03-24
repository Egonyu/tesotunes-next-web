function normalizePermission(permission: string | null | undefined): string {
  return permission?.trim().toLowerCase() ?? '';
}

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

export function hasPermission(
  grantedPermissions: string[] | null | undefined,
  requiredPermission: string
): boolean {
  const required = normalizePermission(requiredPermission);
  if (!required) return false;

  const granted = (grantedPermissions ?? []).map(normalizePermission).filter(Boolean);
  if (granted.includes('*')) return true;

  return granted.some((permission) => {
    if (permission === required) return true;
    if (!permission.includes('*')) return false;
    return wildcardToRegex(permission).test(required);
  });
}

export function hasAnyPermission(
  grantedPermissions: string[] | null | undefined,
  requiredPermissions: string[]
): boolean {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.some((permission) => hasPermission(grantedPermissions, permission));
}
