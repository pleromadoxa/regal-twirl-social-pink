
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';

const PrivacySettings = () => {
  const { settings, updateSetting } = useUserSettings();

  const privacySwitch = (field: "private_account" | "show_online_status") => ({
    checked: !!settings?.[field],
    onCheckedChange: (value: boolean) => updateSetting(field, value)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Private Account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Require approval for new followers</p>
          </div>
          <Switch {...privacySwitch("private_account")} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Show Activity Status</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Let others see when you're online</p>
          </div>
          <Switch {...privacySwitch("show_online_status")} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
