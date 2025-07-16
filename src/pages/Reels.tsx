
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import ReelsSection from "@/components/ReelsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, TrendingUp, Fire, Music, Heart, Eye } from "lucide-react";

const Reels = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[400px] max-w-full overflow-hidden">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto min-w-0">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Video className="w-6 h-6 text-purple-600" />
                  Reels
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Discover trending short videos and create your own
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-6 border-b border-purple-200 dark:border-purple-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-pink-500 to-red-500 text-white">
                <CardContent className="p-3 text-center">
                  <Fire className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-lg font-bold">1.2M</p>
                  <p className="text-xs opacity-90">Trending</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white">
                <CardContent className="p-3 text-center">
                  <Music className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-lg font-bold">850K</p>
                  <p className="text-xs opacity-90">Music</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-3 text-center">
                  <Heart className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-lg font-bold">2.8M</p>
                  <p className="text-xs opacity-90">Likes</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <CardContent className="p-3 text-center">
                  <Eye className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-lg font-bold">15.2M</p>
                  <p className="text-xs opacity-90">Views</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reels Tabs */}
          <div className="p-6">
            <Tabs defaultValue="for-you" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                <TabsTrigger value="for-you" className="flex items-center gap-2">
                  <Fire className="w-4 h-4" />
                  For You
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="music" className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Music
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="for-you">
                <ReelsSection />
              </TabsContent>

              <TabsContent value="trending">
                <div className="space-y-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Trending Reels
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                            <div className="w-12 h-12 bg-purple-200 dark:bg-purple-700 rounded-lg animate-pulse"></div>
                            <div className="flex-1">
                              <p className="font-medium">Trending Reel #{i}</p>
                              <p className="text-sm text-gray-500">2.{i}M views • 48K likes</p>
                            </div>
                            <Badge variant="outline" className="bg-orange-100 text-orange-600">
                              #{i} Trending
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="music">
                <div className="space-y-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-purple-500" />
                        Music-Based Reels
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg">
                            <div className="w-12 h-12 bg-purple-200 dark:bg-purple-700 rounded-lg animate-pulse flex items-center justify-center">
                              <Music className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Christian Music Reel #{i}</p>
                              <p className="text-sm text-gray-500">1.{i}M views • 32K likes</p>
                            </div>
                            <Badge variant="outline" className="bg-purple-100 text-purple-600">
                              Music
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="following">
                <ReelsSection />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Reels;
