
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
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import UserLink from '@/components/UserLink';
import { Link, useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead
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
    const actorName = notification.actor_profile?.display_name || notification.actor_profile?.username || 'Someone';
    
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
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Stay updated with your interactions
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800"
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
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    No notifications yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    When someone interacts with your posts, follows you, or sends you a message, you'll see it here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
                  <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                  <TabsTrigger value="read" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                    Read
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id}
                      className={`cursor-pointer transition-all hover:shadow-lg backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50 ${
                        !notification.read 
                          ? 'bg-gradient-to-r from-purple-50/70 to-pink-50/70 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300/70 shadow-lg' 
                          : 'bg-white/70 dark:bg-slate-800/70 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-sm">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                                {getNotificationText(notification)}
                              </p>
                              {!notification.read && (
                                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0 ml-3 shadow-lg"></div>
                              )}
                            </div>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>

                          {notification.actor_profile && (
                            <div className="flex-shrink-0">
                              <UserLink
                                userId={notification.actor_id || ''}
                                username={notification.actor_profile.username}
                                displayName={notification.actor_profile.display_name}
                                avatarUrl={notification.actor_profile.avatar_url}
                                showAvatar={true}
                                className="w-10 h-10 border-2 border-white shadow-lg"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="unread" className="space-y-4">
                  {unreadNotifications.length === 0 ? (
                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCheck className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                          All caught up!
                        </h3>
                        <p className="text-slate-500">No unread notifications.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    unreadNotifications.map((notification) => (
                      <Card 
                        key={notification.id}
                        className="cursor-pointer transition-all hover:shadow-lg bg-gradient-to-r from-purple-50/70 to-pink-50/70 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300/70 backdrop-blur-xl shadow-lg"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-sm">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                                  {getNotificationText(notification)}
                                </p>
                                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0 ml-3 shadow-lg"></div>
                              </div>
                              
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>

                            {notification.actor_profile && (
                              <div className="flex-shrink-0">
                                <UserLink
                                  userId={notification.actor_id || ''}
                                  username={notification.actor_profile.username}
                                  displayName={notification.actor_profile.display_name}
                                  avatarUrl={notification.actor_profile.avatar_url}
                                  showAvatar={true}
                                  className="w-10 h-10 border-2 border-white shadow-lg"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="read" className="space-y-4">
                  {readNotifications.length === 0 ? (
                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                          No read notifications
                        </h3>
                        <p className="text-slate-500">Your read notifications will appear here.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    readNotifications.map((notification) => (
                      <Card 
                        key={notification.id}
                        className="cursor-pointer transition-all hover:shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-sm">
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-2">
                                {getNotificationText(notification)}
                              </p>
                              
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>

                            {notification.actor_profile && (
                              <div className="flex-shrink-0">
                                <UserLink
                                  userId={notification.actor_id || ''}
                                  username={notification.actor_profile.username}
                                  displayName={notification.actor_profile.display_name}
                                  avatarUrl={notification.actor_profile.avatar_url}
                                  showAvatar={true}
                                  className="w-10 h-10 border-2 border-white shadow-lg"
                                />
                              </div>
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
