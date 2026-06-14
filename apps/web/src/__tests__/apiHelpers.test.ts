import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiPost, apiPatch, apiDelete } from '@/hooks/useApi';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('apiPost', () => {
  it('sends POST request with JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ event: { id: '1' } }),
    });

    const result = await apiPost('/api/events', { title: 'Test' });

    expect(mockFetch).toHaveBeenCalledWith('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    });
    expect(result).toEqual({ event: { id: '1' } });
  });

  it('sends POST without body when none provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await apiPost('/api/events/e1/approve');

    expect(mockFetch).toHaveBeenCalledWith('/api/events/e1/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: 'Forbidden' }),
    });

    await expect(apiPost('/api/events', {})).rejects.toThrow('Forbidden');
  });

  it('throws generic error on non-JSON error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('parse')),
    });

    await expect(apiPost('/api/test')).rejects.toThrow('HTTP 500');
  });
});

describe('apiPatch', () => {
  it('sends PATCH request with JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ notification: { id: '1', read: true } }),
    });

    const result = await apiPatch('/api/notifications/1/read');

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/1/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
    expect(result).toEqual({ notification: { id: '1', read: true } });
  });
});

describe('apiDelete', () => {
  it('sends DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const result = await apiDelete('/api/notifications/1');

    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/1', {
      method: 'DELETE',
    });
    expect(result).toEqual({ success: true });
  });

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    await expect(apiDelete('/api/notifications/999')).rejects.toThrow('Not found');
  });
});
