
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SidebarNav from '@/components/SidebarNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Upload,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';

const Settings = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Profile settings
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: ''
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    likes_notifications: true,
    follows_notifications: true,
    messages_notifications: true,
    mentions_notifications: true
  });
  
  // Privacy settings
  const [privacy, setPrivacy] = useState({
    private_account: false,
    allow_messages: true,
    show_online_status: true,
    discoverable: true
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          username: data.username || '',
          display_name: data.display_name || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // In a real app, you would save notification preferences to the database
      // For now, we'll just show a success message
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved."
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: "Error updating notifications",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // In a real app, you would save privacy settings to the database
      // For now, we'll just show a success message
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved."
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error updating privacy",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Note: This would require setting up Supabase Storage
      // For now, we'll just show a message
      toast({
        title: "Feature coming soon",
        description: "Avatar upload will be available soon!",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error uploading avatar",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleThemeChange = (newTheme: string) => {
    // Since we only have light/dark toggle, we'll handle it differently
    if (newTheme !== theme) {
      toggleTheme();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-purple-600" />
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
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

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                      {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="relative">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>
                    <p className="text-sm text-slate-500 mt-1">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Your display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell people about yourself..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleProfileUpdate} 
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-slate-500">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push_notifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Likes</Label>
                    <p className="text-sm text-slate-500">When someone likes your posts</p>
                  </div>
                  <Switch
                    checked={notifications.likes_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, likes_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Follows</Label>
                    <p className="text-sm text-slate-500">When someone follows you</p>
                  </div>
                  <Switch
                    checked={notifications.follows_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, follows_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Messages</Label>
                    <p className="text-sm text-slate-500">When you receive new messages</p>
                  </div>
                  <Switch
                    checked={notifications.messages_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, messages_notifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mentions</Label>
                    <p className="text-sm text-slate-500">When someone mentions you</p>
                  </div>
                  <Switch
                    checked={notifications.mentions_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, mentions_notifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <Button 
                  onClick={handleNotificationUpdate} 
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Notification Settings
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Control who can see your content and interact with you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Private Account</Label>
                    <p className="text-sm text-slate-500">Only approved followers can see your posts</p>
                  </div>
                  <Switch
                    checked={privacy.private_account}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, private_account: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Messages</Label>
                    <p className="text-sm text-slate-500">Let others send you direct messages</p>
                  </div>
                  <Switch
                    checked={privacy.allow_messages}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, allow_messages: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-slate-500">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={privacy.show_online_status}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, show_online_status: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Discoverable</Label>
                    <p className="text-sm text-slate-500">Allow others to find you in search results</p>
                  </div>
                  <Switch
                    checked={privacy.discoverable}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, discoverable: checked }))
                    }
                  />
                </div>

                <Separator />

                <Button 
                  onClick={handlePrivacyUpdate} 
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Privacy Settings
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the app looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-slate-500 mb-4">Choose your preferred theme</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('light')}
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <Sun className="w-6 h-6" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => handleThemeChange('dark')}
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <Moon className="w-6 h-6" />
                      Dark
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base">Language & Region</Label>
                  <div className="flex items-center gap-4">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium">English (US)</p>
                      <p className="text-sm text-slate-500">Language and region settings</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      Current
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">Theme Applied</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Your {theme} theme is now active across the app
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
