import AccessNotice from '@/components/auth/AccessNotice';
import ExpiredSessionNotice from '@/components/auth/ExpiredSessionNotice';

type Props = {
  searchParams?: Promise<{
    callbackUrl?: string;
    reason?: string;
  }>;
};

export default async function AccessRequiredPage({ searchParams }: Props) {
  const params = (await searchParams) || {};
  const callbackUrl = params.callbackUrl || '/';
  const reason = params.reason || 'auth';

  /*
   * A lapsed session, told apart from never having signed in. The component
   * clears the stale cookie as well as explaining itself — a 30-day cookie
   * wrapping a 24-hour token is the reason this looked like a broken page.
   */
  if (reason === 'expired') {
    return <ExpiredSessionNotice callbackUrl={callbackUrl} />;
  }

  if (reason === 'forbidden') {
    return (
      <AccessNotice
        title="Access Restricted"
        description="You are signed in, but your account does not have permission to open this page."
        callbackUrl={callbackUrl}
        variant="forbidden"
      />
    );
  }

  return (
    <AccessNotice
      title="Sign In Required"
      description="This area is protected. Please sign in to continue."
      callbackUrl={callbackUrl}
      variant="auth"
    />
  );
}
