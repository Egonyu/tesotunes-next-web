import { hasAnyPermission, hasPermission } from '@/lib/permissions';

describe('permission helpers', () => {
  it('matches exact permissions case-insensitively', () => {
    expect(hasPermission(['admin.settings'], 'admin.settings')).toBe(true);
    expect(hasPermission(['Admin.Settings'], 'admin.settings')).toBe(true);
    expect(hasPermission(['admin.users'], 'admin.settings')).toBe(false);
  });

  it('matches wildcard permissions', () => {
    expect(hasPermission(['music.*'], 'music.upload')).toBe(true);
    expect(hasPermission(['music.*'], 'music.edit_any')).toBe(true);
    expect(hasPermission(['music.*'], 'admin.settings')).toBe(false);
  });

  it('supports global wildcard', () => {
    expect(hasPermission(['*'], 'admin.settings')).toBe(true);
  });

  it('matches any required permission in set', () => {
    expect(hasAnyPermission(['admin.reports'], ['admin.settings', 'admin.reports'])).toBe(true);
    expect(hasAnyPermission(['catalog.view'], ['catalog.upload', 'catalog.claim.review'])).toBe(false);
  });
});
