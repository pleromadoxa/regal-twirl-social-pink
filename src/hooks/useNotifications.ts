
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'retweet' | 'follow' | 'mention' | 'reply';
  actor_id: string | null;
  post_id: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
  actor_profile?: {
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First get notifications
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

      if (!notificationsData || notificationsData.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Get unique actor IDs to fetch profiles
      const actorIds = [...new Set(notificationsData
        .map(n => n.actor_id)
        .filter(id => id !== null))] as string[];

      let profilesMap = new Map();
      
      if (actorIds.length > 0) {
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
        actor_profile: notification.actor_id ? profilesMap.get(notification.actor_id) || null : null
      }));

      setNotifications(enrichedNotifications);
      setUnreadCount(enrichedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
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
    fetchNotifications();

    // Set up real-time subscription
    if (user) {
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
