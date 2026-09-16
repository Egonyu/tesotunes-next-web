import type { Metadata } from 'next';
import { PromoterWorkspaceShell } from '@/components/promoter/PromoterWorkspaceShell';

// A private workspace: keep it out of search results. The public side of a
// promoter is /promoters/[username] and /promotions/[slug].
export const metadata: Metadata = {
  title: 'Promoter workspace',
  robots: { index: false, follow: false },
};

export default function PromoterLayout({ children }: { children: React.ReactNode }) {
  return <PromoterWorkspaceShell>{children}</PromoterWorkspaceShell>;
}
