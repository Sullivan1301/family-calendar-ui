import type {
  Family,
  Event,
  EventComment,
  EventHistory,
  Notification,
  User,
  Role,
} from '@/lib/drizzle/schema';

// Auth
export interface AuthSession {
  user: User;
  session: {
    id: string;
    expiresAt: string;
  };
}

// Families
export interface FamilyWithMembers extends Family {
  members: Array<Pick<User, 'id' | 'name' | 'email' | 'image'> & { joinedAt: Date }>;
}

export interface CreateFamilyRequest {
  name: string;
}

export interface JoinFamilyRequest {
  code: string;
}

// Events
export interface EventWithDetails extends Event {
  guests: Array<{
    id: string;
    name: string;
    email: string | null;
    confirmed: boolean;
  }>;
  createdByUser: Pick<User, 'id' | 'name' | 'image'>;
  approvedByUser?: Pick<User, 'id' | 'name'> | null;
}

export interface CreateEventRequest {
  familyId: string;
  title: string;
  type: 'mariage' | 'baptême' | 'anniversaire de décès' | 'événement global' | 'autre';
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  guests?: Array<{ name: string; email?: string }>;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string | null;
  location?: string | null;
  type?: 'mariage' | 'baptême' | 'anniversaire de décès' | 'événement global' | 'autre';
}

// Comments
export interface CommentWithUser extends EventComment {
  user: Pick<User, 'id' | 'name' | 'image'>;
}

export interface CreateCommentRequest {
  content: string;
}

// History
export interface HistoryWithUser extends EventHistory {
  user: Pick<User, 'id' | 'name' | 'image'>;
}

// Notifications
export interface NotificationWithCount {
  notifications: Notification[];
  unreadCount: number;
}

// API Responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: unknown;
}

// WebSocket Events
export type WebSocketEventType =
  | 'event:created'
  | 'event:updated'
  | 'event:deleted'
  | 'event:approved'
  | 'event:rejected'
  | 'comment:added'
  | 'notification:new';

export interface WebSocketEvent<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
}
