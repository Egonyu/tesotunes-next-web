import { canAccessAdminShell, getAdminEntryPath } from '@/lib/admin-access';

describe('admin access helpers', () => {
  it('allows admin and moderator roles into the admin shell', () => {
    expect(canAccessAdminShell('admin')).toBe(true);
    expect(canAccessAdminShell('moderator')).toBe(true);
    expect(canAccessAdminShell('user')).toBe(false);
  });

  it('keeps admins on the dashboard entry route', () => {
    expect(getAdminEntryPath('admin', ['admin.dashboard'])).toBe('/admin');
  });

  it('routes moderators to the first permitted admin workspace', () => {
    expect(getAdminEntryPath('moderator', ['view-users'])).toBe('/admin/users');
    expect(getAdminEntryPath('moderator', ['manage-reports'])).toBe('/admin/reports');
    expect(getAdminEntryPath('moderator', ['catalog.claim.review'])).toBe('/admin/catalog/claims');
  });

  it('gives moderators a safe default moderation workspace', () => {
    expect(getAdminEntryPath('moderator', [])).toBe('/admin/reports');
    expect(getAdminEntryPath('content_moderator', [])).toBe('/admin/reports');
  });
});
