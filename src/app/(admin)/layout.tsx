import { getServerSession } from 'next-auth';
import AccessNotice from '@/components/auth/AccessNotice';
import { authConfig } from '@/lib/auth';
import { isAdminRole } from '@/lib/roles';
import AdminLayoutShell from './admin-layout-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);
  const userRole = session?.user?.role ?? null;

  if (!session?.user) {
    return (
      <AccessNotice
        title="Sign In Required"
        description="Admin pages are protected. Please sign in with an admin account to continue."
        callbackUrl="/admin"
      />
    );
  }

  if (!isAdminRole(userRole)) {
    return (
      <AccessNotice
        title="Access Restricted"
        description="Your account is signed in but does not have admin privileges for this area."
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
    >
      {children}
    </AdminLayoutShell>
  );
}
