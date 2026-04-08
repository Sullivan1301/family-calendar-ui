import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  jsonb,
  boolean,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['super-admin', 'admin', 'member']);
export const statusEnum = pgEnum('status', ['pending', 'active', 'rejected']);
export const eventStatusEnum = pgEnum('event_status', ['pending', 'approved', 'rejected']);
export const eventTypeEnum = pgEnum('event_type', [
  'mariage',
  'baptême',
  'anniversaire de décès',
  'événement global',
  'autre',
]);
export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'expired',
  'revoked',
]);
export const historyActionEnum = pgEnum('history_action', [
  'created',
  'updated',
  'deleted',
  'approved',
  'rejected',
]);
export const notificationTypeEnum = pgEnum('notification_type', [
  'event_invitation',
  'event_approved',
  'event_rejected',
  'family_invitation',
  'comment_added',
  'member_joined',
]);

// Users table (better-auth compatible)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User roles (per family)
export const userRoles = pgTable(
  'user_roles',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    familyId: uuid('family_id').references(() => families.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.familyId] })]
);

// Families
export const families = pgTable('families', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  invitationCode: varchar('invitation_code', { length: 8 }).unique(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Family members
export const familyMembers = pgTable('family_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  familyId: uuid('family_id')
    .notNull()
    .references(() => families.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  invitedBy: text('invited_by').references(() => users.id, { onDelete: 'set null' }),
  status: statusEnum('status').notNull().default('pending'),
});

// Invitations (email-based)
export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  familyId: uuid('family_id')
    .notNull()
    .references(() => families.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: uuid('token').defaultRandom().notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  status: invitationStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Events
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  familyId: uuid('family_id')
    .notNull()
    .references(() => families.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  type: eventTypeEnum('type').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  location: varchar('location', { length: 500 }),
  status: eventStatusEnum('status').notNull().default('pending'),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Event guests (external)
export const eventGuests = pgTable('event_guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  confirmed: boolean('confirmed').notNull().default(false),
});

// Event history (audit)
export const eventHistory = pgTable('event_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: historyActionEnum('action').notNull(),
  changes: jsonb('changes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Event comments
export const eventComments = pgTable('event_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  data: jsonb('data'),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type Family = typeof families.$inferSelect;
export type NewFamily = typeof families.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type NewFamilyMember = typeof familyMembers.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventGuest = typeof eventGuests.$inferSelect;
export type NewEventGuest = typeof eventGuests.$inferInsert;
export type EventHistory = typeof eventHistory.$inferSelect;
export type NewEventHistory = typeof eventHistory.$inferInsert;
export type EventComment = typeof eventComments.$inferSelect;
export type NewEventComment = typeof eventComments.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// Types pour les enums
export type Role = 'super-admin' | 'admin' | 'member';
export type Status = 'pending' | 'active' | 'rejected';
export type EventStatus = 'pending' | 'approved' | 'rejected';
export type EventType = 'mariage' | 'baptême' | 'anniversaire de décès' | 'événement global' | 'autre';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type HistoryAction = 'created' | 'updated' | 'deleted' | 'approved' | 'rejected';
export type NotificationType = 'event_invitation' | 'event_approved' | 'event_rejected' | 'family_invitation' | 'comment_added' | 'member_joined';
