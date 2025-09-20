import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useIsMobile } from '@/hooks/use-mobile';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
// import ActiveChatBar from '@/components/ActiveChatBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Megaphone, 
  Plus, 
  BarChart3, 
  DollarSign, 
  Eye, 
  MousePointer, 
  TrendingUp,
  Calendar,
  Pause,
  Play,
  Trash2,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const AdsManager = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ads, setAds] = useState<any[]>([]);
  const [sponsoredPosts, setSponsoredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchAdsData();
    }
  }, [user, selectedPage]);

  const fetchAdsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch business ads
      let adsQuery = supabase
        .from('business_ads')
        .select(`
          *,
          business_pages!inner(
            id,
            page_name,
            page_type,
            owner_id
          )
        `)
        .eq('business_pages.owner_id', user.id);

      if (selectedPage !== 'all') {
        adsQuery = adsQuery.eq('business_page_id', selectedPage);
      }

      const { data: adsData, error: adsError } = await adsQuery
        .order('created_at', { ascending: false });

      if (adsError) throw adsError;

      // Fix the sponsored posts query by specifying the correct relationship
      let sponsoredQuery = supabase
        .from('sponsored_posts')
        .select(`
          *,
          posts!sponsored_posts_post_id_fkey(
            id,
            content,
            image_urls,
            created_at
          ),
          business_pages!inner(
            id,
            page_name,
            page_type,
            owner_id
          )
        `)
        .eq('business_pages.owner_id', user.id);

      if (selectedPage !== 'all') {
        sponsoredQuery = sponsoredQuery.eq('business_page_id', selectedPage);
      }

      const { data: sponsoredData, error: sponsoredError } = await sponsoredQuery
        .order('created_at', { ascending: false });

      if (sponsoredError) throw sponsoredError;

      setAds(adsData || []);
      setSponsoredPosts(sponsoredData || []);
    } catch (error) {
      console.error('Error fetching ads data:', error);
      toast({
        title: "Error",
        description: "Failed to load ads data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: string, type: 'ad' | 'sponsored') => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const table = type === 'ad' ? 'business_ads' : 'sponsored_posts';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Ad ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`
      });

      fetchAdsData();
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast({
        title: "Error",
        description: "Failed to update ad status",
        variant: "destructive"
      });
    }
  };

  const deleteAd = async (adId: string, type: 'ad' | 'sponsored') => {
    try {
      const table = type === 'ad' ? 'business_ads' : 'sponsored_posts';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast({
        title: "Ad Deleted",
        description: "Ad has been deleted successfully"
      });

      fetchAdsData();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Error",
        description: "Failed to delete ad",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      paused: 'bg-yellow-500',
      completed: 'bg-blue-500',
      cancelled: 'bg-red-500',
      pending: 'bg-gray-500'
    };

    return (
      <Badge className={`${colors[status as keyof typeof colors]} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalSpent = [...ads, ...sponsoredPosts].reduce((sum, item) => sum + (item.spent_amount || 0), 0);
  const totalImpressions = [...ads, ...sponsoredPosts].reduce((sum, item) => sum + (item.impressions || 0), 0);
  const totalClicks = [...ads, ...sponsoredPosts].reduce((sum, item) => sum + (item.clicks || 0), 0);
  const averageCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 ml-80 mr-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 mr-96 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-purple-600" />
                Ads Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your business advertisements and sponsored posts
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Business Page Filter */}
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select business page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Business Pages</SelectItem>
                    {myPages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.page_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => navigate('/create-ad')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Ad
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Spent</p>
                    <p className="text-xl font-bold">${totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Impressions</p>
                    <p className="text-xl font-bold">{totalImpressions.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <MousePointer className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Clicks</p>
                    <p className="text-xl font-bold">{totalClicks.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">CTR</p>
                    <p className="text-xl font-bold">{averageCTR}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ads and Sponsored Posts */}
          <Tabs defaultValue="sponsored" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sponsored">Boosted Posts ({sponsoredPosts.length})</TabsTrigger>
              <TabsTrigger value="ads">Business Ads ({ads.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="sponsored" className="space-y-4">
              {sponsoredPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Megaphone className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      No Boosted Posts Yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      Start boosting your posts to reach a wider audience
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sponsoredPosts.map((sponsored) => (
                  <Card key={sponsored.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg">Boosted Post</h3>
                            {getStatusBadge(sponsored.status)}
                            <Badge variant="outline">
                              {sponsored.business_pages?.page_name}
                            </Badge>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-4">
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                              {sponsored.posts?.content}
                            </p>
                            {sponsored.posts?.image_urls && sponsored.posts.image_urls.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {sponsored.posts.image_urls.slice(0, 3).map((url: string, index: number) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Budget</p>
                              <p className="font-semibold">${sponsored.budget_amount}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Spent</p>
                              <p className="font-semibold">${sponsored.spent_amount || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Impressions</p>
                              <p className="font-semibold">{sponsored.impressions || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Clicks</p>
                              <p className="font-semibold">{sponsored.clicks || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Started {formatDistanceToNow(new Date(sponsored.created_at), { addSuffix: true })}
                            </span>
                            <span>•</span>
                            <span>Ends {formatDistanceToNow(new Date(sponsored.ends_at), { addSuffix: true })}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAdStatus(sponsored.id, sponsored.status, 'sponsored')}
                          >
                            {sponsored.status === 'active' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAd(sponsored.id, 'sponsored')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="ads" className="space-y-4">
              {ads.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      No Business Ads Yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      Create your first business advertisement to promote your services
                    </p>
                  </CardContent>
                </Card>
              ) : (
                ads.map((ad) => (
                  <Card key={ad.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg">{ad.title}</h3>
                            {getStatusBadge(ad.status)}
                            <Badge variant="outline">
                              {ad.business_pages?.page_name}
                            </Badge>
                            <Badge variant="secondary">
                              {ad.ad_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {ad.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Budget</p>
                              <p className="font-semibold">${ad.budget_amount}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Spent</p>
                              <p className="font-semibold">${ad.spent_amount || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Impressions</p>
                              <p className="font-semibold">{ad.impressions || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Clicks</p>
                              <p className="font-semibold">{ad.clicks || 0}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Started {formatDistanceToNow(new Date(ad.created_at), { addSuffix: true })}
                            </span>
                            <span>•</span>
                            <span>Ends {formatDistanceToNow(new Date(ad.ends_at), { addSuffix: true })}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAdStatus(ad.id, ad.status, 'ad')}
                          >
                            {ad.status === 'active' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAd(ad.id, 'ad')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default AdsManager;
