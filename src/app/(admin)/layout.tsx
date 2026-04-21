import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import AccessNotice from '@/components/auth/AccessNotice';
import { canAccessAdminShell } from '@/lib/admin-access';
import { authConfig } from '@/lib/auth';
import AdminLayoutShell from './admin-layout-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);
  const userRole = session?.user?.role ?? null;
  const hasApiAccess = session?.user?.apiAuthorized ?? false;

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (!hasApiAccess) {
    redirect('/login?callbackUrl=/admin&reason=session_expired');
  }

  if (!canAccessAdminShell(userRole)) {
    return (
      <AccessNotice
        title="Access Restricted"
        description="Your account is signed in but does not have the required privileged access for this area."
        callbackUrl="/admin"
        role={userRole ?? undefined}
        variant="forbidden"
      />
    );
  }

  return (
    <AdminLayoutShell
      userName={session.user.name ?? 'Admin User'}
      userRole={session.user.role ?? 'Admin'}
      userPermissions={session.user.permissions ?? []}
    >
      {children}
    </AdminLayoutShell>
  );
}
