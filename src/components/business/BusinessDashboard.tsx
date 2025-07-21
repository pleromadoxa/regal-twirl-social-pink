import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BusinessDashboardTabs from './BusinessDashboardTabs';
import BusinessDashboardHeader from './BusinessDashboardHeader';
import BusinessDashboardLoading from './BusinessDashboardLoading';
import BusinessDashboardError from './BusinessDashboardError';
import { BarChart3, Users, DollarSign, TrendingUp, Megaphone, Package } from 'lucide-react';

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

      // Fetch business page details
      const { data: pageData, error: pageError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('id', businessPageId)
        .single();

      if (pageError) throw pageError;

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

      // Fetch orders count (if orders table exists)
      const { count: ordersCount } = await supabase
        .from('business_orders')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', pageId);

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
      
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.productsCount}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.adsCount}</div>
            <p className="text-xs text-muted-foreground">
              Running campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.ordersCount}</div>
            <p className="text-xs text-muted-foreground">
              Customer orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <BusinessDashboardTabs businessPage={businessPage} onPageUpdate={handlePageUpdate} />
    </div>
  );
};

export default BusinessDashboard;