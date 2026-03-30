import { getServerSession } from 'next-auth';
import AccessNotice from '@/components/auth/AccessNotice';
import { authConfig } from '@/lib/auth';
import { canAccessArtistStudio } from '@/lib/roles';
import ArtistLayoutShell from './artist-layout-shell';

export default async function ArtistLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authConfig);
  const userRole = session?.user?.role ?? null;
  const isArtist = Boolean(session?.user?.isArtist);
  const hasApiAccess = session?.user?.apiAuthorized ?? false;
  const hasArtistAccess = hasApiAccess && canAccessArtistStudio(userRole, isArtist);

  if (!session?.user) {
    return (
      <AccessNotice
        title="Sign In Required"
        description="Artist Studio requires an authenticated artist or admin account."
        callbackUrl="/artist"
      />
    );
  }

  if (!hasApiAccess) {
    return (
      <AccessNotice
        title="Session Expired"
        description="Your sign-in session no longer has API access. Please sign in again to continue using Artist Studio."
        callbackUrl="/artist"
      />
    );
  }

  if (!hasArtistAccess) {
    return (
      <AccessNotice
        title="Artist Access Required"
        description="Your account is signed in but does not have access to Artist Studio resources yet."
        callbackUrl="/artist"
        role={userRole ?? undefined}
        variant="forbidden"
      />
    );
  }

  return (
    <ArtistLayoutShell
      userName={session.user.name ?? 'Artist'}
      userImage={session.user.image}
    >
      {children}
    </ArtistLayoutShell>
  );
}
