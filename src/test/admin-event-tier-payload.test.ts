import { describe, it, expect } from '@jest/globals';

/**
 * Tier rows an admin adds in the edit form carry a placeholder id like
 * `new-1757166000000` so React can key them. Posting that id made the API read
 * the row as an existing tier to UPDATE; MySQL cast the string to 0, matched
 * nothing, and created nothing — added tiers silently never appeared, and the
 * save still reported success.
 *
 * Mirrors the mapping in admin/events/[id]/edit/page.tsx.
 */

type Tier = { id?: number | string; name: string; price: number; quantity: number };

function toPayload(tiers: Tier[]): Array<Omit<Tier, 'id'> & { id?: number | string }> {
  return tiers.map((tier) => {
    const isSaved = typeof tier.id === 'number' || /^\d+$/.test(String(tier.id ?? ''));
    if (isSaved) return tier;
    const { id: _placeholder, ...withoutId } = tier;
    return withoutId;
  });
}

describe('admin event edit — ticket tier payload', () => {
  it('drops the placeholder id from a newly added row', () => {
    const payload = toPayload([
      { id: 'new-1757166000000', name: 'Ordinary', price: 5000, quantity: 350 },
    ]);

    expect(payload[0]).not.toHaveProperty('id');
    expect(payload[0]).toMatchObject({ name: 'Ordinary', price: 5000, quantity: 350 });
  });

  it('keeps the id of a tier that already exists', () => {
    const payload = toPayload([{ id: 7, name: 'VIP', price: 10000, quantity: 100 }]);
    expect(payload[0].id).toBe(7);
  });

  it('keeps a numeric id that arrived as a string', () => {
    const payload = toPayload([{ id: '7', name: 'VIP', price: 10000, quantity: 100 }]);
    expect(payload[0].id).toBe('7');
  });

  it('handles a mix of saved and newly added rows', () => {
    const payload = toPayload([
      { id: 1, name: 'Ordinary', price: 5000, quantity: 350 },
      { id: 'new-1757166000001', name: 'VIP', price: 10000, quantity: 100 },
      { id: 'new-1757166000002', name: 'Table', price: 100000, quantity: 50 },
    ]);

    expect(payload[0].id).toBe(1);
    expect(payload[1]).not.toHaveProperty('id');
    expect(payload[2]).not.toHaveProperty('id');
    expect(payload).toHaveLength(3);
  });

  it('drops a row with no id at all rather than inventing one', () => {
    const payload = toPayload([{ name: 'Ordinary', price: 5000, quantity: 350 } as Tier]);
    expect(payload[0]).not.toHaveProperty('id');
  });
});
