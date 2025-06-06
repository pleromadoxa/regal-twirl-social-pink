
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import UserSearch from "@/components/UserSearch";
import TrendingWidget from "@/components/TrendingWidget";
import { Search, Compass, TrendingUp } from "lucide-react";

const Explore = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-purple-600" />
              Explore
            </h1>
            <UserSearch />
          </div>

          <div className="p-6">
            <div className="grid gap-6">
              {/* Trending Section */}
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  What's Trending
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">#TechNews</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">25.2K posts</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">#AI</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">18.7K posts</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">#Innovation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">12.3K posts</p>
                  </div>
                </div>
              </div>

              {/* Suggested Users */}
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Compass className="w-6 h-6 text-purple-600" />
                  Discover People
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Find interesting people to follow and expand your network.
                </p>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Use the search above to find users
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="w-80 p-6">
          <TrendingWidget onHashtagClick={() => {}} />
        </aside>
      </div>
    </div>
  );
};

export default Explore;
