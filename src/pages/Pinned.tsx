
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePinnedPosts } from "@/hooks/usePinnedPosts";
import SidebarNav from "@/components/SidebarNav";
import PostsList from "@/components/PostsList";
import { Pin, Bookmark } from "lucide-react";

const Pinned = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pinnedPosts, loading: pinnedLoading, togglePin } = usePinnedPosts();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <Pin className="w-8 h-8 text-purple-600" />
            Pinned Posts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your saved posts for quick access
          </p>
        </div>

        {pinnedLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="ml-4 text-slate-500">Loading pinned posts...</p>
          </div>
        ) : pinnedPosts.length > 0 ? (
          <PostsList 
            posts={pinnedPosts.map(post => ({ ...post, user_pinned: true }))}
            onLike={() => {}} 
            onRetweet={() => {}} 
            onPin={togglePin}
          />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-16 h-16 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                No pinned posts yet
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                Pin important posts to easily find them later. Your pinned posts will appear here for quick access.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pinned;
