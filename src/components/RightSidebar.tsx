
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import TrendingWidget from "./TrendingWidget";
import ProfessionalUsersWidget from "./ProfessionalUsersWidget";
import NotificationDropdown from "./NotificationDropdown";
import UserSearch from "./UserSearch";
import PresenceIndicator from "./PresenceIndicator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFollow } from "@/hooks/useFollow";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RightSidebar = () => {
  const { user } = useAuth();
  const { followUser, loading: followLoading } = useFollow();
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Fetch suggested users
  const { data: suggestedUsers = [], isLoading } = useQuery({
    queryKey: ['suggested-users', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified, followers_count')
        .neq('id', user.id)
        .order('followers_count', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching suggested users:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user
  });

  const handleFollow = async (userId: string) => {
    const success = await followUser(userId);
    if (success) {
      setFollowingUsers(prev => new Set([...prev, userId]));
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleHashtagClick = (hashtag: string) => {
    // Navigate to explore page with hashtag search
    navigate(`/explore?search=${encodeURIComponent(hashtag)}`);
  };

  return (
    <aside className="w-96 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 border-l border-purple-200 dark:border-purple-800 h-screen overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Notifications */}
          <div className="flex justify-end">
            <NotificationDropdown />
          </div>

          {/* Search */}
          <UserSearch showMessageButton />

          {/* Who to Follow */}
          {user && (
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Who to Follow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-1"></div>
                          <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center justify-between p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                      <div 
                        className="flex items-center space-x-3 flex-1 cursor-pointer"
                        onClick={() => handleUserClick(suggestedUser.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={suggestedUser.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {suggestedUser.display_name?.[0]?.toUpperCase() || suggestedUser.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1">
                            <PresenceIndicator userId={suggestedUser.id} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                              {suggestedUser.display_name || suggestedUser.username}
                            </p>
                            {suggestedUser.is_verified && (
                              <Badge className="bg-blue-500 text-white text-xs px-1 py-0">✓</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">@{suggestedUser.username}</p>
                          <p className="text-xs text-slate-400">
                            {suggestedUser.followers_count || 0} followers
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(suggestedUser.id);
                        }}
                        disabled={followLoading || followingUsers.has(suggestedUser.id)}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs px-3 py-1"
                      >
                        {followingUsers.has(suggestedUser.id) ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Trending */}
          <TrendingWidget onHashtagClick={handleHashtagClick} />

          {/* Professional Users */}
          <ProfessionalUsersWidget />
        </div>
      </ScrollArea>
    </aside>
  );
};

export default RightSidebar;
