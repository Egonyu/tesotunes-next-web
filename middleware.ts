import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const MODERATOR_ROLE_NAMES = new Set([
  'moderator',
  'content moderator',
  'content_moderator',
  'content-moderator',
  'forum moderator',
  'forum_moderator',
  'forum-moderator',
  'catalog moderator',
  'catalog_moderator',
  'catalog-moderator',
]);
const ADMIN_ROLE_NAMES = new Set(['admin', 'super admin', 'super_admin', ...MODERATOR_ROLE_NAMES]);
const UNRESTRICTED_ADMIN_ROLE_NAMES = new Set(['super admin', 'super_admin']);
const ARTIST_ROLE_NAMES = new Set(['artist']);
const MODERATOR_DEFAULT_ADMIN_PERMISSIONS = [
  'view-reports',
  'manage-reports',
  'moderate-content',
  'report.handle',
  'catalog.claim.review',
  'music.moderate',
  'comment.moderate',
  'user.moderate',
];
const NEXTAUTH_SESSION_COOKIE_CANDIDATES = [
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
];

const AUTH_REQUIRED_ROUTE_PREFIXES = [
  '/admin',
  '/artist',
  '/artist-dashboard',
  '/credits',
  '/history',
  '/library',
  '/messages',
  '/notifications',
  '/profile',
  '/referrals',
  '/sacco',
  '/settings',
  '/tickets',
  '/transactions',
  '/wallet',
];

const ADMIN_PERMISSION_RULES: Array<{ prefix: string; permissions: string[] }> = [
  { prefix: '/admin/roles', permissions: ['manage-roles', 'manage-settings', 'manage-users', 'admin.settings', 'admin.users'] },
  { prefix: '/admin/settings', permissions: ['manage-settings', 'admin.settings'] },
  { prefix: '/admin/feature-flags', permissions: ['admin.settings'] },
  { prefix: '/admin/audit-logs', permissions: ['admin.settings'] },
  { prefix: '/admin/security', permissions: ['admin.settings'] },
  { prefix: '/admin/system', permissions: ['admin.settings'] },
  { prefix: '/admin/payments', permissions: ['manage-payments', 'payment.manage', 'admin.payments'] },
  { prefix: '/admin/reports', permissions: ['view-reports', 'admin.reports', 'manage-reports', 'moderate-content', 'report.handle'] },
  { prefix: '/admin/analytics', permissions: ['view-analytics', 'admin.reports'] },
  { prefix: '/admin/catalog/claims', permissions: ['catalog.claim.review'] },
  { prefix: '/admin/catalog', permissions: ['catalog.view', 'catalog.upload'] },
  { prefix: '/admin/sacco', permissions: ['manage-sacco'] },
  { prefix: '/admin/users', permissions: ['view-users', 'manage-users', 'user.view', 'user.moderate', 'admin.users'] },
];

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function isModeratorRole(role: string): boolean {
  return MODERATOR_ROLE_NAMES.has(role);
}

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isAuthProtectedPath(pathname: string): boolean {
  return AUTH_REQUIRED_ROUTE_PREFIXES.some((prefix) => matchesRoutePrefix(pathname, prefix));
}

function hasApiAccess(token: Record<string, unknown> | null): boolean {
  return Boolean(token?.accessToken);
}

async function resolveAuthToken(request: NextRequest) {
  const baseOptions = {
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  };

  const directToken = await getToken(baseOptions);
  if (directToken) {
    return directToken;
  }

  for (const cookieName of NEXTAUTH_SESSION_COOKIE_CANDIDATES) {
    if (!request.cookies.has(cookieName)) {
      continue;
    }

    const token = await getToken({
      ...baseOptions,
      cookieName,
      secureCookie: cookieName.startsWith('__Secure-'),
    });

    if (token) {
      return token;
    }
  }

  return null;
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
  const pathname = request.nextUrl.pathname;
  const hostname = request.nextUrl.hostname.toLowerCase();

  // Redirect bare domain and old domain to canonical www domain
  if (hostname === "tesotunes.com" || hostname === "engine.tesotunes.com") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.hostname = "www.tesotunes.com";
    // Map old engine.tesotunes.com paths to best equivalent
    if (hostname === "engine.tesotunes.com") {
      const legacyMap: Record<string, string> = {
        '/discover': '/',
        '/cart': '/store',
        '/settings/subscription': '/settings',
        '/page/cookies-and-personal-data': '/legal',
      };
      const mapped = legacyMap[redirectUrl.pathname];
      if (mapped) redirectUrl.pathname = mapped;
      redirectUrl.search = '';
    }
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (!isAuthProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = await resolveAuthToken(request);

  if (!token || !hasApiAccess(token)) {
    return redirectToAccessRequired(request, 'auth');
  }

  if (matchesRoutePrefix(pathname, '/artist') || matchesRoutePrefix(pathname, '/artist-dashboard')) {
    const role = normalize((token.role as string | undefined) ?? '');
    const isArtist = Boolean(token.isArtist);
    const isEventOrganizer = Boolean(token.isEventOrganizer);

    if (!ADMIN_ROLE_NAMES.has(role) && !ARTIST_ROLE_NAMES.has(role) && !isArtist && !isEventOrganizer) {
      return redirectToAccessRequired(request, 'forbidden');
    }
  }

  if (matchesRoutePrefix(pathname, '/admin')) {
    const role = normalize((token.role as string | undefined) ?? '');
    if (!ADMIN_ROLE_NAMES.has(role)) {
      return redirectToAccessRequired(request, 'forbidden');
    }

    if (UNRESTRICTED_ADMIN_ROLE_NAMES.has(role)) {
      return NextResponse.next();
    }

    const requiredPermissions = getRequiredPermissions(pathname);
    if (requiredPermissions.length === 0) {
      return NextResponse.next();
    }

    const grantedPermissions = Array.isArray(token.permissions)
      ? token.permissions.filter((permission): permission is string => typeof permission === 'string')
      : [];
    const effectivePermissions = isModeratorRole(role)
      ? Array.from(new Set([...grantedPermissions, ...MODERATOR_DEFAULT_ADMIN_PERMISSIONS]))
      : grantedPermissions;

    if (effectivePermissions.length === 0) {
      return redirectToAccessRequired(request, 'forbidden');
    }

    if (!hasAnyPermission(effectivePermissions, requiredPermissions)) {
      return redirectToAccessRequired(request, 'forbidden');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)',
  ],
};
