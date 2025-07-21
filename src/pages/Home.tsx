
import { useAuth } from "@/contexts/AuthContext";
import { testSupabaseConnection } from "@/integrations/supabase/client";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import TweetComposer from "@/components/TweetComposer";
import PostsList from "@/components/PostsList";
import { StoriesBar } from "@/components/StoriesBar";
import HomeFeedNav from "@/components/HomeFeedNav";
import ThreadUI from "@/components/ThreadUI";
import { useState, useEffect } from "react";

const Home = () => {
  const { user, loading } = useAuth();
  const [feedFilter, setFeedFilter] = useState<'all' | 'professional' | 'trending'>('all');

  // Test Supabase connection on mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const handleReply = (messageId: string) => {
    console.log("Reply to message:", messageId);
  };

  const handleLike = (messageId: string) => {
    console.log("Like message:", messageId);
  };

  const handleShare = (messageId: string) => {
    console.log("Share message:", messageId);
  };

  // Show loading state during authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user after loading
  if (!user) {
    return null; // This should redirect to auth page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative overflow-x-hidden">
      <SidebarNav />
      
      {/* Mobile and Tablet Layout */}
      <div className="flex-1 flex lg:gap-8 lg:pl-80 lg:pr-[400px] max-w-full overflow-hidden">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl lg:max-w-4xl mx-auto min-w-0 w-full">
          {/* Stories Bar */}
          <div className="border-b border-purple-200 dark:border-purple-800 p-2 sm:p-4">
            <StoriesBar />
          </div>

          {/* Home Feed Navigation */}
          <HomeFeedNav onFilterChange={setFeedFilter} />

          {/* Tweet Composer */}
          <div className="border-b border-purple-200 dark:border-purple-800">
            <TweetComposer />
          </div>

          {/* Posts Feed */}
          <div className="min-h-[200px]"> {/* Minimum height to prevent layout shift */}
            <PostsList />
          </div>
          
          {/* Community Discussions - Always visible and stable */}
          <div className="border-t border-purple-200 dark:border-purple-800 mt-4">
            <ThreadUI 
              onReply={handleReply}
              onLike={handleLike}
              onShare={handleShare}
            />
          </div>
        </main>
      </div>
      
      {/* Right sidebar - hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
