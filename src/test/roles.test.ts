import { canAccessArtistStudio, isAdminRole, isArtistRole, isModeratorRole, isPrivilegedAdminRole } from '@/lib/roles';

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

  it('matches moderator roles and privileged admin access helpers', () => {
    expect(isModeratorRole('moderator')).toBe(true);
    expect(isModeratorRole('Moderator')).toBe(true);
    expect(isModeratorRole('content_moderator')).toBe(true);
    expect(isModeratorRole('Forum Moderator')).toBe(true);
    expect(isModeratorRole('catalog-moderator')).toBe(true);
    expect(isPrivilegedAdminRole('moderator')).toBe(true);
    expect(isPrivilegedAdminRole('admin')).toBe(true);
    expect(isPrivilegedAdminRole('user')).toBe(false);
  });

  it('allows artist studio for artists, admins, and event organizers', () => {
    expect(canAccessArtistStudio('artist')).toBe(true);
    expect(canAccessArtistStudio('admin')).toBe(true);
    expect(canAccessArtistStudio('super_admin')).toBe(true);
    expect(canAccessArtistStudio('user', false, true)).toBe(true);
    expect(canAccessArtistStudio('user')).toBe(false);
  });
});
