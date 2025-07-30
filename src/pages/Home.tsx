
import { useAuth } from "@/contexts/AuthContext";
import { testSupabaseConnection } from "@/integrations/supabase/client";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import TweetComposer from "@/components/TweetComposer";
import PostsList from "@/components/PostsList";
import { StoriesBar } from "@/components/StoriesBar";
import HomeFeedNav from "@/components/HomeFeedNav";
import ThreadUI from "@/components/ThreadUI";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

const Home = () => {
  console.log('Home: Component rendering - START');
  const { user, loading } = useAuth();
  console.log('Home: Auth state - user:', !!user, 'loading:', loading);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80 dark:from-slate-900 dark:via-purple-900/80 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 lg:mr-96">
        <div className="max-w-2xl mx-auto">
          {/* Stories Bar */}
          <div className="border-b border-purple-200/30 dark:border-purple-800/30 p-4 sm:p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <StoriesBar />
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="w-full rounded-none border-b border-purple-200/30 dark:border-purple-800/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <TabsTrigger value="feed" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Feed</TabsTrigger>
              <TabsTrigger value="discussions" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Community Discussions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="mt-0">
              {/* Home Feed Navigation */}
              <HomeFeedNav onFilterChange={setFeedFilter} />

              {/* Tweet Composer */}
              <div className="border-b border-purple-200/30 dark:border-purple-800/30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <TweetComposer />
              </div>

              {/* Posts Feed */}
              <div className="min-h-[200px] p-4 sm:p-6">
                <PostsList />
              </div>
            </TabsContent>
            
            <TabsContent value="discussions" className="mt-0">
              <div className="p-4 sm:p-6">
                <ThreadUI 
                  onReply={handleReply}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <div className="hidden lg:block">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
