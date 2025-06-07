import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import TweetComposer from "@/components/TweetComposer";
import PostsList from "@/components/PostsList";
import HomeFeedNav from "@/components/HomeFeedNav";
import StoriesBar from "@/components/StoriesBar";
import FinancialNav from "@/components/FinancialNav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePosts } from "@/hooks/usePosts";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { posts, loading: postsLoading, toggleLike, toggleRetweet, togglePin, deletePost, refetch } = usePosts();
  const [feedFilter, setFeedFilter] = useState<'all' | 'professional' | 'trending'>('all');
  const [financialFilter, setFinancialFilter] = useState<'news' | 'stocks' | 'alerts' | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Filter posts based on selected filter
  const filteredPosts = posts.filter(post => {
    switch (feedFilter) {
      case 'professional':
        // For now, we'll filter by verified users as a proxy for professional accounts
        return post.profiles?.is_verified;
      case 'trending':
        // Simple trending logic: posts with high engagement (likes + retweets)
        const engagementScore = (post.likes_count || 0) + (post.retweets_count || 0);
        return engagementScore >= 5;
      case 'all':
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading Regal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getFeedTitle = () => {
    if (financialFilter) {
      switch (financialFilter) {
        case 'news':
          return 'Financial News';
        case 'stocks':
          return 'Stock Market';
        case 'alerts':
          return 'Price Alerts';
      }
    }
    
    switch (feedFilter) {
      case 'professional':
        return 'Professional Posts';
      case 'trending':
        return 'Trending Posts';
      default:
        return 'Regal Global Network';
    }
  };

  const getFeedDescription = () => {
    if (financialFilter) {
      switch (financialFilter) {
        case 'news':
          return 'Latest financial news and market updates';
        case 'stocks':
          return 'Real-time stock prices and market data';
        case 'alerts':
          return 'Your personalized price alerts and notifications';
      }
    }
    
    switch (feedFilter) {
      case 'professional':
        return 'Posts from verified professional accounts';
      case 'trending':
        return 'Popular posts with high engagement';
      default:
        return 'Connect with the global professional network.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex h-screen">
      <SidebarNav />
      
      <main className="flex-1 max-w-2xl mx-auto border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl flex flex-col h-screen">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {getFeedTitle()}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {getFeedDescription()}
          </p>
        </div>
        
        {/* Stories Bar */}
        <StoriesBar />
        
        {/* Financial Navigation */}
        <FinancialNav onFilterChange={setFinancialFilter} />
        
        <HomeFeedNav onFilterChange={setFeedFilter} />
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div>
            {feedFilter === 'all' && !financialFilter && <TweetComposer />}
            
            <div className="border-t border-purple-200 dark:border-purple-800">
              {financialFilter ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    {financialFilter === 'news' && 'Financial news feed coming soon...'}
                    {financialFilter === 'stocks' && 'Stock market data coming soon...'}
                    {financialFilter === 'alerts' && 'Price alerts dashboard coming soon...'}
                  </p>
                </div>
              ) : postsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-slate-500">Loading your feed...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                <PostsList 
                  posts={filteredPosts}
                  onLike={toggleLike}
                  onRetweet={toggleRetweet}
                  onPin={togglePin}
                  onDelete={deletePost}
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    {feedFilter === 'professional' && 'No professional posts to show yet.'}
                    {feedFilter === 'trending' && 'No trending posts at the moment.'}
                    {feedFilter === 'all' && 'No posts to show yet.'}
                  </p>
                  {feedFilter !== 'all' && (
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                      Try switching to "All Posts" to see more content.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </main>

      <RightSidebar />
    </div>
  );
};

export default Index;
