
import { useState, useEffect } from 'react';
import { Search, Users, TrendingUp, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  following_count: number;
}

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, followers_count, following_count')
        .neq('id', user.id)
        .limit(10);

      if (error) {
        console.error('Error fetching suggested users:', error);
        return;
      }

      setSuggestedUsers(data || []);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio, followers_count, following_count')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .neq('id', user?.id || '')
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        console.error('Error following user:', error);
        toast({
          title: "Error",
          description: "Failed to follow user",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "User followed successfully"
      });

      // Refresh suggested users
      fetchSuggestedUsers();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const startConversation = async (recipientId: string) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`)
        .single();

      if (existingConv) {
        navigate('/messages');
        return;
      }

      // Create new conversation
      const { error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: recipientId
        });

      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }

      toast({
        title: "Conversation started",
        description: "You can now chat with this user"
      });

      navigate('/messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuggestedUsers();
    }
  }, [user]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const UserCard = ({ profile }: { profile: Profile }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
              <span className="text-lg font-medium">
                {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm truncate">
                  {profile.display_name || profile.username}
                </h3>
                <p className="text-sm text-slate-500">@{profile.username}</p>
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 line-clamp-2">
                {profile.bio}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>{profile.followers_count || 0} followers</span>
              <span>{profile.following_count || 0} following</span>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/profile/${profile.id}`)}
              >
                View Profile
              </Button>
              <Button
                size="sm"
                onClick={() => followUser(profile.id)}
              >
                Follow
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => startConversation(profile.id)}
              >
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
              <Search className="w-6 h-6" />
              Explore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search for people, topics, or hashtags..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="people" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="people">
              <Users className="w-4 h-4 mr-2" />
              People
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="topics">
              <Hash className="w-4 h-4 mr-2" />
              Topics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-4">
            {searchQuery ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Search Results for "{searchQuery}"
                </h3>
                {loading ? (
                  <div className="text-center py-8">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="grid gap-4">
                    {searchResults.map((profile) => (
                      <UserCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No users found for "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Suggested for you</h3>
                {suggestedUsers.length > 0 ? (
                  <div className="grid gap-4">
                    {suggestedUsers.map((profile) => (
                      <UserCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No suggestions available
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
                <div className="space-y-3">
                  {['#TechNews', '#WebDev', '#AI', '#Startup', '#Design'].map((topic, index) => (
                    <div key={index} className="flex justify-between items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                      <div>
                        <p className="font-medium">{topic}</p>
                        <p className="text-sm text-slate-500">{Math.floor(Math.random() * 20) + 5}k posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Popular Topics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Technology', 'Business', 'Design', 'Programming', 'Marketing', 'Startups'].map((topic, index) => (
                    <Button key={index} variant="outline" className="h-20 flex-col">
                      <Hash className="w-5 h-5 mb-1" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
