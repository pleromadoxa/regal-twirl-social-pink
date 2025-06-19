
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  actor_id?: string;
  post_id?: string;
  actor_profile?: {
    display_name: string;
    username?: string;
    avatar_url?: string;
  };
  data?: any;
}

interface NotificationsContextType {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const { user, loading: authLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('NotificationsProvider effect running, user:', user, 'authLoading:', authLoading, 'initialized:', initialized);
    
    // Don't initialize if auth is still loading
    if (authLoading) {
      return;
    }

    // If no user, reset state
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      setInitialized(false);
      setLoading(false);
      return;
    }

    // If user exists and we haven't initialized yet
    if (user && !initialized) {
      console.log('Initializing notifications for user:', user.id);
      setInitialized(true);
      fetchNotifications();
      setupRealtimeSubscription();
    }

    return () => {
      if (!user) {
        setInitialized(false);
      }
    };
  }, [user, authLoading, initialized]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch notifications first
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      // Process notifications and fetch actor profiles separately
      const processedNotifications = await Promise.all(
        (notificationsData || []).map(async (notification) => {
          let actorProfile = {
            display_name: 'Unknown User',
            username: 'unknown',
            avatar_url: null
          };

          // If we have actor_id, fetch the profile
          if (notification.actor_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name, username, avatar_url')
              .eq('id', notification.actor_id)
              .single();

            if (profileData) {
              actorProfile = {
                display_name: profileData.display_name || profileData.username || 'Unknown User',
                username: profileData.username || undefined,
                avatar_url: profileData.avatar_url || null
              };
            }
          }

          return {
            ...notification,
            actor_profile: actorProfile
          } as Notification;
        })
      );

      setNotifications(processedNotifications);
      const unread = processedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      console.log('Notifications fetched:', processedNotifications.length, 'unread:', unread);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    console.log('Setting up realtime subscription for notifications');
    
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification realtime update:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

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
    if (user) {
      fetchNotifications();
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        notifications, 
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
