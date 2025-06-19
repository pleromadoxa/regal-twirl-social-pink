
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notifications';

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const { data: notificationsData, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
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

  return processedNotifications;
};

export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
