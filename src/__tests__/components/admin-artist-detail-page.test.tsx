jest.mock('react', () => {
  const actual = jest.requireActual('react');

  return {
    ...actual,
    use: (value: unknown) => {
      if (value && typeof value === 'object' && 'then' in (value as Record<string, unknown>)) {
        return { id: '77' };
      }

      return actual.use(value);
    },
  };
});

import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';

jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import ArtistDetailPage from '@/app/(admin)/admin/artists/[id]/page';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;
const mockApiPost = apiPost as jest.MockedFunction<typeof apiPost>;
const mockApiPut = apiPut as jest.MockedFunction<typeof apiPut>;
const mockApiDelete = apiDelete as jest.MockedFunction<typeof apiDelete>;

function buildArtistResponse(status = 'pending_review') {
  return {
    data: {
      id: 77,
      name: 'Achen',
      slug: 'achen',
      bio: 'Artist bio',
      status,
      is_verified: false,
      verification_status: status,
      rejection_reason: null,
      is_featured: false,
      profile_url: null,
      cover_url: null,
      website: null,
      total_plays: 100,
      total_songs: 2,
      total_albums: 1,
      followers: 25,
      earnings_balance: 10000,
      commission_rate: 15,
      genres: [{ id: 'afro', name: 'Afro' }],
      user: {
        id: 9,
        name: 'Achen User',
        email: 'achen@example.com',
        username: 'achen',
        phone: '+256700000000',
      },
      created_at: '2026-03-13T10:00:00Z',
      updated_at: '2026-03-13T10:00:00Z',
    },
  };
}

describe('ArtistDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockApiGet.mockImplementation(async (url: string) => {
      if (url === '/admin/artists/77') {
        return buildArtistResponse();
      }

      if (url.startsWith('/admin/songs?artist_id=77')) {
        return { data: [], meta: { total: 0 } };
      }

      if (url.startsWith('/admin/sacco/members?user_id=9')) {
        return { data: [] };
      }

      if (url.startsWith('/admin/events?user_id=9')) {
        return { data: [], meta: { total: 0 } };
      }

      throw new Error(`Unhandled GET ${url}`);
    });

    mockApiPost.mockResolvedValue({ message: 'ok' });
    mockApiPut.mockResolvedValue({ message: 'ok' });
    mockApiDelete.mockResolvedValue({ message: 'ok' });
  });

  it('submits a rejection reason through the shared mutation path', async () => {
    const user = userEvent.setup();

    render(<ArtistDetailPage params={Promise.resolve({ id: '77' })} />);

    await user.click(await screen.findByRole('button', { name: /reject application/i }));
    await user.type(
      screen.getByPlaceholderText(/reason for rejection/i),
      'Missing identity documents'
    );
    await user.click(screen.getByRole('button', { name: /confirm rejection/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/admin/artists/77/reject', {
        reason: 'Missing identity documents',
      })
    );
  });

  it('approves a pending artist through the dedicated mutation', async () => {
    const user = userEvent.setup();

    render(<ArtistDetailPage params={Promise.resolve({ id: '77' })} />);

    await user.click(await screen.findByRole('button', { name: /approve artist/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/admin/artists/77/approve')
    );
  });

  it('suspends an artist through the dedicated mutation', async () => {
    const user = userEvent.setup();

    render(<ArtistDetailPage params={Promise.resolve({ id: '77' })} />);

    await user.click(await screen.findByRole('button', { name: /suspend artist/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/admin/artists/77/suspend')
    );
  });
});
