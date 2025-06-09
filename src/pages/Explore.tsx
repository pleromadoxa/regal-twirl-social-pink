
import { useState } from "react";
import { Search, TrendingUp, Users, Video, Hash } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import UserSearch from "@/components/UserSearch";
import TrendingWidget from "@/components/TrendingWidget";
import ProfessionalUsersWidget from "@/components/ProfessionalUsersWidget";
import ReelsSection from "@/components/ReelsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState("trending");

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/hashtag/${encodeURIComponent(hashtag.replace('#', ''))}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                Explore
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover trending content, users, and short video reels
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="reels" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Reels
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Hashtags
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      What's Trending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TrendingWidget onHashtagClick={handleHashtagClick} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Professional Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfessionalUsersWidget />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-purple-600" />
                      Find Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserSearch 
                      showMessageButton 
                      initialQuery={searchQuery}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Professional Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfessionalUsersWidget />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reels" className="space-y-6">
                <ReelsSection />
              </TabsContent>

              <TabsContent value="hashtags" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-purple-600" />
                      Popular Hashtags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TrendingWidget onHashtagClick={handleHashtagClick} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Explore;
