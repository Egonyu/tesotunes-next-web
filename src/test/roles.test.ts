import { canAccessArtistStudio, isAdminRole, isArtistRole } from '@/lib/roles';

describe('role helpers', () => {
  it('matches admin roles case-insensitively', () => {
    expect(isAdminRole('admin')).toBe(true);
    expect(isAdminRole('Super Admin')).toBe(true);
    expect(isAdminRole('super_admin')).toBe(true);
  });

  it('matches artist role exactly after normalization', () => {
    expect(isArtistRole('artist')).toBe(true);
    expect(isArtistRole(' Artist ')).toBe(true);
    expect(isArtistRole('label')).toBe(false);
  });

  it('allows artist studio for artist and admin roles only', () => {
    expect(canAccessArtistStudio('artist')).toBe(true);
    expect(canAccessArtistStudio('admin')).toBe(true);
    expect(canAccessArtistStudio('super_admin')).toBe(true);
    expect(canAccessArtistStudio('user')).toBe(false);
  });
});
