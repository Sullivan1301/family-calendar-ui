import { describe, it, expect } from 'vitest';
import {
  users,
  sessions,
  accounts,
  verifications,
  families,
  userRoles,
  familyMembers,
  invitations,
  events,
  eventGuests,
  eventHistory,
  eventComments,
  notifications,
  roleEnum,
  statusEnum,
  eventStatusEnum,
  eventTypeEnum,
  invitationStatusEnum,
  historyActionEnum,
  notificationTypeEnum,
} from '@/lib/drizzle/schema';

describe('Drizzle Schema', () => {
  describe('users table', () => {
    it('has required columns', () => {
      expect(users.id).toBeDefined();
      expect(users.email).toBeDefined();
      expect(users.name).toBeDefined();
      expect(users.emailVerified).toBeDefined();
      expect(users.image).toBeDefined();
      expect(users.createdAt).toBeDefined();
      expect(users.updatedAt).toBeDefined();
    });
  });

  describe('better-auth tables', () => {
    it('sessions has required columns', () => {
      expect(sessions.id).toBeDefined();
      expect(sessions.userId).toBeDefined();
      expect(sessions.token).toBeDefined();
      expect(sessions.expiresAt).toBeDefined();
      expect(sessions.ipAddress).toBeDefined();
      expect(sessions.userAgent).toBeDefined();
    });

    it('accounts has required columns', () => {
      expect(accounts.id).toBeDefined();
      expect(accounts.userId).toBeDefined();
      expect(accounts.accountId).toBeDefined();
      expect(accounts.providerId).toBeDefined();
      expect(accounts.accessToken).toBeDefined();
      expect(accounts.password).toBeDefined();
    });

    it('verifications has required columns', () => {
      expect(verifications.id).toBeDefined();
      expect(verifications.identifier).toBeDefined();
      expect(verifications.value).toBeDefined();
      expect(verifications.expiresAt).toBeDefined();
    });
  });

  describe('families table', () => {
    it('has required columns', () => {
      expect(families.id).toBeDefined();
      expect(families.name).toBeDefined();
      expect(families.invitationCode).toBeDefined();
      expect(families.createdBy).toBeDefined();
      expect(families.createdAt).toBeDefined();
    });
  });

  describe('userRoles table', () => {
    it('has required columns', () => {
      expect(userRoles.userId).toBeDefined();
      expect(userRoles.familyId).toBeDefined();
      expect(userRoles.role).toBeDefined();
    });
  });

  describe('familyMembers table', () => {
    it('has required columns', () => {
      expect(familyMembers.id).toBeDefined();
      expect(familyMembers.familyId).toBeDefined();
      expect(familyMembers.userId).toBeDefined();
      expect(familyMembers.joinedAt).toBeDefined();
      expect(familyMembers.invitedBy).toBeDefined();
      expect(familyMembers.status).toBeDefined();
    });
  });

  describe('events table', () => {
    it('has required columns', () => {
      expect(events.id).toBeDefined();
      expect(events.familyId).toBeDefined();
      expect(events.title).toBeDefined();
      expect(events.type).toBeDefined();
      expect(events.description).toBeDefined();
      expect(events.startDate).toBeDefined();
      expect(events.endDate).toBeDefined();
      expect(events.location).toBeDefined();
      expect(events.status).toBeDefined();
      expect(events.createdBy).toBeDefined();
      expect(events.approvedBy).toBeDefined();
    });
  });

  describe('eventGuests table', () => {
    it('has required columns', () => {
      expect(eventGuests.id).toBeDefined();
      expect(eventGuests.eventId).toBeDefined();
      expect(eventGuests.name).toBeDefined();
      expect(eventGuests.email).toBeDefined();
      expect(eventGuests.confirmed).toBeDefined();
    });
  });

  describe('eventHistory table', () => {
    it('has required columns', () => {
      expect(eventHistory.id).toBeDefined();
      expect(eventHistory.eventId).toBeDefined();
      expect(eventHistory.userId).toBeDefined();
      expect(eventHistory.action).toBeDefined();
      expect(eventHistory.changes).toBeDefined();
    });
  });

  describe('eventComments table', () => {
    it('has required columns', () => {
      expect(eventComments.id).toBeDefined();
      expect(eventComments.eventId).toBeDefined();
      expect(eventComments.userId).toBeDefined();
      expect(eventComments.content).toBeDefined();
    });
  });

  describe('notifications table', () => {
    it('has required columns', () => {
      expect(notifications.id).toBeDefined();
      expect(notifications.userId).toBeDefined();
      expect(notifications.type).toBeDefined();
      expect(notifications.title).toBeDefined();
      expect(notifications.message).toBeDefined();
      expect(notifications.data).toBeDefined();
      expect(notifications.read).toBeDefined();
    });
  });

  describe('enums', () => {
    it('roleEnum has correct values', () => {
      expect(roleEnum.enumValues).toEqual(['super-admin', 'admin', 'member']);
    });

    it('eventTypeEnum has correct values', () => {
      expect(eventTypeEnum.enumValues).toContain('mariage');
      expect(eventTypeEnum.enumValues).toContain('baptême');
      expect(eventTypeEnum.enumValues).toContain('autre');
    });

    it('eventStatusEnum has correct values', () => {
      expect(eventStatusEnum.enumValues).toEqual(['pending', 'approved', 'rejected']);
    });

    it('notificationTypeEnum has correct values', () => {
      expect(notificationTypeEnum.enumValues).toContain('event_invitation');
      expect(notificationTypeEnum.enumValues).toContain('member_joined');
    });

    it('historyActionEnum has correct values', () => {
      expect(historyActionEnum.enumValues).toEqual(['created', 'updated', 'deleted', 'approved', 'rejected']);
    });
  });
});
