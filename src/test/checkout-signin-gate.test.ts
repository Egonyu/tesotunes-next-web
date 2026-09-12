import { describe, it, expect } from '@jest/globals';

/**
 * Ticket checkout requires a signed-in buyer while transactional mail is
 * undeliverable: a guest's ticket would exist only in an email that never
 * arrives. The API refuses the sale, and the page says so up front rather than
 * letting someone complete the form and be rejected at payment.
 *
 * The gate keys on 'unauthenticated' rather than "not authenticated", so a
 * signed-in buyer never flashes the sign-in wall while the session resolves.
 */

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

function screenFor(status: SessionStatus): 'sign-in-wall' | 'checkout' | 'loading' {
  if (status === 'unauthenticated') return 'sign-in-wall';
  if (status === 'loading') return 'loading';
  return 'checkout';
}

describe('checkout sign-in gate', () => {
  it('shows the sign-in wall to a signed-out visitor', () => {
    expect(screenFor('unauthenticated')).toBe('sign-in-wall');
  });

  it('lets a signed-in buyer straight through', () => {
    expect(screenFor('authenticated')).toBe('checkout');
  });

  it('does not flash the wall while the session is still resolving', () => {
    // Keying on `status !== 'authenticated'` would wrongly wall a signed-in
    // buyer for the moment the session takes to load.
    expect(screenFor('loading')).not.toBe('sign-in-wall');
  });
});
