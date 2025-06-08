
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  TrendingUp, 
  Users 
} from 'lucide-react';

interface BusinessOverviewProps {
  businessPage: any;
}

interface OverviewStats {
  totalEarnings: number;
  totalProducts: number;
  totalOrders: number;
  unreadMessages: number;
  followers: number;
  monthlyEarnings: number;
}

const BusinessOverview = ({ businessPage }: BusinessOverviewProps) => {
  const [stats, setStats] = useState<OverviewStats>({
    totalEarnings: 0,
    totalProducts: 0,
    totalOrders: 0,
    unreadMessages: 0,
    followers: 0,
    monthlyEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, [businessPage.id]);

  const fetchOverviewStats = async () => {
    setLoading(true);
    try {
      // Fetch earnings
      const { data: earningsData } = await supabase
        .from('business_earnings')
        .select('amount')
        .eq('business_page_id', businessPage.id);

      const totalEarnings = earningsData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;

      // Fetch monthly earnings
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyData } = await supabase
        .from('business_earnings')
        .select('amount')
        .eq('business_page_id', businessPage.id)
        .gte('date', `${currentMonth}-01`);

      const monthlyEarnings = monthlyData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('business_products')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', businessPage.id);

      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('business_orders')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', businessPage.id);

      // Fetch unread messages count
      const { count: unreadCount } = await supabase
        .from('business_messages')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', businessPage.id)
        .eq('sender_type', 'customer')
        .eq('is_read', false);

      setStats({
        totalEarnings,
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        unreadMessages: unreadCount || 0,
        followers: businessPage.followers_count || 0,
        monthlyEarnings
      });
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = () => {
    const symbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BTC': '₿', 'ETH': 'Ξ'
    };
    return symbols[businessPage.default_currency] || businessPage.default_currency;
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Business Overview</h2>
        <p className="text-muted-foreground">Monitor your business performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.monthlyEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Total products listed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total orders received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Unread customer messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.followers}</div>
            <p className="text-xs text-muted-foreground">
              Page followers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessOverview;
