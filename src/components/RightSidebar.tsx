
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import TrendingWidget from "./TrendingWidget";
import NotificationDropdown from "./NotificationDropdown";
import UserSearch from "./UserSearch";
import { useNavigate } from "react-router-dom";

const RightSidebar = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleHashtagClick = (hashtag: string) => {
    // Navigate to explore page with hashtag search
    navigate(`/explore?search=${encodeURIComponent(hashtag)}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <aside className="w-96 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 border-l border-purple-200 dark:border-purple-800 h-screen overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Top actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <NotificationDropdown />
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

          {/* Search */}
          <UserSearch showMessageButton />

          {/* Trending */}
          <TrendingWidget onHashtagClick={handleHashtagClick} />
        </div>
      </ScrollArea>
    </aside>
  );
};

export default RightSidebar;
