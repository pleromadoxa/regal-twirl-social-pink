
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, MessageSquare, Tag, Users, Lock } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNavigate } from 'react-router-dom';

const PrivacySettings = () => {
  const { settings, updateSetting } = useUserSettings();
  const navigate = useNavigate();

  const privacySwitch = (field: keyof typeof settings) => ({
    checked: !!settings?.[field],
    onCheckedChange: (value: boolean) => updateSetting(field, value)
  });

  const privacySelect = (field: keyof typeof settings, value: string) => {
    updateSetting(field, value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Privacy & Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Privacy */}
          <div>
            <h3 className="font-medium text-foreground mb-4 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Account Privacy
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Private Account</p>
                  <p className="text-sm text-muted-foreground">Require approval for new followers</p>
                </div>
                <Switch {...privacySwitch("private_account")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Activity Status</p>
                  <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                </div>
                <Switch {...privacySwitch("show_online_status")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Discoverable</p>
                  <p className="text-sm text-muted-foreground">Appear in search results and suggestions</p>
                </div>
                <Switch {...privacySwitch("discoverable")} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Post Visibility */}
          <div>
            <h3 className="font-medium text-foreground mb-4 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Content Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Post Visibility</label>
                <Select 
                  value={settings?.post_visibility || 'public'} 
                  onValueChange={(val) => privacySelect('post_visibility', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can see</SelectItem>
                    <SelectItem value="followers">Followers Only</SelectItem>
                    <SelectItem value="circles">Circles Only</SelectItem>
                    <SelectItem value="private">Private - Only Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Who Can Comment</label>
                <Select 
                  value={settings?.who_can_comment || 'everyone'} 
                  onValueChange={(val) => privacySelect('who_can_comment', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="followers">Followers Only</SelectItem>
                    <SelectItem value="circles">Circles Only</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Who Can Tag You</label>
                <Select 
                  value={settings?.who_can_tag || 'everyone'} 
                  onValueChange={(val) => privacySelect('who_can_tag', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="followers">Followers Only</SelectItem>
                    <SelectItem value="circles">Circles Only</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Messages & Interactions */}
          <div>
            <h3 className="font-medium text-foreground mb-4 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages & Interactions
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Who Can Message You</label>
                <Select 
                  value={settings?.who_can_message || 'everyone'} 
                  onValueChange={(val) => privacySelect('who_can_message', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="followers">Followers Only</SelectItem>
                    <SelectItem value="circles">Circles Only</SelectItem>
                    <SelectItem value="nobody">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Read Receipts</p>
                  <p className="text-sm text-muted-foreground">Show when you've read messages</p>
                </div>
                <Switch {...privacySwitch("read_receipts_enabled")} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Story Replies</p>
                  <p className="text-sm text-muted-foreground">Allow replies to your stories</p>
                </div>
                <Switch {...privacySwitch("story_replies_enabled")} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile Visibility */}
          <div>
            <h3 className="font-medium text-foreground mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Profile Visibility
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Followers List</p>
                  <p className="text-sm text-muted-foreground">Let others see who follows you</p>
                </div>
                <Switch {...privacySwitch("show_followers_list")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Following List</p>
                  <p className="text-sm text-muted-foreground">Let others see who you follow</p>
                </div>
                <Switch {...privacySwitch("show_following_list")} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block & Mute Management */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked & Muted Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Blocked Users</p>
                <p className="text-sm text-muted-foreground">Manage users you've blocked</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings/blocked-users')}
              >
                Manage
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Muted Users</p>
                <p className="text-sm text-muted-foreground">Manage users you've muted</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings/muted-users')}
              >
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Close Friends */}
      <Card>
        <CardHeader>
          <CardTitle>Close Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Share exclusive content with your close friends list
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/settings/close-friends')}
          >
            Manage Close Friends
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
