
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
  const { user } = useAuth();
  const [feedFilter, setFeedFilter] = useState<'all' | 'professional' | 'trending'>('all');

  
  // Test Supabase connection on mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  if (!user) {
    return null;
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
          <PostsList />
          
          {/* Thread UI */}
          <div className="border-t border-purple-200 dark:border-purple-800 p-4">
            <ThreadUI 
              messages={[
                {
                  id: "1",
                  author: {
                    name: "Pastor Pleroma Emmanuel",
                    username: "pleromadoxa",
                    avatar: "/placeholder.svg",
                    verified: true
                  },
                  content: "📸 **Frame it right! 🖼️** \n\nEvery great photo tells a story. What's the story behind your latest snap? Drop your favorite photo moment below and let's inspire each other! ✨\n\n#Photography #PhotoOfTheDay #CaptureTheMoment #InstaGood #ShootLocal #PhotoLove",
                  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                  likes: 15,
                  replies: 3,
                  isLiked: false,
                  level: 0
                },
                {
                  id: "2",
                  author: {
                    name: "Jane Smith",
                    username: "janesmith",
                    avatar: "/placeholder.svg",
                    verified: false
                  },
                  content: "Love this! Here's my latest sunset shot from the beach 🌅",
                  timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
                  likes: 8,
                  replies: 1,
                  isLiked: true,
                  level: 1
                }
              ]}
              onReply={(id) => console.log("Reply to:", id)}
              onLike={(id) => console.log("Like:", id)}
              onShare={(id) => console.log("Share:", id)}
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
