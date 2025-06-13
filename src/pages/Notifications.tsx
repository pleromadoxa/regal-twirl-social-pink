
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Repeat2, 
  CheckCheck,
  Phone,
  PhoneCall
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Link, useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'reply':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'retweet':
        return <Repeat2 className="w-5 h-5 text-purple-500" />;
      case 'missed_call':
        return <PhoneCall className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getNotificationText = (notification: any) => {
    const actorName = notification.profiles?.display_name || notification.profiles?.username || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} liked your post`;
      case 'reply':
        return `${actorName} replied to your post`;
      case 'follow':
        return `${actorName} started following you`;
      case 'retweet':
        return `${actorName} retweeted your post`;
      case 'missed_call':
        return notification.message || `Missed call from ${actorName}`;
      default:
        return notification.message || 'New notification';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.post_id) {
      // Navigate to post
      navigate(`/post/${notification.post_id}`);
    } else if (notification.actor_id && notification.type === 'follow') {
      // Navigate to user profile
      navigate(`/profile/${notification.actor_id}`);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                  No notifications yet
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  When someone interacts with your posts, you'll see it here.
                </p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                  <TabsTrigger value="read">Read</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        !notification.read ? 'border-purple-300 bg-purple-50/50 dark:bg-purple-900/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm text-slate-800 dark:text-slate-200">
                                {getNotificationText(notification)}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                              )}
                            </div>
                            
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>

                          {notification.profiles && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={notification.profiles.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {notification.profiles.display_name?.[0] || notification.profiles.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="unread" className="space-y-4">
                  {unreadNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">All caught up! No unread notifications.</p>
                    </div>
                  ) : (
                    unreadNotifications.map((notification) => (
                      <Card 
                        key={notification.id}
                        className="cursor-pointer transition-all hover:shadow-md border-purple-300 bg-purple-50/50 dark:bg-purple-900/20"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <p className="text-sm text-slate-800 dark:text-slate-200">
                                  {getNotificationText(notification)}
                                </p>
                                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                              </div>
                              
                              <p className="text-xs text-slate-500 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>

                            {notification.profiles && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={notification.profiles.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {notification.profiles.display_name?.[0] || notification.profiles.username?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="read" className="space-y-4">
                  {readNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">No read notifications.</p>
                    </div>
                  ) : (
                    readNotifications.map((notification) => (
                      <Card 
                        key={notification.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800 dark:text-slate-200">
                                {getNotificationText(notification)}
                              </p>
                              
                              <p className="text-xs text-slate-500 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>

                            {notification.profiles && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={notification.profiles.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {notification.profiles.display_name?.[0] || notification.profiles.username?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Notifications;
