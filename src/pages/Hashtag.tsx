
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Hash, 
  TrendingUp, 
  Users, 
  Calendar,
  Heart,
  MessageCircle,
  Repeat2,
  Share
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import UserLink from '@/components/UserLink';

const Hashtag = () => {
  const { hashtag } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 1250,
    recentGrowth: '+15%',
    topContributors: 45,
    trending: true
  });

  // Mock data for demonstration
  const mockPosts = [
    {
      id: '1',
      content: `Excited to share our latest innovation in #${hashtag}! The future is looking bright with these new developments. 🚀`,
      user_id: '1',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes_count: 24,
      replies_count: 8,
      retweets_count: 12,
      profiles: {
        username: 'techinnov8r',
        display_name: 'Tech Innovator',
        avatar_url: '/placeholder.svg'
      }
    },
    {
      id: '2',
      content: `Just published a comprehensive guide on #${hashtag} best practices. Check it out and let me know your thoughts!`,
      user_id: '2',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes_count: 156,
      replies_count: 32,
      retweets_count: 89,
      image_urls: ['/placeholder.svg'],
      profiles: {
        username: 'expertguide',
        display_name: 'Industry Expert',
        avatar_url: '/placeholder.svg'
      }
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, [hashtag]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  #{hashtag}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {stats.totalPosts.toLocaleString()} posts
                </p>
              </div>
              {stats.trending && (
                <Badge className="bg-green-100 text-green-700 ml-auto">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.totalPosts.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total Posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.recentGrowth}</p>
                <p className="text-sm text-slate-500">Recent Growth</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.topContributors}</p>
                <p className="text-sm text-slate-500">Contributors</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="recent" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="people">People</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Hash className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                      No posts found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      Be the first to post about #{hashtag}!
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <UserLink
                            userId={post.user_id}
                            username={post.profiles?.username}
                            displayName={post.profiles?.display_name}
                            avatarUrl={post.profiles?.avatar_url}
                            showAvatar={true}
                            className="w-10 h-10"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <UserLink
                                userId={post.user_id}
                                username={post.profiles?.username}
                                displayName={post.profiles?.display_name}
                                className="font-medium hover:underline"
                              />
                              <span className="text-slate-500">·</span>
                              <span className="text-sm text-slate-500">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            
                            <p className="text-slate-800 dark:text-slate-200 mb-3">
                              {post.content}
                            </p>
                            
                            {post.image_urls && post.image_urls.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-3 rounded-lg overflow-hidden">
                                {post.image_urls.slice(0, 4).map((url: string, index: number) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt=""
                                    className="w-full h-32 object-cover"
                                  />
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-6">
                              <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                                <span className="text-sm">{post.likes_count || 0}</span>
                              </button>
                              
                              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">{post.replies_count || 0}</span>
                              </button>
                              
                              <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors">
                                <Repeat2 className="w-4 h-4" />
                                <span className="text-sm">{post.retweets_count || 0}</span>
                              </button>
                              
                              <button className="text-slate-500 hover:text-purple-500 transition-colors">
                                <Share className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="popular">
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">Popular posts coming soon!</p>
                </div>
              </TabsContent>

              <TabsContent value="people">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">People who post about #{hashtag} coming soon!</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Hashtag;
