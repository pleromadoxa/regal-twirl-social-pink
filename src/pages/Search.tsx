
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import UserSearch from "@/components/UserSearch";
import TrendingWidget from "@/components/TrendingWidget";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[400px] max-w-full overflow-hidden">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto min-w-0">
          <div className="p-6">
            <div className="mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search users, posts, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-800/80"
                />
              </div>
            </div>
            
            {searchQuery ? (
              <UserSearch searchQuery={searchQuery} />
            ) : (
              <div className="space-y-6">
                {/* Trending Topics */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Trending in Faith
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-orange-500 text-white">Testimony</Badge>
                        <span className="text-green-600 text-sm font-medium">+32%</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">#PraiseReport</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">15.2K Posts</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-green-600 text-white">Prayer</Badge>
                        <span className="text-green-600 text-sm font-medium">+18%</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-purple-600">#PrayerRequest</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">28.5K Posts</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-600 text-white">Devotion</Badge>
                        <span className="text-green-600 text-sm font-medium">+25%</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">#DailyBread</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">12.8K Posts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Search;
