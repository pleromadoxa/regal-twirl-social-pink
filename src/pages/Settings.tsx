import { useState, useEffect } from 'react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  // Import new settings hook
  const { settings, loading: settingsLoading, updateSetting } = useUserSettings();

  const [profileData, setProfileData] = useState({
    display_name: '',
    username: '',
    bio: '',
    location: '',
    website: ''
  });
  
  useEffect(() => {
    if (profile) {
      setProfileData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || ''
      });
    }
  }, [profile]);

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    }
  };

  // Bind toggles to settings from Supabase
  const notificationSwitch = (field: "email_notifications" | "push_notifications") => ({
    checked: !!settings?.[field],
    onCheckedChange: (value: boolean) => updateSetting(field, value)
  });

  const privacySwitch = (field: "private_account" | "show_online_status") => ({
    checked: !!settings?.[field],
    onCheckedChange: (value: boolean) => updateSetting(field, value)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />

      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            </div>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
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
              </TabsList>

              {/* Account Section (profile info) - keep as is, except profile update logic. */}
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={profileData.display_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Your display name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="@username" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself" 
                        rows={3} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Where you're located" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourwebsite.com" 
                      />
                    </div>
                    <Button 
                      onClick={handleProfileSave}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications - now fully livesynced */}
              <TabsContent value="notifications" className="space-y-6">
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
              </TabsContent>

              {/* Privacy - now fully livesynced */}
              <TabsContent value="privacy" className="space-y-6">
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
              </TabsContent>

              {/* Appearance - remains as before, but could be extended for Supabase-driven themes if desired */}
              <TabsContent value="appearance" className="space-y-6">
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
              </TabsContent>
            </Tabs>
            {settingsLoading && (
              <div className="mt-3 text-center text-xs text-gray-500">Loading your settings...</div>
            )}
          </div>
        </main>
      </div>

      <RightSidebar />
    </div>
  );
};

export default Settings;
