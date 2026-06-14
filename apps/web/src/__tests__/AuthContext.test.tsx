import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const mockGetSession = vi.fn();
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/auth/client', () => ({
  authClient: {
    getSession: () => mockGetSession(),
    signIn: { email: (data: any) => mockSignIn(data) },
    signUp: { email: (data: any) => mockSignUp(data) },
    signOut: () => mockSignOut(),
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AuthProvider, null, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: null });
  mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ roles: [], families: [] }) });
  localStorage.clear();
});

describe('AuthProvider', () => {
  it('starts with isLoading true then sets false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('loads session when user is logged in', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        user: {
          id: 'u1',
          email: 'test@tba.mg',
          name: 'Test User',
          emailVerified: true,
          image: null,
        },
      },
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        families: [{ id: 'f1', name: 'Test Family', role: 'admin', memberStatus: 'active' }],
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe('test@tba.mg');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.families).toHaveLength(1);
    expect(result.current.activeFamily?.id).toBe('f1');
    expect(result.current.isAdmin).toBe(true);
  });

  it('restores activeFamily from localStorage', async () => {
    localStorage.setItem('activeFamilyId', 'f2');

    mockGetSession.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'test@tba.mg', name: 'Test', emailVerified: true, image: null },
      },
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        families: [
          { id: 'f1', name: 'Family 1', role: 'member', memberStatus: 'active' },
          { id: 'f2', name: 'Family 2', role: 'admin', memberStatus: 'active' },
        ],
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.activeFamily?.id).toBe('f2');
    });
  });

  it('setActiveFamily updates state and localStorage', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'test@tba.mg', name: 'Test', emailVerified: true, image: null },
      },
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        families: [
          { id: 'f1', name: 'Family 1', role: 'member', memberStatus: 'active' },
          { id: 'f2', name: 'Family 2', role: 'admin', memberStatus: 'active' },
        ],
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.families).toHaveLength(2);
    });

    act(() => {
      result.current.setActiveFamily({ id: 'f2', name: 'Family 2', role: 'admin', memberStatus: 'active' });
    });

    expect(result.current.activeFamily?.id).toBe('f2');
    expect(localStorage.getItem('activeFamilyId')).toBe('f2');
  });

  it('login calls signIn and refreshes user', async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let loginResult: { error?: string };
    await act(async () => {
      loginResult = await result.current.login('test@tba.mg', 'password');
    });

    expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@tba.mg', password: 'password' });
    expect(loginResult!).toEqual({});
  });

  it('login returns error on failure', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let loginResult: { error?: string };
    await act(async () => {
      loginResult = await result.current.login('bad@tba.mg', 'wrong');
    });

    expect(loginResult!.error).toBe('Invalid credentials');
  });

  it('logout clears all state', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'test@tba.mg', name: 'Test', emailVerified: true, image: null },
      },
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        families: [{ id: 'f1', name: 'Family', role: 'admin', memberStatus: 'active' }],
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    mockSignOut.mockResolvedValue({});

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.families).toEqual([]);
    expect(result.current.activeFamily).toBeNull();
  });

  it('detects super-admin role', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'admin@tba.mg', name: 'Admin', emailVerified: true, image: null },
      },
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        families: [{ id: 'f1', name: 'Family', role: 'super-admin', memberStatus: 'active' }],
      }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isSuperAdmin).toBe(true));
    expect(result.current.isAdmin).toBe(true);
  });
});
