import { describe, it, expect } from '@jest/globals';

/**
 * The admin event detail page crashed with
 * "Cannot read properties of undefined (reading 'tickets_sold')".
 *
 * Two things had to line up. The edit page cached the raw API response under
 * the same React Query key the detail page used for its normalized event, so
 * after saving, the detail page could render a record with no `stats` at all.
 * And the sold count fell back to `stats` whenever the tier sum was falsy —
 * which a tierless event makes it, because the sum is a perfectly real 0.
 *
 * These mirror the expression on the detail page.
 */

type Tier = { sold?: number; quantity_sold?: number };
type EventLike = { ticket_tiers?: Tier[]; stats?: { tickets_sold?: number } };

/** The fixed expression from admin/events/[id]/page.tsx. */
function ticketsSold(e: EventLike): number {
  return e.ticket_tiers?.length
    ? e.ticket_tiers.reduce((sum, t) => sum + (t.sold ?? t.quantity_sold ?? 0), 0)
    : (e.stats?.tickets_sold ?? 0);
}

describe('admin event detail — tickets sold', () => {
  it('does not throw on a raw record that carries no stats', () => {
    // Exactly what the edit page used to leave in the shared cache entry.
    const raw: EventLike = { ticket_tiers: [] };
    expect(() => ticketsSold(raw)).not.toThrow();
    expect(ticketsSold(raw)).toBe(0);
  });

  it('reports zero for an event whose tiers were all removed', () => {
    expect(ticketsSold({ ticket_tiers: [], stats: { tickets_sold: 0 } })).toBe(0);
  });

  it('sums the tiers when there are tiers', () => {
    const e: EventLike = {
      ticket_tiers: [{ sold: 3 }, { quantity_sold: 4 }, {}],
      stats: { tickets_sold: 999 },
    };
    expect(ticketsSold(e)).toBe(7);
  });

  it('keeps a genuine zero from tiers instead of falling back to stats', () => {
    // The old `||` fell through here and reported 12 tickets sold on an event
    // that had sold none.
    const e: EventLike = {
      ticket_tiers: [{ sold: 0 }, { sold: 0 }],
      stats: { tickets_sold: 12 },
    };
    expect(ticketsSold(e)).toBe(0);
  });

  it('falls back to stats only when there are no tiers at all', () => {
    expect(ticketsSold({ ticket_tiers: [], stats: { tickets_sold: 12 } })).toBe(12);
    expect(ticketsSold({ stats: { tickets_sold: 12 } })).toBe(12);
  });
});
