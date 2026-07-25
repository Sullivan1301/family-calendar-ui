import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/drizzle/db', () => ({
  db: {
    query: {
      userRoles: { findFirst: vi.fn(), findMany: vi.fn() },
      familyMembers: { findFirst: vi.fn(), findMany: vi.fn() },
      events: { findFirst: vi.fn() },
    },
  },
}));

import { db } from '@/lib/drizzle/db';
import {
  isSuperAdmin,
  getUserRole,
  canManageFamily,
  isFamilyMember,
  canEditEvent,
  canApproveEvent,
  canDeleteEvent,
  canViewEvent,
  generateInvitationCode,
  canInviteToFamily,
} from '@/lib/permissions';

const mockDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('isSuperAdmin', () => {
  it('returns true when user has super-admin role', async () => {
    vi.mocked(db.query.userRoles.findFirst).mockResolvedValueOnce({
      userId: 'u1',
      familyId: null,
      role: 'super-admin',
      createdAt: new Date(),
    });
    expect(await isSuperAdmin('u1')).toBe(true);
  });

  it('returns false when user has no super-admin role', async () => {
    vi.mocked(db.query.userRoles.findFirst).mockResolvedValueOnce(undefined);
    expect(await isSuperAdmin('u1')).toBe(false);
  });
});

describe('getUserRole', () => {
  it('returns super-admin if user is super-admin', async () => {
    vi.mocked(db.query.userRoles.findFirst).mockResolvedValueOnce({
      userId: 'u1',
      familyId: null,
      role: 'super-admin',
      createdAt: new Date(),
    });
    expect(await getUserRole('u1', 'f1')).toBe('super-admin');
  });

  it('returns family-specific role', async () => {
    vi.mocked(db.query.userRoles.findFirst)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        userId: 'u1',
        familyId: 'f1',
        role: 'admin',
        createdAt: new Date(),
      });
    expect(await getUserRole('u1', 'f1')).toBe('admin');
  });

  it('returns null when user has no role in family', async () => {
    vi.mocked(db.query.userRoles.findFirst)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    expect(await getUserRole('u1', 'f1')).toBeNull();
  });
});

describe('canManageFamily', () => {
  it('returns true for admin', async () => {
    vi.mocked(db.query.userRoles.findFirst)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ userId: 'u1', familyId: 'f1', role: 'admin', createdAt: new Date() });
    expect(await canManageFamily('u1', 'f1')).toBe(true);
  });

  it('returns false for regular member', async () => {
    vi.mocked(db.query.userRoles.findFirst)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ userId: 'u1', familyId: 'f1', role: 'member', createdAt: new Date() });
    expect(await canManageFamily('u1', 'f1')).toBe(false);
  });
});

describe('isFamilyMember', () => {
  it('returns true for active member', async () => {
    vi.mocked(db.query.familyMembers.findFirst).mockResolvedValueOnce({
      id: 'fm1',
      familyId: 'f1',
      userId: 'u1',
      joinedAt: new Date(),
      invitedBy: null,
      status: 'active',
    });
    expect(await isFamilyMember('u1', 'f1')).toBe(true);
  });

  it('returns false for pending member', async () => {
    vi.mocked(db.query.familyMembers.findFirst).mockResolvedValueOnce(undefined);
    expect(await isFamilyMember('u1', 'f1')).toBe(false);
  });
});

describe('canEditEvent', () => {
  it('returns false when event does not exist', async () => {
    vi.mocked(db.query.events.findFirst).mockResolvedValueOnce(undefined);
    expect(await canEditEvent('u1', 'e1')).toBe(false);
  });

  it('returns true for super-admin', async () => {
    vi.mocked(db.query.events.findFirst).mockResolvedValueOnce({
      id: 'e1', familyId: 'f1', title: 'Test', type: 'autre', description: null,
      startDate: new Date(), endDate: null, location: null, status: 'approved',
      createdBy: 'u2', approvedBy: null, createdAt: new Date(), updatedAt: new Date(),
    });
    vi.mocked(db.query.userRoles.findFirst).mockResolvedValueOnce({
      userId: 'u1', familyId: null, role: 'super-admin', createdAt: new Date(),
    });
    expect(await canEditEvent('u1', 'e1')).toBe(true);
  });

  it('returns true for event creator', async () => {
    vi.mocked(db.query.events.findFirst).mockResolvedValueOnce({
      id: 'e1', familyId: 'f1', title: 'Test', type: 'autre', description: null,
      startDate: new Date(), endDate: null, location: null, status: 'approved',
      createdBy: 'u1', approvedBy: null, createdAt: new Date(), updatedAt: new Date(),
    });
    vi.mocked(db.query.userRoles.findFirst)
      .mockResolvedValueOnce(undefined) // isSuperAdmin check
      .mockResolvedValueOnce(undefined) // getUserRole super-admin check
      .mockResolvedValueOnce(undefined); // getUserRole family check → null role
    expect(await canEditEvent('u1', 'e1')).toBe(true);
  });

  it('returns false for non-owner non-admin', async () => {
    vi.mocked(db.query.events.findFirst).mockResolvedValueOnce({
      id: 'e1', familyId: 'f1', title: 'Test', type: 'autre', description: null,
      startDate: new Date(), endDate: null, location: null, status: 'approved',
      createdBy: 'u2', approvedBy: null, createdAt: new Date(), updatedAt: new Date(),
    });
    vi.mocked(db.query.userRoles.findFirst)
      .mockResolvedValueOnce(undefined) // isSuperAdmin check
      .mockResolvedValueOnce(undefined) // getUserRole super-admin check
      .mockResolvedValueOnce({ userId: 'u1', familyId: 'f1', role: 'member', createdAt: new Date() }); // getUserRole family check
    expect(await canEditEvent('u1', 'e1')).toBe(false);
  });
});

describe('canApproveEvent', () => {
  it('delegates to canManageFamily', async () => {
    vi.mocked(db.query.userRoles.findFirst)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ userId: 'u1', familyId: 'f1', role: 'admin', createdAt: new Date() });
    expect(await canApproveEvent('u1', 'f1')).toBe(true);
  });
});

describe('canViewEvent', () => {
  it('returns true for super-admin', async () => {
    vi.mocked(db.query.userRoles.findFirst).mockResolvedValueOnce({
      userId: 'u1', familyId: null, role: 'super-admin', createdAt: new Date(),
    });
    expect(await canViewEvent('u1', 'f1')).toBe(true);
  });

  it('returns true for active family member', async () => {
    vi.mocked(db.query.userRoles.findFirst).mockResolvedValueOnce(undefined);
    vi.mocked(db.query.familyMembers.findFirst).mockResolvedValueOnce({
      id: 'fm1', familyId: 'f1', userId: 'u1', joinedAt: new Date(), invitedBy: null, status: 'active',
    });
    expect(await canViewEvent('u1', 'f1')).toBe(true);
  });
});

describe('generateInvitationCode', () => {
  it('generates an 8-character alphanumeric code', () => {
    const code = generateInvitationCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[A-Z0-9]{8}$/);
  });

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateInvitationCode()));
    expect(codes.size).toBeGreaterThan(40);
  });
});

describe('canInviteToFamily', () => {
  it('delegates to canManageFamily', async () => {
    vi.mocked(db.query.userRoles.findFirst)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ userId: 'u1', familyId: 'f1', role: 'member', createdAt: new Date() });
    expect(await canInviteToFamily('u1', 'f1')).toBe(false);
  });
});
