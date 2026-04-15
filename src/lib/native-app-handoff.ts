const MOBILE_APP_VERIFY_URL = 'tesotunes://verify-email';

export function shouldAttemptNativeHandoff(userAgent: string): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
}

export function buildNativeVerificationUrl(searchParams: URLSearchParams): string | null {
  const id = searchParams.get('id');
  const hash = searchParams.get('hash');
  const expires = searchParams.get('expires');
  const signature = searchParams.get('signature');

  if (!id || !hash || !expires || !signature) {
    return null;
  }

  const appParams = new URLSearchParams({
    id,
    hash,
    expires,
    signature,
  });

  const email = searchParams.get('email');
  if (email) {
    appParams.set('email', email);
  }

  return `${MOBILE_APP_VERIFY_URL}?${appParams.toString()}`;
}

export function attemptNativeAppHandoff(url: string) {
  window.location.href = url;
}
