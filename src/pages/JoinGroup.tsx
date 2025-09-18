import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { joinGroupByInviteCode } from '@/services/groupConversationService';
import { supabase } from '@/integrations/supabase/client';

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  is_private: boolean;
  max_members: number;
}

const JoinGroup = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      if (!inviteCode || !user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get group info by invite code
        const { data: groupData, error: groupError } = await supabase
          .from('group_conversations')
          .select('id, name, description, is_private, max_members')
          .eq('invite_code', inviteCode.toUpperCase())
          .single();

        if (groupError || !groupData) {
          setError('Invalid invite code or group not found');
          return;
        }

        // Get member count
        const { count: memberCount } = await supabase
          .from('group_conversation_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupData.id);

        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from('group_conversation_members')
          .select('id')
          .eq('group_id', groupData.id)
          .eq('user_id', user.id)
          .single();

        setGroupInfo({
          ...groupData,
          member_count: memberCount || 0
        });

        if (existingMember) {
          setAlreadyMember(true);
        }
      } catch (error) {
        console.error('Error fetching group info:', error);
        setError('Failed to load group information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupInfo();
  }, [inviteCode, user]);

  const handleJoinGroup = async () => {
    if (!inviteCode || !user || !groupInfo) return;

    try {
      setIsJoining(true);
      const group = await joinGroupByInviteCode(inviteCode.toUpperCase(), user.id);
      
      if (group) {
        toast({
          title: "Successfully joined!",
          description: `Welcome to ${group.name}!`
        });
        
        // Navigate to messages with the group selected
        navigate(`/messages?conversation=${group.id}`);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Failed to join group",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleGoToGroup = () => {
    if (groupInfo) {
      navigate(`/messages?conversation=${groupInfo.id}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Join Group</CardTitle>
            <CardDescription>
              Please sign in to join the group
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading group information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !groupInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>
              {error || 'This invite link is invalid or has expired'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/messages')} 
              className="w-full"
              variant="outline"
            >
              Go to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{groupInfo.name}</CardTitle>
          <CardDescription>
            {groupInfo.description || 'Join this group to start chatting'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Group Stats */}
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-semibold text-foreground">{groupInfo.member_count}</div>
              <div>Members</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{groupInfo.max_members}</div>
              <div>Max</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {groupInfo.is_private ? 'Private' : 'Public'}
              </div>
              <div>Type</div>
            </div>
          </div>

          {/* Action Buttons */}
          {alreadyMember ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">You're already a member</span>
              </div>
              <Button onClick={handleGoToGroup} className="w-full">
                Go to Group
              </Button>
            </div>
          ) : groupInfo.member_count >= groupInfo.max_members ? (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground text-sm">
                This group is full ({groupInfo.member_count}/{groupInfo.max_members} members)
              </div>
              <Button onClick={() => navigate('/messages')} variant="outline" className="w-full">
                Go to Messages
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleJoinGroup} 
              disabled={isJoining}
              className="w-full"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Group'
              )}
            </Button>
          )}

          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/messages')}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinGroup;