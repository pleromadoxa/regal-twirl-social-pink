
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Heart, UserPlus, MessageSquare, PhoneMissed, Phone, Video, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { notifications, loading: notificationsLoading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'missed_call':
        return <PhoneMissed className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-purple-500" />;
    }
  };

  const getNotificationContent = (notification: any) => {
    if (notification.type === 'missed_call') {
      const callType = notification.data?.call_type || 'call';
      const callIcon = callType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />;
      
      return (
        <div className="flex items-center gap-2">
          {callIcon}
          <span>Missed {callType} call</span>
        </div>
      );
    }
    
    return notification.message || notification.content || 'New notification';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <Bell className="w-8 h-8 text-purple-600" />
              Notifications
            </h1>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <div className="p-6">
          {notificationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`transition-all hover:shadow-md cursor-pointer ${
                    !notification.read ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {notification.actor_profile?.avatar_url ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.actor_profile.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {(notification.actor_profile.display_name || notification.actor_profile.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {notification.actor_profile?.display_name || notification.actor_profile?.username || 'System'}
                            </p>
                            {!notification.read && (
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                                New
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {getNotificationIcon(notification.type)}
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {getNotificationContent(notification)}
                          </p>
                        </div>
                        
                        {notification.content && notification.content !== notification.message && (
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                            {notification.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-16 h-16 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                  All caught up!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                  You'll see notifications here when someone likes your posts, follows you, sends you a message, or calls you.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
