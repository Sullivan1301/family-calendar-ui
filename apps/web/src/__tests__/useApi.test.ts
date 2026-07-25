import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '@/hooks/useApi';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('useApi', () => {
  it('returns initial state', () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useApi('/api/test'));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ events: [{ id: '1' }] }),
    });

    const { result } = renderHook(() => useApi('/api/events?familyId=f1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ events: [{ id: '1' }] });
    expect(result.current.error).toBeNull();
  });

  it('handles HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const { result } = renderHook(() => useApi('/api/events?familyId=f1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Unauthorized');
  });

  it('handles non-JSON error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('parse error')),
    });

    const { result } = renderHook(() => useApi('/api/events?familyId=f1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('HTTP 500');
  });

  it('skips fetch when url is null', () => {
    const { result } = renderHook(() => useApi(null));
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('skips fetch when enabled is false', () => {
    const { result } = renderHook(() => useApi('/api/events', { enabled: false }));
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('uses initialData option', () => {
    const initial = { events: [] };
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useApi('/api/test', { initialData: initial }));
    expect(result.current.data).toEqual(initial);
  });

  it('refetches when refetch is called', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 2 }),
      });

    const { result } = renderHook(() => useApi('/api/test'));

    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 1 });
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 2 });
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
