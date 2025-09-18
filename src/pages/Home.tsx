
import { useAuth } from "@/contexts/AuthContext";
import { testSupabaseConnection } from "@/integrations/supabase/client";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import TweetComposer from "@/components/TweetComposer";
import PostsList from "@/components/PostsList";
import { StoriesBar } from "@/components/StoriesBar";
import HomeFeedNav from "@/components/HomeFeedNav";
import ThreadUI from "@/components/ThreadUI";
import MobileBottomNav from "@/components/MobileBottomNav";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">Regal Network</h1>
          <div className="flex items-center gap-2">
            {/* Mobile menu or user avatar can go here */}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <SidebarNav />
        
        <div className="flex-1 ml-80 mr-96">
          <main className="w-full max-w-2xl border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto">
            {/* Stories Bar */}
            <div className="border-b border-purple-200 dark:border-purple-800 p-4">
              <StoriesBar />
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="w-full rounded-none border-b border-purple-200 dark:border-purple-800">
                <TabsTrigger value="feed" className="flex-1">Feed</TabsTrigger>
                <TabsTrigger value="discussions" className="flex-1">Community Discussions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="mt-0">
                {/* Home Feed Navigation */}
                <HomeFeedNav onFilterChange={setFeedFilter} />

                {/* Tweet Composer */}
                <div className="border-b border-purple-200 dark:border-purple-800">
                  <TweetComposer />
                </div>

                {/* Posts Feed */}
                <div className="min-h-[200px]">
                  <PostsList />
                </div>
              </TabsContent>
              
              <TabsContent value="discussions" className="mt-0">
                <ThreadUI 
                  onReply={handleReply}
                  onLike={handleLike}
                  onShare={handleShare}
                />
              </TabsContent>
            </Tabs>
          </main>
        </div>
        
        <RightSidebar />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden pt-16">
        <main className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl min-h-screen">
          {/* Mobile Stories Bar */}
          <div className="border-b border-purple-200 dark:border-purple-800 p-2">
            <StoriesBar />
          </div>

          {/* Mobile Tabs Navigation */}
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="w-full rounded-none border-b border-purple-200 dark:border-purple-800 sticky top-16 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur">
              <TabsTrigger value="feed" className="flex-1 text-sm">Feed</TabsTrigger>
              <TabsTrigger value="discussions" className="flex-1 text-sm">Discussions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="mt-0">
              {/* Mobile Home Feed Navigation */}
              <HomeFeedNav onFilterChange={setFeedFilter} />

              {/* Mobile Tweet Composer */}
              <div className="border-b border-purple-200 dark:border-purple-800 p-3">
                <TweetComposer />
              </div>

              {/* Mobile Posts Feed */}
              <div className="min-h-[200px] p-2">
                <PostsList />
              </div>
            </TabsContent>
            
            <TabsContent value="discussions" className="mt-0 p-2">
              <ThreadUI 
                onReply={handleReply}
                onLike={handleLike}
                onShare={handleShare}
              />
            </TabsContent>
          </Tabs>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Home;
