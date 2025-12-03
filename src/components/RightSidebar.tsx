
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Shield, Search as SearchIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import TrendingWidget from "./TrendingWidget";
import NotificationDropdown from "./NotificationDropdown";
import EnhancedShoppingCart from "./EnhancedShoppingCart";
import UserSearch from "./UserSearch";
import WhoToFollow from "./WhoToFollow";
import MoodBoardWidget from "./MoodBoardWidget";
import ChallengesWidget from "./ChallengesWidget";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const RightSidebar = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Check if user is admin (pleromadoxa@gmail.com)
      const isUserAdmin = user.email === 'pleromadoxa@gmail.com' || profile?.username === 'pleromadoxa';
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    // Navigate to hashtag page - remove # symbol for URL
    const hashtagName = hashtag.replace('#', '');
    navigate(`/hashtag/${hashtagName}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <aside className="fixed right-0 top-0 w-96 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 border-l border-purple-200 dark:border-purple-800 h-screen overflow-hidden z-10">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Top actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <EnhancedShoppingCart />
              <NotificationDropdown />
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAdminClick}
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  title="Admin Dashboard"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-600 dark:text-slate-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Search Section */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-purple-600" />
                Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search users, posts, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-800/80 border-purple-200 dark:border-purple-700 transition-all duration-faster"
                />
              </div>
              
              {searchQuery && (
                <div className="max-h-60 overflow-y-auto animate-in fade-in duration-fast">
                  <UserSearch searchQuery={searchQuery} showMessageButton />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Who to Follow */}
          <WhoToFollow />

          {/* Mood Board Widget */}
          <MoodBoardWidget />

          {/* Challenges Widget */}
          <ChallengesWidget />

          {/* Trending */}
          <TrendingWidget onHashtagClick={handleHashtagClick} />
        </div>
      </ScrollArea>
    </aside>
  );
};

export default RightSidebar;
