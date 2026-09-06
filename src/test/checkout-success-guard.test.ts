import { describe, it, expect } from '@jest/globals';

/**
 * The checkout page renders by falling through a list of guards. A completed
 * purchase clears the cart, so the empty-cart guard has to come after the
 * success check — otherwise the buyer is told "No Tickets Selected" at the
 * moment they pay, and the confirmation screen below it is unreachable.
 *
 * Mirrors the guard order in events/[id]/checkout/page.tsx.
 */

type State = { step: 'review' | 'payment' | 'processing' | 'success'; itemCount: number };

/** The fixed order: success is resolved before an empty cart is treated as an error. */
function screenFor(state: State): string {
  if (state.step === 'success') return 'Booking Confirmed';
  if (state.itemCount === 0) return 'No Tickets Selected';
  if (state.step === 'processing') return 'Processing Payment';
  return 'Checkout';
}

describe('checkout screen resolution', () => {
  it('shows the confirmation after a purchase clears the cart', () => {
    expect(screenFor({ step: 'success', itemCount: 0 })).toBe('Booking Confirmed');
  });

  it('still warns when someone lands on checkout with an empty cart', () => {
    expect(screenFor({ step: 'review', itemCount: 0 })).toBe('No Tickets Selected');
  });

  it('shows the processing state while the payment is in flight', () => {
    expect(screenFor({ step: 'processing', itemCount: 2 })).toBe('Processing Payment');
  });

  it('shows the checkout form in the normal case', () => {
    expect(screenFor({ step: 'review', itemCount: 2 })).toBe('Checkout');
  });
});
