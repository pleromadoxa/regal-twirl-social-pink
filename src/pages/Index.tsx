
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import { StoriesBar } from "@/components/StoriesBar";
import HomeFeedNav from "@/components/HomeFeedNav";
import { FinancialSection } from "@/components/FinancialSection";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex">
        <main className="flex-1 max-w-2xl border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <HomeFeedNav />
          <StoriesBar />
          <div className="border-b border-purple-200 dark:border-purple-800 p-6">
            <PostComposer />
          </div>
          <PostsList />
          <FinancialSection />
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Index;
