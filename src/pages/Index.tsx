
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarNav from "@/components/SidebarNav";
import TrendingWidget from "@/components/TrendingWidget";
import PostComposer from "@/components/PostComposer";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950 transition-all duration-700">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Sidebar */}
        <SidebarNav />
        
        {/* Main Content */}
        <main className="flex-1 border-x border-purple-200 dark:border-purple-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-700 p-5 z-10">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 dark:from-purple-400 dark:via-blue-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
              Home
            </h1>
          </div>

          {/* Post Composer */}
          <div className="border-b border-purple-200 dark:border-purple-700 bg-white/40 dark:bg-slate-900/40">
            <PostComposer />
          </div>

          {/* Timeline */}
          <PostsList />
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 p-4 space-y-6 bg-white/40 dark:bg-slate-900/40">
          {/* Enhanced Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-4 w-5 h-5 text-purple-400 dark:text-purple-500 group-hover:scale-110 transition-transform duration-300" />
            <input
              type="text"
              placeholder="Search Regal"
              className="w-full pl-12 pr-4 py-4 bg-purple-100 dark:bg-purple-900 rounded-2xl border-0 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:bg-white dark:focus:bg-purple-700 transition-all duration-500 placeholder:text-purple-500 dark:placeholder:text-purple-400 text-slate-900 dark:text-slate-100 shadow-lg hover:shadow-xl focus:scale-105"
            />
          </div>

          <TrendingWidget onHashtagClick={() => {}} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
