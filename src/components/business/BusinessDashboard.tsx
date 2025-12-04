import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BusinessDashboardTabs from './BusinessDashboardTabs';
import BusinessDashboardHeader from './BusinessDashboardHeader';
import BusinessDashboardLoading from './BusinessDashboardLoading';
import BusinessDashboardError from './BusinessDashboardError';
import { BarChart3, DollarSign, Megaphone, Package, Users, ShoppingCart } from 'lucide-react';

interface BusinessDashboardProps {
  businessPageId: string;
}

const BusinessDashboard = ({ businessPageId }: BusinessDashboardProps) => {
  const [businessPage, setBusinessPage] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinessData();
  }, [businessPageId]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch business page details with maybeSingle to handle not found
      const { data: pageData, error: pageError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('id', businessPageId)
        .maybeSingle();

      if (pageError) throw pageError;

      if (!pageData) {
        setError('Business page not found');
        return;
      }

      setBusinessPage(pageData);

      // Fetch analytics data
      await fetchAnalytics(businessPageId);

    } catch (error: any) {
      console.error('Error fetching business data:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load business dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (pageId: string) => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('business_products')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', pageId);

      // Fetch active ads count
      const { count: adsCount } = await supabase
        .from('business_ads')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', pageId)
        .eq('status', 'active');

      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('business_orders')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', pageId);

      // Fetch followers count
      const { count: followersCount } = await supabase
        .from('business_page_follows')
        .select('*', { count: 'exact', head: true })
        .eq('page_id', pageId);

      // Fetch total revenue
      const { data: revenueData } = await supabase
        .from('business_earnings')
        .select('amount')
        .eq('business_page_id', pageId);

      const totalRevenue = revenueData?.reduce((sum, earning) => sum + (earning.amount || 0), 0) || 0;

      setAnalytics({
        productsCount: productsCount || 0,
        adsCount: adsCount || 0,
        ordersCount: ordersCount || 0,
        followersCount: followersCount || 0,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handlePageUpdate = () => {
    fetchBusinessData();
  };

  if (loading) {
    return <BusinessDashboardLoading />;
  }

  if (error || !businessPage) {
    return <BusinessDashboardError pageId={businessPageId} availablePages={0} onRetry={fetchBusinessData} />;
  }

  return (
    <div className="space-y-6">
      <BusinessDashboardHeader businessPage={businessPage} />
      
      {/* Analytics Overview - Enhanced Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Products</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.productsCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Ads</CardTitle>
            <Megaphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.adsCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.ordersCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-200/50 dark:border-pink-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Followers</CardTitle>
            <Users className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.followersCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/50 dark:border-amber-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalRevenue.toFixed(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <BusinessDashboardTabs businessPage={businessPage} onPageUpdate={handlePageUpdate} />
    </div>
  );
};

export default BusinessDashboard;
