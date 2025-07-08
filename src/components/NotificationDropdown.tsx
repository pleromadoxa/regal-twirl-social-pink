
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationsContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Safely use notifications context with error handling
  let notifications = [];
  let unreadCount = 0;
  let markAsRead = () => {};
  
  try {
    const notificationsContext = useNotifications();
    notifications = notificationsContext.notifications;
    unreadCount = notificationsContext.unreadCount;
    markAsRead = notificationsContext.markAsRead;
  } catch (error) {
    console.log('Notifications context not available:', error);
  }

  // Fetch user profile safely
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-4">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 10).map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-white dark:bg-gray-800' 
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="text-sm font-medium">
                    {notification.title || notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
