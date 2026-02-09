import { ReactNode } from 'react';

// Mock next-auth/react for Jest
export const useSession = jest.fn(() => ({
  data: {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      image: null,
      accessToken: 'mock-access-token',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    accessToken: 'mock-access-token',
  },
  status: 'authenticated' as const,
  update: jest.fn(),
}));

export const signIn = jest.fn();
export const signOut = jest.fn();
export const getSession = jest.fn();
export const getCsrfToken = jest.fn();
export const getProviders = jest.fn();

export function SessionProvider({ children }: { children: ReactNode; session?: unknown }) {
  return children;
}
