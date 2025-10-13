import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, Shield, Users, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CircleImageUpload from './CircleImageUpload';
import CircleMemberRoleManager from './CircleMemberRoleManager';

interface Circle {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  is_private: boolean;
  visibility: string;
  allow_posts: boolean;
  allow_calls: boolean;
  require_approval: boolean;
  settings: any;
}

interface CircleSettingsDialogProps {
  circle: Circle;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const CircleSettingsDialog = ({ circle, isOpen, onClose, onUpdate }: CircleSettingsDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: circle.name,
    description: circle.description || '',
    avatar_url: circle.avatar_url || '',
    is_private: circle.is_private,
    visibility: circle.visibility || 'members_only',
    allow_posts: circle.allow_posts ?? true,
    allow_calls: circle.allow_calls ?? true,
    require_approval: circle.require_approval ?? false,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSettings({
        name: circle.name,
        description: circle.description || '',
        avatar_url: circle.avatar_url || '',
        is_private: circle.is_private,
        visibility: circle.visibility || 'members_only',
        allow_posts: circle.allow_posts ?? true,
        allow_calls: circle.allow_calls ?? true,
        require_approval: circle.require_approval ?? false,
      });
    }
  }, [isOpen, circle]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_circles')
        .update({
          name: settings.name,
          description: settings.description,
          avatar_url: settings.avatar_url,
          is_private: settings.is_private,
          visibility: settings.visibility,
          allow_posts: settings.allow_posts,
          allow_calls: settings.allow_calls,
          require_approval: settings.require_approval,
        })
        .eq('id', circle.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Circle settings updated successfully',
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating circle:', error);
      toast({
        title: 'Error',
        description: 'Failed to update circle settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Circle Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 pt-4">
            <CircleImageUpload
              circleId={circle.id}
              currentImageUrl={settings.avatar_url}
              circleName={settings.name}
              onImageUpdated={(url) => setSettings({ ...settings, avatar_url: url })}
            />

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Circle Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Enter circle name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Describe your circle..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 pt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Private Circle
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Only invited members can see this circle
                  </p>
                </div>
                <Switch
                  checked={settings.is_private}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, is_private: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={settings.visibility}
                  onValueChange={(value) => setSettings({ ...settings, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="members_only">Members Only - Only members can view</SelectItem>
                    <SelectItem value="private">Private - Invitation required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <Label>Allow Posts</Label>
                    <p className="text-sm text-muted-foreground">
                      Members can create posts in this circle
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_posts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, allow_posts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <Label>Allow Calls</Label>
                    <p className="text-sm text-muted-foreground">
                      Members can start audio calls
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_calls}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, allow_calls: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      New members must be approved before joining
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_approval}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, require_approval: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4 pt-4">
            <CircleMemberRoleManager circleId={circle.id} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CircleSettingsDialog;