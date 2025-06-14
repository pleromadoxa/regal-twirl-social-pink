
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Users, Hash, MapPin } from 'lucide-react';
import PostsList from '@/components/PostsList';
import UserSearch from '@/components/UserSearch';
import TrendingWidget from '@/components/TrendingWidget';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(hashtag);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Explore</h1>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search for posts, people, or hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              />
            </div>

            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Posts
                </TabsTrigger>
                <TabsTrigger value="people" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="places" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Places
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6">
                {searchQuery ? (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Posts containing "{searchQuery}"
                    </h2>
                    <PostsList searchQuery={searchQuery} />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Trending Posts
                    </h2>
                    <PostsList />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="people" className="mt-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    People
                  </h2>
                  <UserSearch showMessageButton={false} />
                </div>
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Trending Topics
                  </h2>
                  <TrendingWidget onHashtagClick={handleHashtagClick} />
                </div>
              </TabsContent>

              <TabsContent value="places" className="mt-6">
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Places feature coming soon
                  </h2>
                  <p className="text-gray-500 dark:text-gray-500">
                    Discover posts from specific locations and venues.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Explore;
