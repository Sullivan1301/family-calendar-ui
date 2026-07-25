'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Event, EventComment, Notification } from '@/lib/drizzle/schema';

interface UseRealtimeEventsProps {
  familyId: string;
  onEventCreated?: (event: Event) => void;
  onEventUpdated?: (event: Event) => void;
  onEventDeleted?: (eventId: string) => void;
}

interface UseRealtimeCommentsProps {
  eventId: string;
  onCommentAdded?: (comment: EventComment) => void;
}

interface UseRealtimeNotificationsProps {
  userId: string;
  onNotification?: (notification: Notification) => void;
}

/**
 * Hook pour écouter les changements d'événements en temps réel
 */
export function useRealtimeEvents({
  familyId,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
}: UseRealtimeEventsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!familyId) return;

    const channel = supabase
      .channel(`family:${familyId}:events`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `family_id=eq.${familyId}`,
        },
        (payload: RealtimePostgresChangesPayload<Event>) => {
          if (payload.eventType === 'INSERT' && onEventCreated) {
            onEventCreated(payload.new as Event);
          } else if (payload.eventType === 'UPDATE' && onEventUpdated) {
            onEventUpdated(payload.new as Event);
          } else if (payload.eventType === 'DELETE' && onEventDeleted) {
            onEventDeleted((payload.old as Event).id);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, onEventCreated, onEventUpdated, onEventDeleted]);

  return { isConnected };
}

/**
 * Hook pour écouter les nouveaux commentaires en temps réel
 */
export function useRealtimeComments({ eventId, onCommentAdded }: UseRealtimeCommentsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`event:${eventId}:comments`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_comments',
          filter: `event_id=eq.${eventId}`,
        },
        (payload: RealtimePostgresChangesPayload<EventComment>) => {
          if (onCommentAdded) {
            onCommentAdded(payload.new as EventComment);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, onCommentAdded]);

  return { isConnected };
}

/**
 * Hook pour écouter les notifications en temps réel
 */
export function useRealtimeNotifications({ userId, onNotification }: UseRealtimeNotificationsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // Récupérer le nombre de notifications non lues initialement
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      setUnreadCount(count || 0);
    };
    fetchUnreadCount();

    const channel = supabase
      .channel(`user:${userId}:notifications`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          setUnreadCount((prev) => prev + 1);
          if (onNotification) {
            onNotification(payload.new as Notification);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Mettre à jour le compteur quand une notification est lue
          fetchUnreadCount();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNotification]);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    setUnreadCount(count || 0);
  }, [userId, supabase]);

  return { isConnected, unreadCount, refreshUnreadCount };
}

/**
 * Hook combiné pour un calendrier complet
 */
export function useCalendarRealtime(
  familyId: string | null,
  userId: string | null,
  callbacks?: {
    onEventChange?: () => void;
    onNewNotification?: (notification: Notification) => void;
  }
) {
  const supabase = createClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!familyId || !userId) return;

    const channels: RealtimeChannel[] = [];

    // Canal pour les événements
    const eventsChannel = supabase
      .channel(`calendar:${familyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `family_id=eq.${familyId}` },
        () => {
          callbacks?.onEventChange?.();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });
    channels.push(eventsChannel);

    // Canal pour les notifications personnelles
    const notificationsChannel = supabase
      .channel(`user-notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          callbacks?.onNewNotification?.(payload.new as Notification);
        }
      )
      .subscribe();
    channels.push(notificationsChannel);

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [familyId, userId, callbacks]);

  return { isConnected };
}
