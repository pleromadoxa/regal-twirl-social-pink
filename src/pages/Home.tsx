
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
  const [threadMessages, setThreadMessages] = useState([]);

  // Sample thread data that will always be available
  const sampleThreadMessages = [
    {
      id: "1",
      author: {
        name: "Pastor Pleroma Emmanuel",
        username: "pleromadoxa",
        avatar: "/placeholder.svg",
        verified: true
      },
      content: "🙏 **Daily Reflection** 📖\n\nEven in our darkest moments, God's light shines through. Remember that every challenge is an opportunity for growth and every setback is a setup for a comeback! ✨\n\nWhat's one thing you're grateful for today? Share your blessings below! 💕\n\n#Faith #Gratitude #BlessedLife #DailyReflection",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 24,
      replies: 5,
      isLiked: false,
      level: 0
    },
    {
      id: "2",
      author: {
        name: "Sarah Grace",
        username: "sarahgrace",
        avatar: "/placeholder.svg",
        verified: false
      },
      content: "Thank you for this beautiful reminder! I'm grateful for my family's health and the opportunity to serve others in my community. God is good! 🙏✨",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      likes: 12,
      replies: 2,
      isLiked: true,
      level: 1
    },
    {
      id: "3",
      author: {
        name: "David Faithful",
        username: "davidfaithful",
        avatar: "/placeholder.svg",
        verified: false
      },
      content: "Amen! I'm grateful for second chances and the grace that covers us daily. His mercies are new every morning! 🌅",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      likes: 8,
      replies: 1,
      isLiked: false,
      level: 1
    }
  ];

  // Set thread messages on component mount
  useEffect(() => {
    setThreadMessages(sampleThreadMessages);
  }, []);
  
  // Test Supabase connection on mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const handleReply = (messageId: string) => {
    console.log("Reply to message:", messageId);
  };

  const handleLike = (messageId: string) => {
    console.log("Like message:", messageId);
    // Update the message like status
    setThreadMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isLiked: !msg.isLiked, likes: msg.isLiked ? msg.likes - 1 : msg.likes + 1 }
          : msg
      )
    );
  };

  const handleShare = (messageId: string) => {
    console.log("Share message:", messageId);
  };

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
          
          {/* Thread UI - Always render with stable data */}
          <div className="border-t border-purple-200 dark:border-purple-800">
            <ThreadUI 
              messages={threadMessages}
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
