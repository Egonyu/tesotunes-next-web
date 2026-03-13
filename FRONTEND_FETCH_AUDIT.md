# Frontend Fetch Audit

**Updated:** March 13, 2026  
**Scope:** `tesotunes-next-web`

This note classifies the remaining direct `fetch()` usage in the Next.js frontend so Phase 4 can reduce accidental client fragmentation without deleting intentional runtime behavior.

## Current Classification

### Keep: server/runtime boundary fetches

These are appropriate direct `fetch()` calls because they live at framework or auth boundaries:

- [src/app/api/backend/[...path]/route.ts](/abs/path/C:/Users/egony/Project/tesotunes-next-web/src/app/api/backend/[...path]/route.ts)
  - Next.js server proxy to Laravel
- [src/app/api/auth/register/route.ts](/abs/path/C:/Users/egony/Project/tesotunes-next-web/src/app/api/auth/register/route.ts)
  - Next.js route handler forwarding register requests
- [src/lib/auth.ts](/abs/path/C:/Users/egony/Project/tesotunes-next-web/src/lib/auth.ts)
  - NextAuth credentials login and server-side role refresh
- [src/lib/api.ts](/abs/path/C:/Users/egony/Project/tesotunes-next-web/src/lib/api.ts)
  - `serverFetch()` wrapper for server-side reads

### Keep: intentional public tracking fetches

- [src/hooks/useAds.ts](/abs/path/C:/Users/egony/Project/tesotunes-next-web/src/hooks/useAds.ts)
  - ad impression and click pings
  - `sendBeacon()` first, `fetch(..., { keepalive: true })` fallback
  - should remain outside the normal shared API client

### Candidate for normalization

- [src/app/(auth)/register/page.tsx](/abs/path/C:/Users/egony/Project/tesotunes-next-web/src/app/(auth)/register/page.tsx)
  - browser form submit to `/api/auth/register`
  - valid today, but could move behind a tiny shared auth form helper later

## Read

The remaining direct `fetch()` usage is now mostly intentional. The frontend no longer has broad random direct network calls spread through normal feature pages.

What remains is:

- framework/server boundary fetches
- auth boundary fetches
- fire-and-forget public tracking fetches
- one browser registration form path

## Next Recommended Cleanup

1. Remove generated frontend artifacts from source control and keep them ignored.
2. Optionally normalize the register page submit path behind a shared helper.
3. Leave proxy/auth/server fetches alone unless the auth architecture changes again.
