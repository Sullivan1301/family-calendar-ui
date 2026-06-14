import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function createRequest(path: string, cookies: Record<string, string> = {}) {
  const url = new URL(path, 'http://localhost:3000');
  const req = new NextRequest(url);
  for (const [key, value] of Object.entries(cookies)) {
    req.cookies.set(key, value);
  }
  return req;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('middleware', () => {
  it('allows public paths without auth', () => {
    const req = createRequest('/login');
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('allows /api/auth paths without auth', () => {
    const req = createRequest('/api/auth/sign-in');
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('allows /invitation paths without auth', () => {
    const req = createRequest('/invitation/abc123');
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('allows _next paths without auth', () => {
    const req = createRequest('/_next/static/chunk.js');
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('redirects to login when no session cookie', () => {
    const req = createRequest('/');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('preserves callbackUrl on redirect', () => {
    const req = createRequest('/admin');
    const res = middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location')!;
    expect(location).toContain('callbackUrl');
    expect(location).toContain('%2Fadmin');
  });

  it('allows authenticated requests with session cookie', () => {
    const req = createRequest('/admin', {
      'better-auth.session_token': 'valid-token',
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('allows authenticated requests with secure session cookie', () => {
    const req = createRequest('/admin', {
      '__Secure-better-auth.session_token': 'valid-token',
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it('redirects protected pages', () => {
    const protectedPaths = ['/', '/events', '/members', '/new-event', '/admin'];
    for (const path of protectedPaths) {
      const req = createRequest(path);
      const res = middleware(req);
      expect(res.status).toBe(307);
    }
  });
});
