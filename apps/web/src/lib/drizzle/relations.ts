import { relations } from 'drizzle-orm';
import {
  users,
  userRoles,
  families,
  familyMembers,
  invitations,
  events,
  eventGuests,
  eventHistory,
  eventComments,
  notifications,
} from './schema';

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  familyMembers: many(familyMembers),
  createdFamilies: many(families, { relationName: 'createdBy' }),
  createdEvents: many(events, { relationName: 'eventCreatedBy' }),
  approvedEvents: many(events, { relationName: 'eventApprovedBy' }),
  eventHistory: many(eventHistory),
  eventComments: many(eventComments),
  notifications: many(notifications),
  sentInvitations: many(invitations, { relationName: 'invitedBy' }),
}));

// UserRoles relations
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  family: one(families, {
    fields: [userRoles.familyId],
    references: [families.id],
  }),
}));

// Families relations
export const familiesRelations = relations(families, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [families.createdBy],
    references: [users.id],
    relationName: 'createdBy',
  }),
  members: many(familyMembers),
  roles: many(userRoles),
  invitations: many(invitations),
  events: many(events),
}));

// FamilyMembers relations
export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  family: one(families, {
    fields: [familyMembers.familyId],
    references: [families.id],
  }),
  user: one(users, {
    fields: [familyMembers.userId],
    references: [users.id],
  }),
  invitedByUser: one(users, {
    fields: [familyMembers.invitedBy],
    references: [users.id],
  }),
}));

// Invitations relations
export const invitationsRelations = relations(invitations, ({ one }) => ({
  family: one(families, {
    fields: [invitations.familyId],
    references: [families.id],
  }),
  invitedByUser: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
    relationName: 'invitedBy',
  }),
}));

// Events relations
export const eventsRelations = relations(events, ({ one, many }) => ({
  family: one(families, {
    fields: [events.familyId],
    references: [families.id],
  }),
  createdByUser: one(users, {
    fields: [events.createdBy],
    references: [users.id],
    relationName: 'eventCreatedBy',
  }),
  approvedByUser: one(users, {
    fields: [events.approvedBy],
    references: [users.id],
    relationName: 'eventApprovedBy',
  }),
  guests: many(eventGuests),
  history: many(eventHistory),
  comments: many(eventComments),
}));

// EventGuests relations
export const eventGuestsRelations = relations(eventGuests, ({ one }) => ({
  event: one(events, {
    fields: [eventGuests.eventId],
    references: [events.id],
  }),
}));

// EventHistory relations
export const eventHistoryRelations = relations(eventHistory, ({ one }) => ({
  event: one(events, {
    fields: [eventHistory.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventHistory.userId],
    references: [users.id],
  }),
}));

// EventComments relations
export const eventCommentsRelations = relations(eventComments, ({ one }) => ({
  event: one(events, {
    fields: [eventComments.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventComments.userId],
    references: [users.id],
  }),
}));

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
