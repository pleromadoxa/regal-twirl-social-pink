
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';

export const useNotificationsData = (userId: string | undefined, authLoading: boolean) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const channelRef = useRef<any>(null);
  const initializationRef = useRef(false);

  useEffect(() => {
    console.log('useNotificationsData effect running, userId:', userId, 'authLoading:', authLoading);
    
    // Don't initialize if auth is still loading
    if (authLoading) {
      return;
    }

    // If no user, reset state and cleanup any existing subscription
    if (!userId) {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing notifications channel:', error);
        }
        channelRef.current = null;
      }
      setUnreadCount(0);
      setNotifications([]);
      setInitialized(false);
      setLoading(false);
      initializationRef.current = false;
      return;
    }

    // If user exists and we haven't initialized yet
    if (userId && !initializationRef.current) {
      console.log('Initializing notifications for user:', userId);
      initializationRef.current = true;
      setInitialized(true);
      loadNotifications();
      
      // Setup realtime subscription
      console.log('Setting up realtime subscription for notifications');
      
      // Clean up any existing channel first
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing existing notifications channel:', error);
        }
        channelRef.current = null;
      }
      
      // Use timestamp to ensure uniqueness
      const channelName = `notifications-${userId}`;
      channelRef.current = supabase
        .channel(channelName)
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
    }

    return () => {
      console.log('Cleaning up notifications subscription');
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('Error removing notifications channel:', error);
        }
        channelRef.current = null;
      }
      initializationRef.current = false;
    };
  }, [userId, authLoading]); // Removed initialized from dependencies

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
