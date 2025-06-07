
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import { StoriesBar } from "@/components/StoriesBar";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {/* Stories Bar */}
          <div className="border-b border-purple-200 dark:border-purple-800 p-4">
            <StoriesBar />
          </div>

          {/* Post Composer */}
          <div className="border-b border-purple-200 dark:border-purple-800 p-6">
            <PostComposer />
          </div>

          {/* Posts Feed */}
          <PostsList />
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Index;
