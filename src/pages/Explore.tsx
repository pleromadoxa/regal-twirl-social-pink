
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SidebarNav from "@/components/SidebarNav";
import UserSearch from "@/components/UserSearch";
import TrendingWidget from "@/components/TrendingWidget";
import ProfessionalUsersWidget from "@/components/ProfessionalUsersWidget";
import { Search, Compass, TrendingUp, Users, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVerifiedStatus } from "@/hooks/useVerifiedStatus";

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  followers_count: number;
  is_verified: boolean;
  bio: string;
}

const Explore = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchSuggestedUsers();
  }, [user]);

  const fetchSuggestedUsers = async () => {
    if (!user) return;

    try {
      setLoadingUsers(true);
      // Fetch users that the current user is not following, ordered by followers count
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, followers_count, is_verified, bio')
        .neq('id', user.id)
        .order('followers_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Filter out users already being followed
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];
      const filteredUsers = users?.filter(u => !followingIds.includes(u.id)) || [];

      setSuggestedUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    // Navigate to search with hashtag
    navigate(`/explore?search=${encodeURIComponent(hashtag)}`);
  };

  const handleFollowUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;

      // Remove user from suggested list
      setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error following user:', error);
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
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-purple-600" />
              Explore
            </h1>
            <UserSearch />
          </div>

          <div className="p-6">
            <div className="grid gap-6">
              {/* Trending Section */}
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  What's Trending
                </h2>
                <TrendingWidget onHashtagClick={handleHashtagClick} />
              </div>

              {/* Suggested Users */}
              <Card className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    Who to Follow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : suggestedUsers.length > 0 ? (
                    <div className="space-y-4">
                      {suggestedUsers.map((suggestedUser) => {
                        const isVerified = useVerifiedStatus(suggestedUser);
                        return (
                          <div key={suggestedUser.id} className="flex items-center justify-between p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors">
                            <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => navigate(`/profile/${suggestedUser.id}`)}>
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={suggestedUser.avatar_url || undefined} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                                  {suggestedUser.display_name?.[0] || suggestedUser.username?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                    {suggestedUser.display_name || suggestedUser.username}
                                  </p>
                                  {isVerified && (
                                    <Badge variant="verified" className="flex items-center gap-1">
                                      <Crown className="w-3 h-3" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  @{suggestedUser.username}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                  {suggestedUser.followers_count} followers
                                </p>
                                {suggestedUser.bio && (
                                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                                    {suggestedUser.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleFollowUser(suggestedUser.id)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
                            >
                              Follow
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-purple-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        No new users to follow
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Accounts */}
              <ProfessionalUsersWidget />
            </div>
          </div>
        </main>

        <aside className="w-80 p-6">
          <TrendingWidget onHashtagClick={handleHashtagClick} />
        </aside>
      </div>
    </div>
  );
};

export default Explore;
