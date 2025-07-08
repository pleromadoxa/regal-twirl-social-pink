
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import TweetComposer from "@/components/TweetComposer";
import PostsList from "@/components/PostsList";
import { StoriesBar } from "@/components/StoriesBar";
import HomeFeedNav from "@/components/HomeFeedNav";
import { useState } from "react";

const Home = () => {
  const { user } = useAuth();
  const [feedFilter, setFeedFilter] = useState<'all' | 'professional' | 'trending'>('all');

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[400px] max-w-full overflow-hidden">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto min-w-0">
          {/* Stories Bar */}
          <div className="border-b border-purple-200 dark:border-purple-800 p-4">
            <StoriesBar />
          </div>

          {/* Home Feed Navigation */}
          <HomeFeedNav onFilterChange={setFeedFilter} />

          {/* Tweet Composer */}
          <div className="border-b border-purple-200 dark:border-purple-800">
            <TweetComposer />
          </div>

          {/* Posts Feed */}
          <PostsList />
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Home;
