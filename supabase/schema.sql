-- TBA Family Calendar — Database Schema
-- Run this in the Supabase SQL Editor to create all tables and enums.

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE role AS ENUM ('super-admin', 'admin', 'member');
CREATE TYPE status AS ENUM ('pending', 'active', 'rejected');
CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE event_type AS ENUM ('mariage', 'baptême', 'anniversaire de décès', 'événement global', 'autre');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
CREATE TYPE history_action AS ENUM ('created', 'updated', 'deleted', 'approved', 'rejected');
CREATE TYPE notification_type AS ENUM ('event_invitation', 'event_approved', 'event_rejected', 'family_invitation', 'comment_added', 'member_joined');

-- ============================================
-- BETTER-AUTH TABLES
-- ============================================

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE session (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE account (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP,
  refresh_token_expires_at TIMESTAMP,
  scope TEXT,
  id_token TEXT,
  password TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================
-- APPLICATION TABLES
-- ============================================

CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  invitation_code VARCHAR(8) UNIQUE,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  role role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, family_id)
);

CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  status status NOT NULL DEFAULT 'pending'
);

CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type event_type NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(500),
  status event_status NOT NULL DEFAULT 'pending',
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE event_guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  confirmed BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE event_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action history_action NOT NULL,
  changes JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE event_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_family_members_family ON family_members(family_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_family ON user_roles(family_id);
CREATE INDEX idx_events_family ON events(family_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_event_guests_event ON event_guests(event_id);
CREATE INDEX idx_event_comments_event ON event_comments(event_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
