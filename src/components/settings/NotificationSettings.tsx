
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';

const NotificationSettings = () => {
  const { settings, updateSetting } = useUserSettings();

  const notificationSwitch = (field: "email_notifications" | "push_notifications") => ({
    checked: !!settings?.[field],
    onCheckedChange: (value: boolean) => updateSetting(field, value)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
          </div>
          <Switch {...notificationSwitch("email_notifications")} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in your browser</p>
          </div>
          <Switch {...notificationSwitch("push_notifications")} />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
