export type Role = 'super-admin' | 'admin' | 'member';

export type UserStatus = 'pending' | 'active' | 'rejected';

export type EventStatus = 'pending' | 'approved' | 'rejected';

export type EventType = 'mariage' | 'baptême' | 'anniversaire de décès' | 'événement global' | 'autre';

export interface User {
  id: string;
  name: string;
  role: Role;
  status: UserStatus;
  avatar?: string;
  email?: string;
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;
  location: string;
  status: EventStatus;
  createdBy: string; // userId
  creatorName: string;
  description?: string;
  guests?: string[];
}
