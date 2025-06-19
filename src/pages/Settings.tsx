
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import RegalAIBot from '@/components/RegalAIBot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Terminal } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useSidebarProfile } from '@/hooks/useSidebarProfile';
import AccountSettings from '@/components/settings/AccountSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import SystemSettings from '@/components/SystemSettings';

const Settings = () => {
  const { loading: settingsLoading } = useUserSettings();
  const { profile, isAdmin } = useSidebarProfile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />

      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
              {settingsLoading && (
                <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              )}
            </div>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="system" className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    System
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="mt-6">
                <TabsContent value="account" className="space-y-6">
                  <AccountSettings />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <NotificationSettings />
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6">
                  <PrivacySettings />
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <AppearanceSettings />
                </TabsContent>

                {isAdmin && (
                  <TabsContent value="system" className="space-y-6">
                    <SystemSettings />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </main>
      </div>

      <RightSidebar />
      <RegalAIBot />
    </div>
  );
};

export default Settings;
