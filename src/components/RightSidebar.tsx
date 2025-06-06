
import { TrendingUp, Users, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NotificationDropdown from './NotificationDropdown';
import UserSearch from './UserSearch';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RightSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const trendingTopics = [
    { topic: '#TechNews', posts: '12.5k posts', trending: true },
    { topic: '#WebDev', posts: '8.2k posts', trending: false },
    { topic: '#AI', posts: '15.1k posts', trending: true },
    { topic: '#Startup', posts: '6.7k posts', trending: false },
    { topic: '#Design', posts: '9.3k posts', trending: true }
  ];

  const suggestedUsers = [
    { name: 'Tech Innovator', username: 'techinnovator', followers: '2.5k', verified: true },
    { name: 'Design Guru', username: 'designguru', followers: '1.8k', verified: false },
    { name: 'AI Researcher', username: 'airesearcher', followers: '3.2k', verified: true },
  ];

  return (
    <aside className="w-80 p-6 space-y-6 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-900 border-l border-purple-200 dark:border-purple-800">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Discover
        </h2>
        {user && <NotificationDropdown />}
      </div>

      {/* Search Section */}
      <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-purple-600" />
            Find People
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserSearch />
        </CardContent>
      </Card>

      {/* Trending Widget */}
      <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            What's trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((trend, index) => (
            <div key={index} className="flex justify-between items-center hover:bg-purple-50 dark:hover:bg-purple-900/20 p-3 rounded-xl cursor-pointer transition-all duration-200 group">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm group-hover:text-purple-600 transition-colors">
                    {trend.topic}
                  </p>
                  {trend.trending && (
                    <Sparkles className="w-3 h-3 text-orange-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500">{trend.posts}</p>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-purple-600 hover:text-purple-700 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl">
            Show more trends
          </Button>
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedUsers.map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.name[0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    {user.verified && <span className="text-blue-500 text-xs">✓</span>}
                  </div>
                  <p className="text-xs text-slate-500">@{user.username}</p>
                  <p className="text-xs text-slate-500">{user.followers} followers</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none hover:from-purple-700 hover:to-pink-700"
              >
                Follow
              </Button>
            </div>
          ))}
          <Button 
            variant="outline" 
            className="w-full rounded-xl border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
            onClick={() => navigate('/explore')}
          >
            Explore more people
          </Button>
        </CardContent>
      </Card>

      {/* Premium Upgrade */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Upgrade to Premium</h3>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
            Get exclusive features, verified badge, and priority support!
          </p>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl">
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};

export default RightSidebar;
