
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import { usePosts } from "@/hooks/usePosts";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { posts, loading: postsLoading, toggleLike, toggleRetweet, togglePin, deletePost, refetch } = usePosts();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 max-w-2xl mx-auto border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Home</h1>
        </div>
        
        <PostComposer />
        
        <div className="border-t border-slate-200 dark:border-slate-700">
          {postsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-slate-500">Loading posts...</p>
            </div>
          ) : (
            <PostsList 
              posts={posts}
              onLike={toggleLike}
              onRetweet={toggleRetweet}
              onPin={togglePin}
              onDelete={deletePost}
            />
          )}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
};

export default Index;
