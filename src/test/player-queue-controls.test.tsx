import { fireEvent, render, screen } from '@testing-library/react';
import QueuePage from '@/app/(app)/queue/page';
import { usePlayerStore } from '@/stores/player';
import type { Song } from '@/types';

jest.mock('@/lib/api', () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiDelete: jest.fn() }));
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isLoading: false }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  useMutation: () => ({ mutate: jest.fn() }),
}));

const songs = [1, 2, 3, 4].map(id => ({
  id, title: `Track ${id}`, slug: `track-${id}`,
  artist: { id: 1, name: 'Artist', slug: 'artist' },
})) as Song[];

beforeEach(() => {
  usePlayerStore.setState({ currentSong: null, queue: [], originalQueue: [], queueIndex: 0,
    isPlaying: false, isShuffled: false, repeatMode: 'off' });
});
afterEach(() => jest.restoreAllMocks());

it('keeps every remaining track reachable after enabling shuffle', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  usePlayerStore.getState().play(songs[0], songs);
  usePlayerStore.getState().toggleShuffle();
  const played = [usePlayerStore.getState().currentSong?.id];
  for (let i = 1; i < songs.length; i++) {
    usePlayerStore.getState().next();
    played.push(usePlayerStore.getState().currentSong?.id);
  }
  expect(new Set(played).size).toBe(songs.length);
});

it('applies the enabled shuffle preference to a newly started queue', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  usePlayerStore.getState().toggleShuffle();
  usePlayerStore.getState().play(songs[0], songs);
  expect(usePlayerStore.getState().queue.map(s => s.id)).toEqual([1, 3, 4, 2]);
});

it('queue page next button advances the actual player', () => {
  usePlayerStore.getState().play(songs[0], songs);
  render(<QueuePage />);
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(usePlayerStore.getState().currentSong?.id).toBe(2);
});

it('queue page shuffle button changes the actual player', () => {
  usePlayerStore.getState().play(songs[0], songs);
  render(<QueuePage />);
  fireEvent.click(screen.getByTitle('Shuffle off'));
  expect(usePlayerStore.getState().isShuffled).toBe(true);
});

it('restores the original order and current track when shuffle is disabled', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  usePlayerStore.getState().play(songs[0], songs);
  usePlayerStore.getState().toggleShuffle();
  usePlayerStore.getState().next();
  const current = usePlayerStore.getState().currentSong;
  usePlayerStore.getState().toggleShuffle();
  expect(usePlayerStore.getState().queue).toEqual(songs);
  expect(usePlayerStore.getState().queue[usePlayerStore.getState().queueIndex]).toEqual(current);
});

it('queue page pause and resume control the actual player', () => {
  usePlayerStore.getState().play(songs[0], songs);
  render(<QueuePage />);
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  expect(usePlayerStore.getState().isPlaying).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  expect(usePlayerStore.getState().isPlaying).toBe(true);
});
