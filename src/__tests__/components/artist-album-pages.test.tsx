import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: '42' }),
}));

const mockCreateAlbumMutateAsync = jest.fn();
const mockUpdateAlbumMutateAsync = jest.fn();
const mockAlbumDetail = {
  id: 42,
  title: 'Existing Album',
  description: 'Existing description',
  artwork: '/album.jpg',
  artwork_url: '/album.jpg',
  type: 'album',
  status: 'published',
  release_date: '2026-03-12',
  genre: 'Afrobeats',
  songs_count: 1,
  total_plays: 99,
  songs: [
    {
      id: 1,
      title: 'Track One',
      duration_seconds: 180,
      play_count: 42,
      status: 'published',
    },
  ],
  created_at: '2026-03-12T10:00:00Z',
  updated_at: '2026-03-12T10:00:00Z',
};

jest.mock('@/hooks/useArtist', () => ({
  useCreateAlbum: () => ({
    mutateAsync: mockCreateAlbumMutateAsync,
    isPending: false,
  }),
  useArtistAlbumDetail: () => ({
    data: mockAlbumDetail,
    isLoading: false,
  }),
  useUpdateAlbum: () => ({
    mutateAsync: mockUpdateAlbumMutateAsync,
    isPending: false,
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import CreateAlbumPage from '@/app/(artist)/artist/albums/create/page';
import EditAlbumPage from '@/app/(artist)/artist/albums/[id]/edit/page';

describe('artist album pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: jest.fn(() => 'blob:preview'),
    });
    mockCreateAlbumMutateAsync.mockResolvedValue({ data: { id: 1 } });
    mockUpdateAlbumMutateAsync.mockResolvedValue({ data: { id: 42 } });
  });

  it('creates an album through the shared create mutation and shows the post-create upload guidance', async () => {
    const user = userEvent.setup();
    const { container } = render(<CreateAlbumPage />);

    expect(
      screen.getByText(/add songs after album creation/i)
    ).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/album title/i), 'Debut Album');
    await user.type(screen.getByPlaceholderText(/afrobeats/i), 'Afrobeats');
    await user.type(screen.getByPlaceholderText(/tell fans about this release/i), 'First project');
    await user.selectOptions(container.querySelector('select') as HTMLSelectElement, 'ep');
    await user.type(container.querySelector('input[type="date"]') as HTMLInputElement, '2026-03-20');

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const cover = new File(['cover'], 'cover.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, cover);

    await user.click(screen.getByRole('button', { name: /create album/i }));

    await waitFor(() =>
      expect(mockCreateAlbumMutateAsync).toHaveBeenCalledWith({
        title: 'Debut Album',
        description: 'First project',
        release_date: '2026-03-20',
        type: 'ep',
        genre: 'Afrobeats',
        cover_image: cover,
      })
    );

    expect(mockPush).toHaveBeenCalledWith('/artist/albums');
  });

  it('loads album data into the edit form and submits through the update mutation', async () => {
    const user = userEvent.setup();
    const { container } = render(<EditAlbumPage />);

    const titleInput = await screen.findByDisplayValue('Existing Album');
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Afrobeats')).toBeInTheDocument();
    expect(screen.getByText(/track one/i)).toBeInTheDocument();

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Album');
    await user.clear(screen.getByDisplayValue('Existing description'));
    await user.type(screen.getByPlaceholderText(/tell fans about this release/i), 'Updated description');
    await user.clear(screen.getByDisplayValue('Afrobeats'));
    await user.type(screen.getByPlaceholderText(/afrobeats/i), 'Dancehall');
    await user.selectOptions(container.querySelector('select') as HTMLSelectElement, 'single');
    const releaseDateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await user.clear(releaseDateInput);
    await user.type(releaseDateInput, '2026-03-25');

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const cover = new File(['cover'], 'updated.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, cover);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(mockUpdateAlbumMutateAsync).toHaveBeenCalledWith({
        id: '42',
        data: {
          title: 'Updated Album',
          description: 'Updated description',
          type: 'single',
          genre: 'Dancehall',
          release_date: '2026-03-25',
          cover_image: cover,
        },
      })
    );

    expect(mockPush).toHaveBeenCalledWith('/artist/albums');
  });
});
