
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import TrendingWidget from "./TrendingWidget";
import ProfessionalUsersWidget from "./ProfessionalUsersWidget";
import NotificationDropdown from "./NotificationDropdown";
import UserSearch from "./UserSearch";
import { useNavigate } from "react-router-dom";

const RightSidebar = () => {
  const navigate = useNavigate();

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
