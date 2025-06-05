
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";
import TrendingWidget from "@/components/TrendingWidget";
import TweetComposer from "@/components/TweetComposer";
import PostsList from "@/components/PostsList";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Sidebar */}
        <SidebarNav />
        
        {/* Main Content */}
        <main className="flex-1 border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-5 z-10">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Home
            </h1>
          </div>

          {/* Enhanced Tweet Composer */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <TweetComposer />
          </div>

          {/* Timeline */}
          <PostsList />
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 p-4 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Regal"
              className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-700 rounded-2xl border-0 focus:ring-2 focus:ring-purple-500 transition-all duration-300 placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <TrendingWidget onHashtagClick={() => {}} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
