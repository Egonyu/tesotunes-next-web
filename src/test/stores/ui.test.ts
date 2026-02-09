import { describe, it, expect, beforeEach } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { useUIStore } from '@/stores/ui';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.setState({
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'system',
      searchQuery: '',
      activeModal: null,
      modalData: null,
      isLoading: false,
      notifications: [],
    });
  });

  it('toggles sidebar', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.sidebarOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(false);
  });

  it('collapses sidebar', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.sidebarCollapsed).toBe(false);

    act(() => {
      result.current.setSidebarCollapsed(true);
    });

    expect(result.current.sidebarCollapsed).toBe(true);
  });

  it('sets theme', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });

  it('sets search query', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setSearchQuery('test search');
    });

    expect(result.current.searchQuery).toBe('test search');
  });

  it('opens and closes modals', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.openModal('settings', { tab: 'account' });
    });

    expect(result.current.activeModal).toBe('settings');
    expect(result.current.modalData).toEqual({ tab: 'account' });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.activeModal).toBeNull();
    expect(result.current.modalData).toBeNull();
  });

  it('manages loading state', () => {
    const { result } = renderHook(() => useUIStore());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('manages notifications', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.addNotification({
        id: '1',
        type: 'success',
        message: 'Test notification',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe('Test notification');

    act(() => {
      result.current.removeNotification('1');
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('clears all notifications', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.addNotification({ id: '1', type: 'success', message: 'First' });
      result.current.addNotification({ id: '2', type: 'error', message: 'Second' });
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.clearNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });
});
