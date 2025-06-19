
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Bell, BellOff, Heart, MessageSquare, UserPlus, AtSign } from 'lucide-react';

const NotificationSettings = () => {
  const { settings, updateSetting, loading } = useUserSettings();

  const createNotificationSwitch = (field: keyof typeof settings) => ({
    checked: !!settings?.[field],
    onCheckedChange: (value: boolean) => updateSetting(field, value),
    disabled: loading
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-100 rounded w-48"></div>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Notification Preferences
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose how you want to be notified about activity
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Notification Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">General Notifications</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-blue-500" />
              <div>
                <Label htmlFor="email-notifications" className="font-medium text-gray-900 dark:text-gray-100">
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch 
              id="email-notifications"
              {...createNotificationSwitch("email_notifications")} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellOff className="w-4 h-4 text-orange-500" />
              <div>
                <Label htmlFor="push-notifications" className="font-medium text-gray-900 dark:text-gray-100">
                  Push Notifications
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive push notifications in your browser
                </p>
              </div>
            </div>
            <Switch 
              id="push-notifications"
              {...createNotificationSwitch("push_notifications")} 
            />
          </div>
        </div>

        <Separator />

        {/* Social Activity Notifications */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Social Activity</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="w-4 h-4 text-green-500" />
              <div>
                <Label htmlFor="follows-notifications" className="font-medium text-gray-900 dark:text-gray-100">
                  New Followers
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when someone follows you
                </p>
              </div>
            </div>
            <Switch 
              id="follows-notifications"
              {...createNotificationSwitch("follows_notifications")} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-red-500" />
              <div>
                <Label htmlFor="likes-notifications" className="font-medium text-gray-900 dark:text-gray-100">
                  Likes
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when someone likes your posts
                </p>
              </div>
            </div>
            <Switch 
              id="likes-notifications"
              {...createNotificationSwitch("likes_notifications")} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AtSign className="w-4 h-4 text-purple-500" />
              <div>
                <Label htmlFor="mentions-notifications" className="font-medium text-gray-900 dark:text-gray-100">
                  Mentions
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when someone mentions you
                </p>
              </div>
            </div>
            <Switch 
              id="mentions-notifications"
              {...createNotificationSwitch("mentions_notifications")} 
            />
          </div>
        </div>

        <Separator />

        {/* Message Notifications */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Messages</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <div>
                <Label htmlFor="messages-notifications" className="font-medium text-gray-900 dark:text-gray-100">
                  Direct Messages
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified about new direct messages
                </p>
              </div>
            </div>
            <Switch 
              id="messages-notifications"
              {...createNotificationSwitch("messages_notifications")} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
