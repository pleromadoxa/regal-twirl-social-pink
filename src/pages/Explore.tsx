
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import UserSearch from '@/components/UserSearch';
import SidebarNav from '@/components/SidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SidebarNav />
      
      <div className={`${isMobile ? 'ml-0' : 'ml-80'} transition-all duration-300`}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Explore Regal Network
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover amazing people and content in our community
            </p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for users, topics, or hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-800/50 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Search Results
                </h2>
                <UserSearch searchQuery={searchQuery} />
              </div>
            </div>

            <div className="space-y-6">
              {/* Trending Topics */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-800/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {['#Faith', '#Community', '#Prayer', '#Inspiration', '#Christian'].map((topic, index) => (
                    <div key={topic} className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{topic}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{Math.floor(Math.random() * 1000) + 100} posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-800/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Who to Follow
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Search for users to see suggestions here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
