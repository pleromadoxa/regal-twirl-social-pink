
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  Building,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  MousePointer
} from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalViews: number;
  followers: number;
  revenue: number;
  engagement: number;
  impressions: number;
  clicks: number;
  conversions: number;
  monthlyRevenue: number;
  weeklyGrowth: number;
}

const BusinessAnalytics = () => {
  const { user } = useAuth();
  const { myPages, loading } = useBusinessPages();
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    followers: 0,
    revenue: 0,
    engagement: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    monthlyRevenue: 0,
    weeklyGrowth: 0
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (myPages.length > 0 && !selectedPageId) {
      setSelectedPageId(myPages[0].id);
    }
  }, [myPages, selectedPageId]);

  useEffect(() => {
    if (selectedPageId) {
      const page = myPages.find(p => p.id === selectedPageId);
      setSelectedPage(page);
      if (page) {
        fetchAnalyticsData(page.id);
      }
    }
  }, [selectedPageId, myPages]);

  const fetchAnalyticsData = async (pageId: string) => {
    setAnalyticsLoading(true);
    try {
      // Fetch earnings data
      const { data: earningsData } = await supabase
        .from('business_earnings')
        .select('amount')
        .eq('business_page_id', pageId);

      const totalRevenue = earningsData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;

      // Fetch monthly earnings
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyData } = await supabase
        .from('business_earnings')
        .select('amount')
        .eq('business_page_id', pageId)
        .gte('date', `${currentMonth}-01`);

      const monthlyRevenue = monthlyData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;

      // Fetch ads data
      const { data: adsData } = await supabase
        .from('business_ads')
        .select('impressions, clicks, conversions')
        .eq('business_page_id', pageId);

      const totalImpressions = adsData?.reduce((sum, ad) => sum + (ad.impressions || 0), 0) || 0;
      const totalClicks = adsData?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0;
      const totalConversions = adsData?.reduce((sum, ad) => sum + (ad.conversions || 0), 0) || 0;

      // Get page followers
      const page = myPages.find(p => p.id === pageId);
      const followers = page?.followers_count || 0;

      // Calculate engagement rate (clicks/impressions * 100)
      const engagement = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      setAnalyticsData({
        totalViews: totalImpressions,
        followers,
        revenue: totalRevenue,
        engagement,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        monthlyRevenue,
        weeklyGrowth: Math.random() * 20 - 10 // Mock data for now
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getCurrencySymbol = (currency?: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹'
    };
    return symbols[currency || 'USD'] || '$';
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol(selectedPage?.default_currency);
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Business Analytics
            </h1>
            
            {/* Business Page Selector */}
            {myPages.length > 0 && (
              <div className="w-80">
                <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-purple-200 focus:border-purple-500 shadow-lg z-50">
                    <SelectValue placeholder="Select a business page" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 shadow-lg z-[60]">
                    {myPages.map((page) => (
                      <SelectItem key={page.id} value={page.id} className="focus:bg-purple-50 dark:focus:bg-purple-900/20">
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={page.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                              {page.page_name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="truncate">{page.page_name}</span>
                            {page.is_verified && (
                              <Crown className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {page.page_type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {selectedPage ? (
            <>
              {/* Selected Page Info */}
              <Card className="border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedPage.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {selectedPage.page_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{selectedPage.page_name}</h2>
                        {selectedPage.is_verified && (
                          <Crown className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-muted-foreground">{selectedPage.business_type}</p>
                      <p className="text-sm text-muted-foreground">{selectedPage.followers_count} followers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      Total Impressions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.impressions.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                      +20.1% from last month
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      Followers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.followers.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                      +{Math.floor(analyticsData.weeklyGrowth)}% this week
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(analyticsData.revenue)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      Monthly: {formatCurrency(analyticsData.monthlyRevenue)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      Engagement Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.engagement.toFixed(2)}%</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MousePointer className="w-3 h-3" />
                      {analyticsData.clicks} clicks from {analyticsData.impressions} impressions
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="advertising">Advertising</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Performance Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pl-2">
                        <div className="h-80 flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Analytics chart will be displayed here</p>
                            <p className="text-sm">Performance data over time</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="col-span-3">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-5 h-5" />
                          Traffic Sources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Traffic breakdown chart</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="audience" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Follower Growth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Follower growth chart will be displayed here</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Audience Demographics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Demographic breakdown will be displayed here</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Content performance metrics will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Revenue trends chart will be displayed here</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>Revenue source breakdown will be displayed here</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="advertising" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Ad Impressions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.impressions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total ad impressions</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Ad Clicks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.clicks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total ad clicks</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Conversions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.conversions}</div>
                        <p className="text-xs text-muted-foreground">Total conversions</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Business Pages Found</h3>
                <p className="text-muted-foreground">
                  Create a business page to start viewing analytics data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalytics;
