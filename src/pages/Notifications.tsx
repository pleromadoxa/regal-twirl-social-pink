
import { formatDistanceToNow } from 'date-fns';
import { Bell, User, Heart, Repeat, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'retweet':
        return <Repeat className="w-4 h-4 text-green-500" />;
      case 'follow':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'mention':
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationMessage = (notification: any) => {
    const actorName = notification.actor_profile?.display_name || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} liked your post`;
      case 'retweet':
        return `${actorName} retweeted your post`;
      case 'follow':
        return `${actorName} started following you`;
      case 'mention':
        return `${actorName} mentioned you in a post`;
      case 'reply':
        return `${actorName} replied to your post`;
      default:
        return notification.message || 'New notification';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
              <Bell className="w-6 h-6" />
              Notifications
            </CardTitle>
            {notifications.filter(n => !n.read).length > 0 && (
              <Button 
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
        </Card>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                No notifications yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                When someone interacts with your posts, you'll see it here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  !notification.read ? 'border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {getNotificationMessage(notification)}
                        </p>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {notification.actor_profile?.avatar_url && (
                      <div className="flex-shrink-0">
                        <img 
                          src={notification.actor_profile.avatar_url} 
                          alt={notification.actor_profile.display_name}
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
