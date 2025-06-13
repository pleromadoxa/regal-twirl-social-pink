
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, TrendingUp, Hash, User, MapPin, Calendar, ExternalLink } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Link, useNavigate } from 'react-router-dom';

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for exploration
  const trendingTopics = [
    { tag: 'technology', posts: 1250, growth: '+15%' },
    { tag: 'business', posts: 980, growth: '+8%' },
    { tag: 'innovation', posts: 750, growth: '+22%' },
    { tag: 'startup', posts: 650, growth: '+12%' },
    { tag: 'ai', posts: 580, growth: '+35%' },
    { tag: 'blockchain', posts: 420, growth: '+18%' },
  ];

  const suggestedUsers = [
    {
      id: '1',
      username: 'techguru',
      displayName: 'Tech Guru',
      avatar: '/placeholder.svg',
      bio: 'Technology enthusiast and startup founder',
      followers: 15000,
      isVerified: true
    },
    {
      id: '2',
      username: 'businessmind',
      displayName: 'Business Mind',
      avatar: '/placeholder.svg',
      bio: 'Business strategist and entrepreneur',
      followers: 8500,
      isVerified: false
    },
    {
      id: '3',
      username: 'innovator',
      displayName: 'The Innovator',
      avatar: '/placeholder.svg',
      bio: 'Innovation consultant and thought leader',
      followers: 12000,
      isVerified: true
    },
  ];

  const featuredBusinesses = [
    {
      id: '1',
      name: 'Tech Solutions Inc',
      category: 'Technology',
      location: 'San Francisco, CA',
      rating: 4.8,
      services: ['Web Development', 'AI Solutions', 'Consulting']
    },
    {
      id: '2',
      name: 'Green Energy Co',
      category: 'Energy',
      location: 'Austin, TX',
      rating: 4.9,
      services: ['Solar Installation', 'Energy Consulting', 'Maintenance']
    },
    {
      id: '3',
      name: 'Digital Marketing Pro',
      category: 'Marketing',
      location: 'New York, NY',
      rating: 4.7,
      services: ['SEO', 'Social Media', 'Content Marketing']
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Explore
            </h1>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search people, topics, businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border-purple-200 dark:border-purple-700"
              />
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="trending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="people">People</TabsTrigger>
                <TabsTrigger value="businesses">Businesses</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Trending Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trendingTopics.map((topic, index) => (
                        <Link 
                          key={topic.tag}
                          to={`/hashtag/${topic.tag}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 font-mono w-6">#{index + 1}</span>
                            <div>
                              <p className="font-medium">#{topic.tag}</p>
                              <p className="text-sm text-slate-500">{topic.posts} posts</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {topic.growth}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="people" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Suggested People
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {suggestedUsers.map((suggestedUser) => (
                        <div key={suggestedUser.id} className="flex items-center justify-between p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              className="cursor-pointer"
                              onClick={() => navigate(`/profile/${suggestedUser.id}`)}
                            >
                              <AvatarImage src={suggestedUser.avatar} />
                              <AvatarFallback>{suggestedUser.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 
                                  className="font-medium cursor-pointer hover:text-purple-600"
                                  onClick={() => navigate(`/profile/${suggestedUser.id}`)}
                                >
                                  {suggestedUser.displayName}
                                </h3>
                                {suggestedUser.isVerified && (
                                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                                )}
                              </div>
                              <p 
                                className="text-sm text-slate-500 cursor-pointer hover:text-purple-600"
                                onClick={() => navigate(`/profile/${suggestedUser.id}`)}
                              >
                                @{suggestedUser.username}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {suggestedUser.bio}
                              </p>
                              <p className="text-xs text-slate-500">
                                {suggestedUser.followers.toLocaleString()} followers
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Follow
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="businesses" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Featured Businesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {featuredBusinesses.map((business) => (
                        <div key={business.id} className="p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-lg">{business.name}</h3>
                              <p className="text-sm text-slate-500">{business.category}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">{business.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">★ {business.rating}</Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {business.services.map((service) => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View Profile
                            </Button>
                            <Button size="sm">
                              Contact
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="topics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-purple-600" />
                      Popular Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {trendingTopics.map((topic) => (
                        <Link 
                          key={topic.tag}
                          to={`/hashtag/${topic.tag}`}
                          className="p-3 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-center"
                        >
                          <p className="font-medium">#{topic.tag}</p>
                          <p className="text-sm text-slate-500">{topic.posts} posts</p>
                        </Link>
                      ))}
                    </div>
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
