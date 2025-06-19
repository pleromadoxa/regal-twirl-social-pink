
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
  actor_profile?: {
    display_name: string;
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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      const unread = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
      console.log('Notifications fetched:', data?.length, 'unread:', unread);
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
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      fetchNotifications();
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      fetchNotifications();
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
