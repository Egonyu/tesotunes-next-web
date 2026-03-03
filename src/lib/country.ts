const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  uganda: 'UG',
  kenya: 'KE',
  tanzania: 'TZ',
  rwanda: 'RW',
  burundi: 'BI',
  southsudan: 'SS',
  south_sudan: 'SS',
  'south-sudan': 'SS',
};

export function normalizeCountryCode(value: string | null | undefined): string {
  const input = (value ?? '').trim();
  if (!input) return '';

  if (input.length === 2) {
    return input.toUpperCase();
  }

  const normalizedKey = input.toLowerCase().replace(/\s+/g, '');
  return COUNTRY_NAME_TO_ISO2[normalizedKey] ?? input.slice(0, 2).toUpperCase();
}
