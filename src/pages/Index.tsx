
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import TweetComposer from "@/components/TweetComposer";
import PostsList from "@/components/PostsList";
import ReelsSection from "@/components/ReelsSection";
import { StoriesBar } from "@/components/StoriesBar";
import HomeFeedNav from "@/components/HomeFeedNav";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const [feedFilter, setFeedFilter] = useState<'all' | 'professional' | 'trending'>('all');
  const location = useLocation();
  const isReelsView = location.search.includes('tab=reels');

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex justify-end pr-4 pl-24">
        <main className="w-full max-w-3xl border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {isReelsView ? (
            <div className="p-6">
              <ReelsSection />
            </div>
          ) : (
            <>
              {/* Stories Bar */}
              <div className="border-b border-purple-200 dark:border-purple-800 p-4">
                <StoriesBar />
              </div>

              {/* Home Feed Navigation with Expandable Tabs */}
              <HomeFeedNav onFilterChange={setFeedFilter} />

              {/* Tweet Composer */}
              <div className="border-b border-purple-200 dark:border-purple-800">
                <TweetComposer />
              </div>

              {/* Posts Feed */}
              <PostsList />
            </>
          )}
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Index;
