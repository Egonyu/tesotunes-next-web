import { renderHook, act } from '@testing-library/react';
import { usePlayerStore } from '@/stores/player';

describe('usePlayerStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePlayerStore.setState({
      currentSong: null,
      queue: [],
      isPlaying: false,
      volume: 1,
      isMuted: false,
      isShuffled: false,
      repeatMode: 'off',
      currentTime: 0,
      duration: 0,
    });
  });

  const mockSong = {
    id: 1,
    title: 'Test Song',
    slug: 'test-song',
    artist: 'Test Artist',
    artistSlug: 'test-artist',
    album: 'Test Album',
    duration: 180,
    audioUrl: '/audio/test.mp3',
    coverUrl: '/images/test.jpg',
  };

  describe('play', () => {
    it('sets current song and starts playing', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      act(() => {
        result.current.play(mockSong);
      });
      
      expect(result.current.currentSong).toEqual(mockSong);
      expect(result.current.isPlaying).toBe(true);
    });

    it('adds song to queue if not already there', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      act(() => {
        result.current.play(mockSong);
      });
      
      expect(result.current.queue).toContainEqual(mockSong);
    });
  });

  describe('pause', () => {
    it('pauses playback', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      act(() => {
        result.current.play(mockSong);
        result.current.pause();
      });
      
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('toggle', () => {
    it('toggles between play and pause', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      act(() => {
        result.current.play(mockSong);
      });
      expect(result.current.isPlaying).toBe(true);
      
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isPlaying).toBe(false);
      
      act(() => {
        result.current.toggle();
      });
      expect(result.current.isPlaying).toBe(true);
    });
  });

  describe('volume', () => {
    it('sets volume', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      act(() => {
        result.current.setVolume(0.5);
      });
      
      expect(result.current.volume).toBe(0.5);
    });

    it('clamps volume between 0 and 1', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      act(() => {
        result.current.setVolume(1.5);
      });
      expect(result.current.volume).toBe(1);
      
      act(() => {
        result.current.setVolume(-0.5);
      });
      expect(result.current.volume).toBe(0);
    });
  });

  describe('mute', () => {
    it('toggles mute state', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      expect(result.current.isMuted).toBe(false);
      
      act(() => {
        result.current.toggleMute();
      });
      expect(result.current.isMuted).toBe(true);
      
      act(() => {
        result.current.toggleMute();
      });
      expect(result.current.isMuted).toBe(false);
    });
  });

  describe('queue', () => {
    it('adds songs to queue', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      const song2 = { ...mockSong, id: 2, title: 'Song 2' };
      
      act(() => {
        result.current.addToQueue(mockSong);
        result.current.addToQueue(song2);
      });
      
      expect(result.current.queue).toHaveLength(2);
    });

    it('removes songs from queue', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      act(() => {
        result.current.addToQueue(mockSong);
        result.current.removeFromQueue(0);
      });
      
      expect(result.current.queue).toHaveLength(0);
    });

    it('clears queue', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      act(() => {
        result.current.addToQueue(mockSong);
        result.current.addToQueue({ ...mockSong, id: 2 });
        result.current.clearQueue();
      });
      
      expect(result.current.queue).toHaveLength(0);
    });
  });

  describe('shuffle', () => {
    it('toggles shuffle mode', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      expect(result.current.isShuffled).toBe(false);
      
      act(() => {
        result.current.toggleShuffle();
      });
      expect(result.current.isShuffled).toBe(true);
    });
  });

  describe('repeat', () => {
    it('cycles through repeat modes', () => {
      const { result } = renderHook(() => usePlayerStore());
      
      expect(result.current.repeatMode).toBe('off');
      
      act(() => {
        result.current.cycleRepeat();
      });
      expect(result.current.repeatMode).toBe('all');
      
      act(() => {
        result.current.cycleRepeat();
      });
      expect(result.current.repeatMode).toBe('one');
      
      act(() => {
        result.current.cycleRepeat();
      });
      expect(result.current.repeatMode).toBe('off');
    });
  });

  describe('next/previous', () => {
    it('plays next song in queue', () => {
      const { result } = renderHook(() => usePlayerStore());
      const song2 = { ...mockSong, id: 2, title: 'Song 2' };
      
      act(() => {
        result.current.play(mockSong);
        result.current.addToQueue(song2);
        result.current.next();
      });
      
      expect(result.current.currentSong?.id).toBe(2);
    });

    it('plays previous song in queue', () => {
      const { result } = renderHook(() => usePlayerStore());
      const song2 = { ...mockSong, id: 2, title: 'Song 2' };
      
      act(() => {
        result.current.play(mockSong);
        result.current.addToQueue(song2);
        result.current.next();
        result.current.previous();
      });
      
      expect(result.current.currentSong?.id).toBe(1);
    });
  });
});
