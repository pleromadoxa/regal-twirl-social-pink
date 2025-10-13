import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Crown, User, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CircleMember {
  id: string;
  user_id: string;
  role: string;
  permissions: {
    can_post: boolean;
    can_invite: boolean;
    can_manage_posts: boolean;
    can_start_calls: boolean;
  };
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface CircleMemberRoleManagerProps {
  circleId: string;
}

const CircleMemberRoleManager = ({ circleId }: CircleMemberRoleManagerProps) => {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select('id, user_id, role, permissions, profiles:user_id(username, display_name, avatar_url)')
        .eq('circle_id', circleId);

      if (error) throw error;
      setMembers(data as any);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load circle members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [circleId]);

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('circle_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Member role updated',
      });

      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    }
  };

  const updateMemberPermission = async (
    memberId: string,
    currentPermissions: any,
    permission: string,
    value: boolean
  ) => {
    try {
      const newPermissions = {
        ...currentPermissions,
        [permission]: value,
      };

      const { error } = await supabase
        .from('circle_members')
        .update({ permissions: newPermissions })
        .eq('id', memberId);

      if (error) throw error;

      fetchMembers();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Member removed from circle',
      });

      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profiles?.avatar_url} />
                <AvatarFallback>
                  {member.profiles?.display_name?.[0] || member.profiles?.username?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.profiles?.display_name || member.profiles?.username}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleIcon(member.role)}
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {member.role !== 'owner' && (
                <>
                  <Select
                    value={member.role}
                    onValueChange={(value) => updateMemberRole(member.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {member.role !== 'owner' && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${member.id}-post`}
                  checked={member.permissions?.can_post ?? true}
                  onCheckedChange={(checked) =>
                    updateMemberPermission(member.id, member.permissions, 'can_post', !!checked)
                  }
                />
                <Label htmlFor={`${member.id}-post`} className="text-sm cursor-pointer">
                  Can post
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${member.id}-invite`}
                  checked={member.permissions?.can_invite ?? false}
                  onCheckedChange={(checked) =>
                    updateMemberPermission(member.id, member.permissions, 'can_invite', !!checked)
                  }
                />
                <Label htmlFor={`${member.id}-invite`} className="text-sm cursor-pointer">
                  Can invite
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${member.id}-calls`}
                  checked={member.permissions?.can_start_calls ?? true}
                  onCheckedChange={(checked) =>
                    updateMemberPermission(member.id, member.permissions, 'can_start_calls', !!checked)
                  }
                />
                <Label htmlFor={`${member.id}-calls`} className="text-sm cursor-pointer">
                  Can start calls
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${member.id}-manage`}
                  checked={member.permissions?.can_manage_posts ?? false}
                  onCheckedChange={(checked) =>
                    updateMemberPermission(
                      member.id,
                      member.permissions,
                      'can_manage_posts',
                      !!checked
                    )
                  }
                />
                <Label htmlFor={`${member.id}-manage`} className="text-sm cursor-pointer">
                  Can manage posts
                </Label>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CircleMemberRoleManager;