
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GroupCreationDialog from './GroupCreationDialog';
import { MessageCircle, Users, Plus, Crown, Shield, User } from 'lucide-react';

const ConversationStarter = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSuggestions();
      fetchGroups();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified')
        .neq('id', user?.id)
        .limit(5);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('group_conversation_members')
        .select(`
          group_id,
          role,
          group_conversations (
            id,
            name,
            description,
            avatar_url,
            created_by
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const startConversation = async (userId: string) => {
    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user?.id},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${user?.id})`)
        .single();

      if (existingConv) {
        toast({
          title: "Conversation exists",
          description: "You already have a conversation with this user."
        });
        return;
      }

      // Create new conversation
      const { error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user?.id,
          participant_2: userId
        });

      if (error) throw error;

      toast({
        title: "Conversation started",
        description: "You can now chat with this user."
      });
      
      fetchSuggestions();
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return <User className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Groups Section */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-purple-600" />
              My Groups
            </CardTitle>
            <GroupCreationDialog 
              trigger={
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create
                </Button>
              }
              onGroupCreated={fetchGroups}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {groups.length > 0 ? (
              <div className="space-y-3">
                {groups.map((groupMember) => (
                  <div key={groupMember.group_id} className="flex items-center gap-3 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={groupMember.group_conversations?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {groupMember.group_conversations?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{groupMember.group_conversations?.name}</p>
                        {getRoleIcon(groupMember.role)}
                      </div>
                      {groupMember.group_conversations?.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {groupMember.group_conversations.description}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No groups yet</p>
                <p className="text-xs">Create your first group to get started</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* People You May Know */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-3 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {profile.display_name || profile.username}
                        </p>
                        {profile.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      {profile.display_name && profile.username && (
                        <p className="text-xs text-muted-foreground">@{profile.username}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => startConversation(profile.id)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No suggestions available</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationStarter;
