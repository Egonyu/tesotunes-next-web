import {
  canEnterStudioPath,
  hasFullStudioAccess,
  holdsSellerCapability,
} from '@/lib/studio-access';

const listener = { role: 'user', capabilities: [] };
const promoter = { role: 'user', capabilities: ['promoter'] };
const seller = { role: 'user', capabilities: ['seller'] };
const artist = { role: 'artist', isArtist: true, capabilities: [] };
const organizer = { role: 'user', isEventOrganizer: true, capabilities: [] };
const admin = { role: 'admin', capabilities: [] };

describe('studio access', () => {
  it('lets a promoter into their own promotions section', () => {
    expect(canEnterStudioPath('/artist/promotions', promoter)).toBe(true);
    expect(canEnterStudioPath('/artist/promotions/create', promoter)).toBe(true);
  });

  it('lets a seller into their own store section', () => {
    expect(canEnterStudioPath('/artist/store', seller)).toBe(true);
    expect(canEnterStudioPath('/artist/store/products', seller)).toBe(true);
  });

  it('keeps a promoter out of the rest of the studio', () => {
    expect(canEnterStudioPath('/artist', promoter)).toBe(false);
    expect(canEnterStudioPath('/artist/songs', promoter)).toBe(false);
    expect(canEnterStudioPath('/artist/upload', promoter)).toBe(false);
    expect(canEnterStudioPath('/artist/earnings', promoter)).toBe(false);
  });

  it('keeps a plain listener out entirely', () => {
    expect(canEnterStudioPath('/artist', listener)).toBe(false);
    expect(canEnterStudioPath('/artist/promotions', listener)).toBe(false);
    expect(canEnterStudioPath('/artist/store', listener)).toBe(false);
  });

  it('lets artists, organizers and admins anywhere in the studio', () => {
    for (const identity of [artist, organizer, admin]) {
      expect(canEnterStudioPath('/artist', identity)).toBe(true);
      expect(canEnterStudioPath('/artist/upload', identity)).toBe(true);
      expect(canEnterStudioPath('/artist/promotions', identity)).toBe(true);
    }
  });

  it('does not mistake a lookalike path for the seller subtree', () => {
    expect(canEnterStudioPath('/artist/promotions-archive', promoter)).toBe(false);
    expect(canEnterStudioPath('/artist/storefront', seller)).toBe(false);
  });

  it('treats a missing capability list as no capabilities', () => {
    expect(holdsSellerCapability({ role: 'user' })).toBe(false);
    expect(canEnterStudioPath('/artist/promotions', { role: 'user' })).toBe(false);
  });

  it('separates full studio access from a seller capability', () => {
    expect(hasFullStudioAccess(promoter)).toBe(false);
    expect(hasFullStudioAccess(artist)).toBe(true);
    expect(holdsSellerCapability(promoter)).toBe(true);
    expect(holdsSellerCapability(artist)).toBe(false);
  });

  it('reads roles case-insensitively', () => {
    expect(hasFullStudioAccess({ role: 'Artist' })).toBe(true);
    expect(hasFullStudioAccess({ role: ' SUPER_ADMIN ' })).toBe(true);
  });
});
