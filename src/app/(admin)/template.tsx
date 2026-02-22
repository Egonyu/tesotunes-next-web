import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s — Admin | TesoTunes',
  },
  description: 'TesoTunes administration panel',
  robots: { index: false, follow: false },
};

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
