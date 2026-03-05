import AccessNotice from '@/components/auth/AccessNotice';

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
