
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Theme</h3>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="w-6 h-6 bg-white border border-gray-300 rounded mb-2"></div>
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="w-6 h-6 bg-gray-800 border border-gray-600 rounded mb-2"></div>
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-800 border border-gray-400 rounded mb-2"></div>
              System
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
