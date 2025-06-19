
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';

export const useNotificationsData = (userId: string | undefined, authLoading: boolean) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('useNotificationsData effect running, userId:', userId, 'authLoading:', authLoading, 'initialized:', initialized);
    
    // Don't initialize if auth is still loading
    if (authLoading) {
      return;
    }

    // If no user, reset state
    if (!userId) {
      setUnreadCount(0);
      setNotifications([]);
      setInitialized(false);
      setLoading(false);
      return;
    }

    // If user exists and we haven't initialized yet
    if (userId && !initialized) {
      console.log('Initializing notifications for user:', userId);
      setInitialized(true);
      loadNotifications();
      setupRealtimeSubscription();
    }

    return () => {
      if (!userId) {
        setInitialized(false);
      }
    };
  }, [userId, authLoading, initialized]);

  const loadNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const processedNotifications = await fetchNotifications(userId);
      setNotifications(processedNotifications);
      const unread = processedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      console.log('Notifications fetched:', processedNotifications.length, 'unread:', unread);
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!userId) return;

    console.log('Setting up realtime subscription for notifications');
    
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Notification realtime update:', payload);
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await markNotificationAsRead(notificationId, userId);

      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true } 
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await markAllNotificationsAsRead(userId);

      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  const refreshNotifications = () => {
    if (userId) {
      loadNotifications();
    }
  };

  return {
    unreadCount,
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };
};
