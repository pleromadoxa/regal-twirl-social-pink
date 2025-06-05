
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePinnedPosts } from "@/hooks/usePinnedPosts";
import SidebarNav from "@/components/SidebarNav";
import PostsList from "@/components/PostsList";

const Pinned = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { pinnedPosts, loading } = usePinnedPosts();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto flex gap-6">
        <SidebarNav />
        
        <main className="flex-1 border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-5 z-10">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Pinned Posts
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Posts you've pinned for easy access
            </p>
          </div>

          {/* Pinned Posts */}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : pinnedPosts.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {pinnedPosts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 dark:text-slate-400">
                    <Pin className="w-4 h-4" />
                    <span>Pinned post</span>
                  </div>
                  {/* Post content would go here - using the same structure as PostsList */}
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      {post.profiles?.avatar_url ? (
                        <img
                          src={post.profiles.avatar_url}
                          alt={post.profiles.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                          {(post.profiles?.display_name || post.profiles?.username || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {post.profiles?.display_name || 'Unknown User'}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          @{post.profiles?.username || 'unknown'}
                        </span>
                        <span className="text-slate-500 dark:text-slate-500">·</span>
                        <span className="text-slate-500 dark:text-slate-500 text-sm">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Pin className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No pinned posts yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Pin posts you want to save for later by clicking the pin icon on any post.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Pinned;
