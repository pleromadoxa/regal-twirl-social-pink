
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Building2, Users, TrendingUp, DollarSign, BarChart3, Megaphone, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import BoostPostWidget from '@/components/BoostPostWidget';
import { supabase } from '@/integrations/supabase/client';

const Professional = () => {
  const { user } = useAuth();
  const { userPages, allPages, loading } = useBusinessPages();
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [adsStats, setAdsStats] = useState({ active: 0, total_spend: 0, impressions: 0 });

  useEffect(() => {
    if (userPages && userPages.length > 0) {
      fetchRecentPosts();
      fetchAdsStats();
    }
  }, [userPages]);

  const fetchRecentPosts = async () => {
    if (!user || !userPages?.length) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setRecentPosts(data || []);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  const fetchAdsStats = async () => {
    if (!userPages?.length) return;
    
    try {
      const pageIds = userPages.map(page => page.id);
      const { data, error } = await supabase
        .from('business_ads')
        .select(`
          *,
          ad_analytics(impressions, spent_amount)
        `)
        .in('business_page_id', pageIds);
      
      if (error) throw error;
      
      const stats = data?.reduce((acc, ad) => {
        acc.active += ad.status === 'active' ? 1 : 0;
        acc.total_spend += ad.spent_amount || 0;
        acc.impressions += ad.impressions || 0;
        return acc;
      }, { active: 0, total_spend: 0, impressions: 0 }) || { active: 0, total_spend: 0, impressions: 0 };
      
      setAdsStats(stats);
    } catch (error) {
      console.error('Error fetching ads stats:', error);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center pl-80 pr-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading professional dashboard...</p>
          </div>
        </div>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[400px] max-w-full overflow-hidden">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto min-w-0">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-purple-600" />
                  Professional Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage your business presence and grow your audience
                </p>
              </div>
              <Link to="/create-professional">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 border-b border-purple-200 dark:border-purple-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-4 text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{userPages?.length || 0}</p>
                  <p className="text-sm opacity-90">Business Pages</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {userPages?.reduce((sum, page) => sum + (page.followers_count || 0), 0) || 0}
                  </p>
                  <p className="text-sm opacity-90">Total Followers</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white">
                <CardContent className="p-4 text-center">
                  <Megaphone className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{adsStats.active}</p>
                  <p className="text-sm opacity-90">Active Ads</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">${adsStats.total_spend.toFixed(2)}</p>
                  <p className="text-sm opacity-90">Ad Spend</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pages">Business Pages</TabsTrigger>
                <TabsTrigger value="ads">Advertising</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Business Pages Overview */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Your Business Pages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userPages && userPages.length > 0 ? (
                      <div className="space-y-4">
                        {userPages.map((page) => (
                          <div key={page.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                                {page.page_name[0]}
                              </div>
                              <div>
                                <h3 className="font-semibold">{page.page_name}</h3>
                                <p className="text-sm text-gray-500">{page.followers_count} followers</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {page.is_verified && (
                                <Badge variant="secondary">Verified</Badge>
                              )}
                              <Link to={`/professional/${page.id}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No business pages yet</h3>
                        <p className="text-gray-500 mb-4">Create your first business page to get started</p>
                        <Link to="/create-professional">
                          <Button>Create Business Page</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Posts with Boost Options */}
                {recentPosts.length > 0 && (
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Recent Posts - Boost Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentPosts.slice(0, 3).map((post) => (
                          <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm line-clamp-2">{post.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{post.likes_count} likes</span>
                                <span>{post.retweets_count} shares</span>
                                <span>{post.views_count} views</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {userPages && userPages.length > 0 && (
                                <BoostPostWidget 
                                  postId={post.id} 
                                  businessPageId={userPages[0].id} 
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pages">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Manage Business Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userPages && userPages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userPages.map((page) => (
                          <div key={page.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                {page.page_name[0]}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">{page.page_name}</h3>
                                <p className="text-sm text-gray-500">{page.category}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">{page.followers_count}</p>
                                <p className="text-xs text-gray-500">Followers</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{page.posts_count || 0}</p>
                                <p className="text-xs text-gray-500">Posts</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link to={`/professional/${page.id}`} className="flex-1">
                                <Button variant="outline" className="w-full">View Page</Button>
                              </Link>
                              <Link to={`/edit-professional/${page.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Create Your Business Presence</h3>
                        <p className="text-gray-500 mb-6">Build your professional brand and reach more customers</p>
                        <Link to="/create-professional">
                          <Button size="lg">Get Started</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ads">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5" />
                      Advertising & Promotion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Megaphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold">{adsStats.active}</p>
                        <p className="text-sm text-gray-600">Active Campaigns</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold">{adsStats.impressions.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Impressions</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <p className="text-2xl font-bold">${adsStats.total_spend.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total Spend</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Boost Your Content</h3>
                      <p className="text-gray-600 mb-4">Reach more people and grow your audience with targeted advertising</p>
                      {userPages && userPages.length > 0 ? (
                        <BoostPostWidget businessPageId={userPages[0].id} />
                      ) : (
                        <p className="text-sm text-gray-500">Create a business page first to start advertising</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
                      <p className="text-gray-500">Detailed performance metrics and insights will be available here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Professional;
