import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

// Mock session for testing (type assertion to satisfy next-auth Session type)
const mockSession = {
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
} as const;

// Create a new QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });
}

interface AllProvidersProps {
  children: ReactNode;
  session?: typeof mockSession | null;
}

function AllProviders({ children, session = mockSession }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <SessionProvider session={session as Parameters<typeof SessionProvider>[0]['session']}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: typeof mockSession | null;
}

function renderWithProviders(
  ui: ReactElement,
  { session, ...options }: RenderWithProvidersOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders session={session}>{children}</AllProviders>
    ),
    ...options,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with our custom version
export { renderWithProviders as render };

// Export mock data for tests
export { mockSession };

// Common test data
export const mockSong = {
  id: '1',
  title: 'Test Song',
  slug: 'test-song',
  artist: { id: '1', name: 'Test Artist', slug: 'test-artist' },
  duration: 180,
  plays: 1000,
  artwork_url: '/images/test-artwork.jpg',
  audio_url: '/audio/test-song.mp3',
};

export const mockArtist = {
  id: '1',
  name: 'Test Artist',
  slug: 'test-artist',
  bio: 'Test artist bio',
  avatar_url: '/images/test-avatar.jpg',
  followers_count: 5000,
  songs_count: 20,
  is_verified: true,
};

export const mockAlbum = {
  id: '1',
  title: 'Test Album',
  slug: 'test-album',
  artist: mockArtist,
  artwork_url: '/images/test-album.jpg',
  release_date: '2024-01-15',
  tracks_count: 12,
};

export const mockPlaylist = {
  id: '1',
  name: 'Test Playlist',
  slug: 'test-playlist',
  description: 'Test playlist description',
  artwork_url: '/images/test-playlist.jpg',
  tracks_count: 25,
  creator: { name: 'Test User' },
};

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatar_url: '/images/test-user.jpg',
  role: 'user',
  created_at: '2024-01-01',
};
