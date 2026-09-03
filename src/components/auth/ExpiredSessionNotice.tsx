'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import AccessNotice from '@/components/auth/AccessNotice';

/**
 * Shown when the API token behind a session has lapsed.
 *
 * The session cookie is set to live 30 days; the Sanctum token it carries
 * lasts 24 hours and is refreshed at 12-hour intervals. Someone away longer
 * than a day returns with a cookie the browser still considers valid, wrapping
 * a token that is long dead — so every protected page bounced them to a bare
 * "sign in required" that read like a broken link rather than an expiry.
 *
 * Clearing the cookie here is what aligns the two. Note that the fix is not to
 * shorten the cookie to match the token: an active session refreshes happily
 * for the full 30 days, and a fixed 24-hour cookie would log those people out
 * for no reason. It is the *dead* session that should not outlive its token.
 */
export default function ExpiredSessionNotice({ callbackUrl }: { callbackUrl?: string }) {
  const cleared = useRef(false);

  useEffect(() => {
    // Once per mount. signOut() only drops the local cookie here — redirect is
    // false because the notice below already offers the way back, and sending
    // them somewhere mid-read would be worse than letting them choose.
    if (cleared.current) return;
    cleared.current = true;

    void signOut({ redirect: false });
  }, []);

  return (
    <AccessNotice
      title="Your session expired"
      description="You have been away a while, so we signed you out. Sign in again to pick up where you left off."
      callbackUrl={callbackUrl}
      variant="expired"
    />
  );
}
