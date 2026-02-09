/**
 * Tests for artist application hooks and flow
 * Validates: useSubmitArtistApplication, useArtistApplicationStatus, useAvailableGenres
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock the API module
jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPostForm: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: '1', name: 'Test', email: 'test@test.com', accessToken: 'token' },
      expires: new Date(Date.now() + 86400000).toISOString(),
      accessToken: 'token',
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: ReactNode }) => children,
}));

import { apiGet, apiPostForm } from '@/lib/api';
import {
  useArtistApplicationStatus,
  useAvailableGenres,
  useSubmitArtistApplication,
} from '@/hooks/useArtist';

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;
const mockApiPostForm = apiPostForm as jest.MockedFunction<typeof apiPostForm>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Artist Application Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAvailableGenres', () => {
    it('fetches available genres', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: [
          { id: 'afrobeat', name: 'Afrobeat', emoji: '🎵' },
          { id: 'gospel', name: 'Gospel', emoji: '🙏' },
          { id: 'hip-hop', name: 'Hip Hop', emoji: '🎤' },
        ],
      });

      const { result } = renderHook(() => useAvailableGenres(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data).toHaveLength(3);
      expect(result.current.data?.data[0].name).toBe('Afrobeat');
      expect(mockApiGet).toHaveBeenCalledWith('/artist/available-genres');
    });
  });

  describe('useArtistApplicationStatus', () => {
    it('fetches application status - none', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: {
          status: 'none',
          is_artist: false,
          message: 'No application submitted',
        },
      });

      const { result } = renderHook(() => useArtistApplicationStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.status).toBe('none');
      expect(result.current.data?.data.is_artist).toBe(false);
    });

    it('fetches application status - pending', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: {
          status: 'pending',
          is_artist: false,
          submitted_at: '2026-02-08T10:00:00Z',
          message: 'Your application is being reviewed',
        },
      });

      const { result } = renderHook(() => useArtistApplicationStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.status).toBe('pending');
      expect(result.current.data?.data.submitted_at).toBeDefined();
    });

    it('fetches application status - approved', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: {
          status: 'approved',
          is_artist: true,
          artist: {
            id: 42,
            stage_name: 'DJ Test',
            slug: 'dj-test',
            is_verified: true,
            can_upload: true,
          },
          approved_at: '2026-02-08T12:00:00Z',
        },
      });

      const { result } = renderHook(() => useArtistApplicationStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.status).toBe('approved');
      expect(result.current.data?.data.is_artist).toBe(true);
      expect(result.current.data?.data.artist?.stage_name).toBe('DJ Test');
    });

    it('fetches application status - rejected with reason', async () => {
      mockApiGet.mockResolvedValueOnce({
        success: true,
        data: {
          status: 'rejected',
          is_artist: false,
          rejection_reason: 'Incomplete documentation',
          can_reapply: true,
        },
      });

      const { result } = renderHook(() => useArtistApplicationStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data.status).toBe('rejected');
      expect(result.current.data?.data.rejection_reason).toBe('Incomplete documentation');
      expect(result.current.data?.data.can_reapply).toBe(true);
    });
  });

  describe('useSubmitArtistApplication', () => {
    it('submits artist application with FormData', async () => {
      mockApiPostForm.mockResolvedValueOnce({
        success: true,
        message: 'Application submitted successfully',
        data: {
          application_id: 1,
          status: 'pending',
        },
      });

      const { result } = renderHook(() => useSubmitArtistApplication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        stage_name: 'DJ Test',
        bio: 'I make amazing music',
        primary_genre: 'afrobeat',
        full_name: 'Test User',
        phone: '+256700000000',
        payout_method: 'mtn_momo',
        terms_accepted: true,
        artist_agreement_accepted: true,
        mobile_money_number: '+256700000000',
        mobile_money_provider: 'mtn',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiPostForm).toHaveBeenCalledTimes(1);
      // Verify FormData was constructed properly
      const callArgs = mockApiPostForm.mock.calls[0];
      expect(callArgs[0]).toBe('/artist/apply');
      expect(callArgs[1]).toBeInstanceOf(FormData);

      const formData = callArgs[1] as FormData;
      expect(formData.get('stage_name')).toBe('DJ Test');
      expect(formData.get('bio')).toBe('I make amazing music');
      expect(formData.get('primary_genre')).toBe('afrobeat');
      expect(formData.get('payout_method')).toBe('mtn_momo');
      expect(formData.get('terms_accepted')).toBe('1');
    });

    it('handles submission error', async () => {
      mockApiPostForm.mockRejectedValueOnce(new Error('Application failed'));

      const { result } = renderHook(() => useSubmitArtistApplication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        stage_name: 'DJ Test',
        bio: 'I make music',
        primary_genre: 'gospel',
        full_name: 'Test User',
        phone: '+256700000000',
        payout_method: 'bank',
        terms_accepted: true,
        artist_agreement_accepted: true,
        bank_name: 'Stanbic Bank',
        bank_account: '1234567890',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Application failed');
    });
  });
});
