
import { useState } from 'react';
import { Bell, User, Heart, Repeat, UserCheck, MessageCircle, PhoneMissed, Flame, AlertTriangle, Users, Check, X, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useCollaboration } from '@/hooks/useCollaboration';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const { respondToInvite, loading: collaborationLoading } = useCollaboration();
  const [isOpen, setIsOpen] = useState(false);

  console.log('NotificationDropdown render:', { 
    notificationsCount: notifications.length, 
    unreadCount, 
    loading 
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'retweet':
        return <Repeat className="w-4 h-4 text-green-500" />;
      case 'quote_tweet':
        return <Quote className="w-4 h-4 text-purple-500" />;
      case 'follow':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'mention':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'missed_call':
        return <PhoneMissed className="w-4 h-4 text-red-500" />;
      case 'collaboration_invite':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'collaboration_response':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'streak_warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'streak_lost':
        return <Flame className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: any) => {
    if (notification.type === 'missed_call') {
      const callType = notification.data?.call_type || 'call';
      return `Missed ${callType}`;
    }
    if (notification.type === 'streak_warning' || notification.type === 'streak_lost') {
      return notification.message || 'Streak notification';
    }
    return notification.message || 'New notification';
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification.id);
    markAsRead(notification.id);
    
    // Navigate to post if notification has post_id
    if (notification.post_id) {
      window.location.href = `/home?post=${notification.post_id}`;
    }
  };

  const handleCollaborationResponse = async (e: React.MouseEvent, inviteId: string, status: 'accepted' | 'declined') => {
    e.stopPropagation();
    await respondToInvite(inviteId, status);
  };

  const renderCollaborationActions = (notification: any) => {
    if (notification.type === 'collaboration_invite' && notification.data?.invite_id) {
      return (
        <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
          <Button 
            size="sm" 
            onClick={(e) => handleCollaborationResponse(e, notification.data.invite_id, 'accepted')}
            disabled={collaborationLoading}
            className="h-6 text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            Accept
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => handleCollaborationResponse(e, notification.data.invite_id, 'declined')}
            disabled={collaborationLoading}
            className="h-6 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Decline
          </Button>
        </div>
      );
    }
    return null;
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read clicked');
    markAllAsRead();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>
            Notifications {loading && <span className="text-xs text-gray-500">(Loading...)</span>}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {notification.actor_profile?.avatar_url ? (
                        <img
                          src={notification.actor_profile.avatar_url}
                          alt={notification.actor_profile.display_name || 'User'}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-3 h-3" />
                        </div>
                      )}
                      <span className="text-sm font-medium truncate">
                        {notification.actor_profile?.display_name || notification.actor_profile?.username || 'Unknown User'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                    {renderCollaborationActions(notification)}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
