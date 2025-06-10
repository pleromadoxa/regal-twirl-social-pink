import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import TrendingWidget from "@/components/TrendingWidget";
import ProfessionalUsersWidget from "@/components/ProfessionalUsersWidget";
import UserSearch from "@/components/UserSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, Briefcase, Users } from "lucide-react";
import StoriesBar from "@/components/StoriesBar";
import BibleVerseWidget from "@/components/BibleVerseWidget";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Navigation */}
        <div className="w-64 flex-shrink-0">
          <SidebarNav />
        </div>
        
        {/* Main Content Area - 4 Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          
          {/* Column 1: Stories + Quick Actions */}
          <div className="space-y-6">
            <StoriesBar />
            <Card className="border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/messages')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/explore')}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Explore
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/professional')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Business
                </Button>
              </CardContent>
            </Card>
            <BibleVerseWidget className="sticky top-6" />
          </div>

          {/* Column 2: Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="sticky top-6 z-10">
              <PostComposer />
            </div>
            <PostsList />
          </div>

          {/* Column 3: Right Sidebar */}
          <div className="space-y-6">
            <TrendingWidget />
            <ProfessionalUsersWidget />
            <Card className="border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Suggested Follows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserSearch showMessageButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
