
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
          .maybeSingle();

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

// Send email notification via edge function
export const sendNotificationEmail = async (
  userId: string,
  notificationType: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        user_id: userId,
        notification_type: notificationType,
        data: data || {},
      },
    });

    if (error) {
      console.error('Error sending notification email:', error);
    }
  } catch (err) {
    console.error('Failed to send notification email:', err);
  }
};

// Map notification types to email types
const emailNotificationTypes: Record<string, string> = {
  follow: 'new_follower',
  like: 'post_liked',
  reply: 'post_reply',
  mention: 'mention',
  retweet: 'post_liked',
  quote_tweet: 'post_reply',
};

// Create notification and optionally send email
export const createNotificationWithEmail = async (
  userId: string,
  type: string,
  actorId: string,
  postId: string | null,
  message: string,
  actorData?: { name?: string; username?: string }
): Promise<void> => {
  // Create in-app notification
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      actor_id: actorId,
      post_id: postId,
      message,
    });

  if (error) {
    console.error('Error creating notification:', error);
    return;
  }

  // Send email notification for relevant types
  const emailType = emailNotificationTypes[type];
  if (emailType) {
    const emailData: Record<string, any> = {
      post_id: postId,
    };

    if (actorData?.name) {
      if (type === 'follow') {
        emailData.follower_name = actorData.name;
        emailData.follower_username = actorData.username;
      } else if (type === 'like' || type === 'retweet') {
        emailData.liker_name = actorData.name;
      } else if (type === 'reply' || type === 'quote_tweet') {
        emailData.replier_name = actorData.name;
      } else if (type === 'mention') {
        emailData.mentioner_name = actorData.name;
      }
    }

    // Fire and forget - don't block on email sending
    sendNotificationEmail(userId, emailType, emailData);
  }
};
