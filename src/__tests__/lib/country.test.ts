import { normalizeCountryCode } from '@/lib/country';

describe('normalizeCountryCode', () => {
  it('returns ISO-2 when already provided', () => {
    expect(normalizeCountryCode('UG')).toBe('UG');
    expect(normalizeCountryCode('ug')).toBe('UG');
  });

  it('maps Uganda variants to UG', () => {
    expect(normalizeCountryCode('Uganda')).toBe('UG');
    expect(normalizeCountryCode(' uganda ')).toBe('UG');
  });

  it('handles empty values safely', () => {
    expect(normalizeCountryCode('')).toBe('');
    expect(normalizeCountryCode(null)).toBe('');
    expect(normalizeCountryCode(undefined)).toBe('');
  });
});
