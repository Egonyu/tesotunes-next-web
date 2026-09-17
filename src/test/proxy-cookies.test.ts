import { filterCookieHeader } from '@/lib/proxy-cookies';

describe('backend proxy cookie filter', () => {
  it('drops the NextAuth session cookie chunks', () => {
    const chunk = 'a'.repeat(3900);
    const header = [
      `__Secure-next-auth.session-token.0=${chunk}`,
      `__Secure-next-auth.session-token.1=${chunk}`,
      `__Secure-next-auth.session-token.2=${chunk}`,
      `__Secure-next-auth.session-token.3=${chunk}`,
      '__Host-next-auth.csrf-token=xyz',
      '_ga=GA1.1.1',
    ].join('; ');

    expect(filterCookieHeader(header)).toBeNull();
  });

  it('keeps the cookies the API reads', () => {
    expect(filterCookieHeader('_ga=1; poll_session_token=abc123; theme=dark')).toBe('poll_session_token=abc123');
  });

  it('does not keep a cookie whose name only starts like an allowed one', () => {
    expect(filterCookieHeader('poll_session_token_old=1')).toBeNull();
  });

  it('handles a missing header', () => {
    expect(filterCookieHeader(null)).toBeNull();
    expect(filterCookieHeader('')).toBeNull();
  });
});
