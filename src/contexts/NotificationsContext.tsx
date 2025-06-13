
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'retweet' | 'follow' | 'mention' | 'reply' | 'message' | 'missed_call';
  actor_id: string | null;
  post_id: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
  data?: any;
  actor_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

interface NotificationsContextType {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching notifications for user:', user.id);
      setLoading(true);
      
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log('Fetched notifications:', notificationsData?.length || 0);

      if (!notificationsData || notificationsData.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Get unique actor IDs
      const actorIds = [...new Set(notificationsData
        .map(n => n.actor_id)
        .filter(id => id !== null))] as string[];

      let profilesMap = new Map();
      
      if (actorIds.length > 0) {
        console.log('Fetching profiles for actors:', actorIds);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', actorIds);

        if (profilesData) {
          profilesMap = new Map(
            profilesData.map(profile => [profile.id, profile])
          );
        }
      }

      const enrichedNotifications: Notification[] = notificationsData.map(notification => ({
        id: notification.id,
        user_id: notification.user_id,
        type: notification.type as Notification['type'],
        actor_id: notification.actor_id,
        post_id: notification.post_id,
        message: notification.message,
        read: notification.read,
        created_at: notification.created_at,
        data: notification.data,
        actor_profile: notification.actor_id ? profilesMap.get(notification.actor_id) || null : null
      }));

      console.log('Enriched notifications:', enrichedNotifications.length);
      setNotifications(enrichedNotifications);
      
      const unread = enrichedNotifications.filter(n => !n.read).length;
      console.log('Unread notifications count:', unread);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      console.log('Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
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
      console.log('Marking all notifications as read');
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "All notifications marked as read",
        description: "You're all caught up!"
      });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  useEffect(() => {
    console.log('NotificationsProvider effect running, user:', user?.id, 'initialized:', isInitializedRef.current);
    
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      // Clean up channel if user is logged out
      if (channelRef.current) {
        console.log('Cleaning up channel on logout');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isInitializedRef.current = false;
      }
      return;
    }

    // Prevent multiple initializations for the same user
    if (isInitializedRef.current) {
      console.log('Already initialized, skipping');
      return;
    }

    // Mark as initialized immediately to prevent race conditions
    isInitializedRef.current = true;

    fetchNotifications();

    // Set up real-time subscription with unique channel name
    const channelName = `notifications_${user.id}_${Date.now()}`;
    console.log('Creating new channel:', channelName);
    
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('New notification received via real-time:', payload);
        
        // Refresh notifications to get the complete data with profiles
        fetchNotifications();
        
        // Show toast for new notification
        const newNotification = payload.new as any;
        toast({
          title: "New notification",
          description: newNotification.message || "You have a new notification",
        });
      })
      .subscribe();

    channelRef.current = subscription;

    return () => {
      console.log('Cleaning up notifications subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [user?.id]);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      loading,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refetch: fetchNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
