
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import AIPostComposer from "@/components/AIPostComposer";
import PostsList from "@/components/PostsList";
import HomeFeedNav from "@/components/HomeFeedNav";
import { usePosts } from "@/hooks/usePosts";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { posts, loading: postsLoading, toggleLike, toggleRetweet, togglePin, deletePost, refetch } = usePosts();
  const [feedFilter, setFeedFilter] = useState<'all' | 'professional' | 'trending'>('all');

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
    switch (feedFilter) {
      case 'professional':
        return 'Professional Posts';
      case 'trending':
        return 'Trending Posts';
      default:
        return 'Home Feed';
    }
  };

  const getFeedDescription = () => {
    switch (feedFilter) {
      case 'professional':
        return 'Posts from verified professional accounts';
      case 'trending':
        return 'Popular posts with high engagement';
      default:
        return 'Welcome back! See what\'s happening in your network.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 max-w-2xl mx-auto border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {getFeedTitle()}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {getFeedDescription()}
          </p>
        </div>
        
        <HomeFeedNav onFilterChange={setFeedFilter} />
        
        {feedFilter === 'all' && <AIPostComposer />}
        
        <div className="border-t border-purple-200 dark:border-purple-800">
          {postsLoading ? (
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
      </main>

      <RightSidebar />
    </div>
  );
};

export default Index;
