import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | TesoTunes',
  },
  description: 'Sign in to your TesoTunes account',
};

export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
