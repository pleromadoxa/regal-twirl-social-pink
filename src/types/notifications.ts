
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

export interface NotificationsContextType {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}
