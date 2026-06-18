import { getServerSession } from 'next-auth';
import AccessNotice from '@/components/auth/AccessNotice';
import { authConfig } from '@/lib/auth';
// Access is decided in the client shell from the account's capability posture
// (artist / seller / promoter / organizer) so non-artist sellers and promoters
// can reach their own sections. The server only requires sign-in — a stale
// Sanctum token should not lock out an authenticated account.
import ArtistLayoutShell from './artist-layout-shell';

export default async function ArtistLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authConfig);
  const userRole = session?.user?.role ?? null;
  const isArtist = Boolean(session?.user?.isArtist);

  if (!session?.user) {
    return (
      <AccessNotice
        title="Sign In Required"
        description="The creator studio requires a signed-in account."
        callbackUrl="/artist"
      />
    );
  }

  return (
    <ArtistLayoutShell
      userName={session.user.name ?? 'Creator'}
      userImage={session.user.image}
      shouldLoadArtistProfile={isArtist || userRole === 'artist'}
    >
      {children}
    </ArtistLayoutShell>
  );
}
