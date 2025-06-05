
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Repeat, UserCheck, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-6 h-6 text-red-500 fill-current" />;
      case 'retweet':
        return <Repeat className="w-6 h-6 text-green-500" />;
      case 'follow':
        return <UserCheck className="w-6 h-6 text-blue-500" />;
      default:
        return <User className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate to relevant page based on notification type
    if (notification.post_id) {
      // For now, just navigate to home since we don't have individual post pages
      navigate('/');
    } else if (notification.type === 'follow' && notification.actor_id) {
      navigate(`/profile/${notification.actor_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto flex gap-6">
        <SidebarNav />
        
        <main className="flex-1 border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-5 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Notifications
              </h1>
              {notifications.some(n => !n.read) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {notification.actor_profile?.avatar_url ? (
                          <img
                            src={notification.actor_profile.avatar_url}
                            alt={notification.actor_profile.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {notification.actor_profile?.display_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            @{notification.actor_profile?.username || 'unknown'}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No notifications yet
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  When someone likes your posts or follows you, you'll see it here.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
