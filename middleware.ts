import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROLE_NAMES = new Set(['admin', 'super admin', 'super_admin']);

const ADMIN_PERMISSION_RULES: Array<{ prefix: string; permissions: string[] }> = [
  { prefix: '/admin/roles', permissions: ['manage-roles', 'admin.settings', 'admin.users'] },
  { prefix: '/admin/settings', permissions: ['manage-settings', 'admin.settings'] },
  { prefix: '/admin/feature-flags', permissions: ['admin.settings'] },
  { prefix: '/admin/audit-logs', permissions: ['admin.settings'] },
  { prefix: '/admin/security', permissions: ['admin.settings'] },
  { prefix: '/admin/system', permissions: ['admin.settings'] },
  { prefix: '/admin/payments', permissions: ['manage-payments', 'payment.manage', 'admin.payments'] },
  { prefix: '/admin/reports', permissions: ['view-reports', 'admin.reports'] },
  { prefix: '/admin/analytics', permissions: ['view-analytics', 'admin.reports'] },
  { prefix: '/admin/catalog/claims', permissions: ['catalog.claim.review'] },
  { prefix: '/admin/catalog', permissions: ['catalog.view', 'catalog.upload'] },
  { prefix: '/admin/sacco', permissions: ['manage-sacco'] },
  { prefix: '/admin/users', permissions: ['view-users', 'manage-users', 'user.view', 'admin.users'] },
];

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

function hasPermission(grantedPermissions: string[], requiredPermission: string): boolean {
  const required = normalize(requiredPermission);
  if (!required) return false;

  const granted = grantedPermissions.map(normalize).filter(Boolean);
  if (granted.includes('*')) return true;

  return granted.some((permission) => {
    if (permission === required) return true;
    if (!permission.includes('*')) return false;
    return wildcardToRegex(permission).test(required);
  });
}

function hasAnyPermission(grantedPermissions: string[], requiredPermissions: string[]): boolean {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.some((permission) => hasPermission(grantedPermissions, permission));
}

function getRequiredPermissions(pathname: string): string[] {
  for (const rule of ADMIN_PERMISSION_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule.permissions;
    }
  }

  return [];
}

function redirectToAccessRequired(request: NextRequest, reason: 'auth' | 'forbidden') {
  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const redirectUrl = new URL('/access-required', request.url);
  redirectUrl.searchParams.set('reason', reason);
  redirectUrl.searchParams.set('callbackUrl', callbackUrl);
  return NextResponse.redirect(redirectUrl);
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return redirectToAccessRequired(request, 'auth');
  }

  const role = normalize((token.role as string | undefined) ?? '');
  if (!ADMIN_ROLE_NAMES.has(role)) {
    return redirectToAccessRequired(request, 'forbidden');
  }

  const requiredPermissions = getRequiredPermissions(request.nextUrl.pathname);
  if (requiredPermissions.length === 0) {
    return NextResponse.next();
  }

  const grantedPermissions = Array.isArray(token.permissions)
    ? token.permissions.filter((permission): permission is string => typeof permission === 'string')
    : [];

  if (grantedPermissions.length === 0) {
    return NextResponse.next();
  }

  if (!hasAnyPermission(grantedPermissions, requiredPermissions)) {
    return redirectToAccessRequired(request, 'forbidden');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
