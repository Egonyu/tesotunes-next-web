import { describe, it, expect, beforeEach } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { usePlayerStore } from '@/stores/player';
import { mockSong } from '@/test/test-utils';

describe('Player Store', () => {
  beforeEach(() => {
    // Reset store before each test
    usePlayerStore.setState({
      currentSong: null,
      isPlaying: false,
      queue: [],
      queueIndex: 0,
      volume: 0.8,
      isMuted: false,
      repeatMode: 'off',
      isShuffled: false,
      currentTime: 0,
      duration: 0,
      originalQueue: [],
    });
  });

  it('sets current song', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.play(mockSong);
    });

    expect(result.current.currentSong).toEqual(mockSong);
  });

  it('toggles play/pause', () => {
    const { result } = renderHook(() => usePlayerStore());

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.resume();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('manages queue', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.addToQueue(mockSong);
    });

    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0]).toEqual(mockSong);
  });

  it('manages volume', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(result.current.volume).toBe(0.5);
  });

  it('toggles mute', () => {
    const { result } = renderHook(() => usePlayerStore());

    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
  });

  it('toggles shuffle', () => {
    const { result } = renderHook(() => usePlayerStore());

    expect(result.current.isShuffled).toBe(false);

    act(() => {
      result.current.toggleShuffle();
    });

    expect(result.current.isShuffled).toBe(true);
  });

  it('cycles repeat modes', () => {
    const { result } = renderHook(() => usePlayerStore());

    expect(result.current.repeatMode).toBe('off');

    act(() => {
      result.current.toggleRepeat();
    });

    expect(result.current.repeatMode).toBe('all');

    act(() => {
      result.current.toggleRepeat();
    });

    expect(result.current.repeatMode).toBe('one');

    act(() => {
      result.current.toggleRepeat();
    });

    expect(result.current.repeatMode).toBe('off');
  });

  it('updates progress', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.setCurrentTime(60);
    });

    expect(result.current.currentTime).toBe(60);
  });

  it('updates duration', () => {
    const { result } = renderHook(() => usePlayerStore());

    act(() => {
      result.current.setDuration(180);
    });

    expect(result.current.duration).toBe(180);
  });

  it('plays next song in queue', () => {
    const { result } = renderHook(() => usePlayerStore());
    const songs = [
      { ...mockSong, id: '1', title: 'Song 1' },
      { ...mockSong, id: '2', title: 'Song 2' },
    ];

    act(() => {
      result.current.play(songs[0], songs);
    });

    expect(result.current.queueIndex).toBe(0);

    act(() => {
      result.current.next();
    });

    expect(result.current.queueIndex).toBe(1);
  });

  it('plays previous song in queue', () => {
    const { result } = renderHook(() => usePlayerStore());
    const songs = [
      { ...mockSong, id: '1', title: 'Song 1' },
      { ...mockSong, id: '2', title: 'Song 2' },
    ];

    act(() => {
      result.current.play(songs[1], songs);
    });

    // Need currentTime = 0 to go to previous (otherwise restarts current)
    act(() => {
      result.current.setCurrentTime(0);
    });

    act(() => {
      result.current.previous();
    });

    expect(result.current.queueIndex).toBe(0);
  });
});
