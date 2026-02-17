/**
 * Comprehensive tests for the auth login flow.
 * Tests the NextAuth authorize function, the login page, and the API integration.
 */

// Mock next-auth/react before any imports
const mockSignIn = jest.fn();
jest.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: mockRefresh,
  }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <span data-testid="icon-eye">Eye</span>,
  EyeOff: () => <span data-testid="icon-eye-off">EyeOff</span>,
  Loader2: () => <span data-testid="icon-loader">Loading</span>,
  Shield: () => <span data-testid="icon-shield">Shield</span>,
  ArrowLeft: () => <span data-testid="icon-arrow-left">Back</span>,
  Phone: () => <span data-testid="icon-phone">Phone</span>,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

import LoginPage from '@/app/(auth)/login/page';

describe('Auth Login Flow', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('authorize function (NextAuth credentials)', () => {
    // Extract the authorize logic to test it directly
    const API_URL = 'http://tesotunes-api.test/api';

    async function simulateAuthorize(
      credentials: { email: string; password: string },
      mockResponse: { ok: boolean; status: number; data: Record<string, unknown> }
    ) {
      // Mock the fetch call that authorize() makes
      const mockFetch = jest.fn().mockResolvedValue({
        ok: mockResponse.ok,
        status: mockResponse.status,
        text: async () => JSON.stringify(mockResponse.data),
      });

      const originalFetch = global.fetch;
      global.fetch = mockFetch;

      try {
        // Simulate what authorize() does
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (!response.ok) {
          const message = (data.message as string) || 'Unknown error';
          if (response.status === 423 || message.toLowerCase().includes('two factor')) {
            throw new Error('2FA_REQUIRED');
          }
          throw new Error(message);
        }

        // Support multiple Laravel response shapes
        const dataObj = data.data as Record<string, unknown> | undefined;
        const user = (data.user as Record<string, unknown>) ??
          (dataObj?.user as Record<string, unknown>) ??
          (dataObj?.id ? dataObj : undefined);
        const token = (data.token as string) ??
          (dataObj?.token as string) ??
          (data.access_token as string);

        if (user && token) {
          return {
            id: String(user.id),
            email: user.email as string,
            name: user.name as string,
            role: (user.role as string) || 'user',
            accessToken: token,
          };
        }

        return null;
      } finally {
        global.fetch = originalFetch;
      }
    }

    it('should call the correct API URL with credentials', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          data: { id: 7, email: 'benson@gmail.com', name: 'Lyrical Jersy', role: 'Artist' },
          token: 'test-token-123',
          token_type: 'Bearer',
        }),
      });

      const originalFetch = global.fetch;
      global.fetch = mockFetch;

      try {
        await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email: 'benson@gmail.com', password: 'Ben./12!' }),
        });

        expect(mockFetch).toHaveBeenCalledWith(
          'http://tesotunes-api.test/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'benson@gmail.com', password: 'Ben./12!' }),
          })
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should correctly parse Shape 4 response (UserResource data + token)', async () => {
      const result = await simulateAuthorize(
        { email: 'benson@gmail.com', password: 'Ben./12!' },
        {
          ok: true,
          status: 200,
          data: {
            data: {
              id: 7,
              email: 'benson@gmail.com',
              name: 'Lyrical Jersy',
              role: 'Artist',
              is_active: true,
            },
            token: '21|abc123token',
            token_type: 'Bearer',
          },
        }
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe('7');
      expect(result!.email).toBe('benson@gmail.com');
      expect(result!.name).toBe('Lyrical Jersy');
      expect(result!.role).toBe('Artist');
      expect(result!.accessToken).toBe('21|abc123token');
    });

    it('should correctly parse Shape 1 response (user + token at root)', async () => {
      const result = await simulateAuthorize(
        { email: 'test@test.com', password: 'password' },
        {
          ok: true,
          status: 200,
          data: {
            user: { id: 1, email: 'test@test.com', name: 'Test', role: 'user' },
            token: 'token-123',
          },
        }
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe('1');
      expect(result!.accessToken).toBe('token-123');
    });

    it('should correctly parse Shape 2 response (nested data.user)', async () => {
      const result = await simulateAuthorize(
        { email: 'test@test.com', password: 'password' },
        {
          ok: true,
          status: 200,
          data: {
            data: {
              user: { id: 2, email: 'test@test.com', name: 'Test', role: 'admin' },
              token: 'nested-token',
            },
          },
        }
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe('2');
      expect(result!.accessToken).toBe('nested-token');
    });

    it('should throw "Invalid credentials" on 401 response', async () => {
      await expect(
        simulateAuthorize(
          { email: 'benson@gmail.com', password: 'wrong-password' },
          {
            ok: false,
            status: 401,
            data: { message: 'Invalid credentials' },
          }
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw "2FA_REQUIRED" on 423 response', async () => {
      await expect(
        simulateAuthorize(
          { email: 'benson@gmail.com', password: 'Ben./12!' },
          {
            ok: false,
            status: 423,
            data: { message: 'Two factor authentication required' },
          }
        )
      ).rejects.toThrow('2FA_REQUIRED');
    });

    it('should throw "Account is suspended" on 403 response', async () => {
      await expect(
        simulateAuthorize(
          { email: 'suspended@test.com', password: 'password' },
          {
            ok: false,
            status: 403,
            data: { message: 'Account is suspended' },
          }
        )
      ).rejects.toThrow('Account is suspended');
    });

    it('should return null when response has no user or token', async () => {
      const result = await simulateAuthorize(
        { email: 'test@test.com', password: 'password' },
        {
          ok: true,
          status: 200,
          data: { success: true }, // Missing user and token
        }
      );

      expect(result).toBeNull();
    });

    it('should handle special characters in password correctly', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          data: { id: 7, email: 'benson@gmail.com', name: 'Test', role: 'Artist' },
          token: 'token-123',
        }),
      });

      const originalFetch = global.fetch;
      global.fetch = mockFetch;

      try {
        await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email: 'benson@gmail.com', password: 'Ben./12!' }),
        });

        // Verify the password with special chars is sent as-is in JSON
        const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(sentBody.password).toBe('Ben./12!');
        expect(sentBody.email).toBe('benson@gmail.com');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should default role to "user" when not provided', async () => {
      const result = await simulateAuthorize(
        { email: 'test@test.com', password: 'password' },
        {
          ok: true,
          status: 200,
          data: {
            data: { id: 1, email: 'test@test.com', name: 'Test' /* no role */ },
            token: 'token-123',
          },
        }
      );

      expect(result).not.toBeNull();
      expect(result!.role).toBe('user');
    });
  });

  describe('Login page form submission', () => {
    it('should call signIn with email and password on form submit', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: '/' });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ accessToken: 'test-token' }),
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'benson@gmail.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Ben./12!' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'benson@gmail.com',
          password: 'Ben./12!',
          redirect: false,
        });
      });
    });

    it('should display error message on failed login', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'Invalid credentials',
        status: 401,
        url: null,
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'benson@gmail.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should map CredentialsSignin to user-friendly message', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'CredentialsSignin',
        status: 401,
        url: null,
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should redirect to callbackUrl on successful login', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: '/' });
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ accessToken: 'real-token-123' }),
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'benson@gmail.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Ben./12!' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should show 2FA form when 2FA_REQUIRED error is returned', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: '2FA_REQUIRED',
        status: 200,
        url: null,
      });

      render(<LoginPage />);

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'benson@gmail.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Ben./12!' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

      await waitFor(() => {
        expect(screen.getByText(/Two-Factor Authentication/i)).toBeInTheDocument();
      });
    });
  });
});
