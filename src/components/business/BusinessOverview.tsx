
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, FileText, ShoppingCart, MessageSquare, Package, TrendingUp } from 'lucide-react';

interface BusinessOverviewProps {
  businessPage: any;
}

const BusinessOverview = ({ businessPage }: BusinessOverviewProps) => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    invoiceCount: 0,
    orderCount: 0,
    messageCount: 0,
    productCount: 0,
    recentEarnings: 0
  });

  useEffect(() => {
    fetchStats();
  }, [businessPage.id]);

  const fetchStats = async () => {
    try {
      // Fetch earnings
      const { data: earningsData } = await supabase
        .from('business_earnings')
        .select('amount')
        .eq('business_page_id', businessPage.id);

      // Fetch recent earnings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentEarningsData } = await supabase
        .from('business_earnings')
        .select('amount')
        .eq('business_page_id', businessPage.id)
        .gte('date', thirtyDaysAgo.toISOString());

      // Fetch invoices count
      const { count: invoiceCount } = await supabase
        .from('business_invoices')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', businessPage.id);

      // Fetch orders count (if e-commerce)
      let orderCount = 0;
      if (businessPage.business_type === 'e-commerce') {
        const { count } = await supabase
          .from('business_orders')
          .select('*', { count: 'exact', head: true })
          .eq('business_page_id', businessPage.id);
        orderCount = count || 0;
      }

      // Fetch products count (if e-commerce)
      let productCount = 0;
      if (businessPage.business_type === 'e-commerce') {
        const { count } = await supabase
          .from('business_products')
          .select('*', { count: 'exact', head: true })
          .eq('business_page_id', businessPage.id);
        productCount = count || 0;
      }

      // Fetch messages count
      const { count: messageCount } = await supabase
        .from('business_messages')
        .select('*', { count: 'exact', head: true })
        .eq('business_page_id', businessPage.id);

      const totalEarnings = earningsData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;
      const recentEarnings = recentEarningsData?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;

      setStats({
        totalEarnings,
        recentEarnings,
        invoiceCount: invoiceCount || 0,
        orderCount,
        messageCount: messageCount || 0,
        productCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Earnings */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time earnings in {businessPage.default_currency}
            </p>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.recentEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invoiceCount}</div>
            <p className="text-xs text-muted-foreground">
              Total invoices created
            </p>
          </CardContent>
        </Card>

        {/* Products (E-commerce only) */}
        {businessPage.business_type === 'e-commerce' && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productCount}</div>
              <p className="text-xs text-muted-foreground">
                Products in store
              </p>
            </CardContent>
          </Card>
        )}

        {/* Orders (E-commerce only) */}
        {businessPage.business_type === 'e-commerce' && (
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orderCount}</div>
              <p className="text-xs text-muted-foreground">
                Total orders received
              </p>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messageCount}</div>
            <p className="text-xs text-muted-foreground">
              Customer messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Type Specific Tools */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>Business Type: {businessPage.business_type}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Your business is configured as <strong>{businessPage.business_type}</strong>. 
            This gives you access to specific tools tailored for your business type.
          </div>
          
          {businessPage.business_type === 'e-commerce' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">E-Commerce Tools Available:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Product Management & Inventory</li>
                <li>• Order Processing & Tracking</li>
                <li>• Customer Communication</li>
                <li>• Sales Analytics & Reporting</li>
              </ul>
            </div>
          )}

          {businessPage.business_type === 'it-services' && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">IT Services Tools Available:</h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Project-based Invoicing</li>
                <li>• Service Hours Tracking</li>
                <li>• Client Communication</li>
                <li>• Technical Documentation</li>
              </ul>
            </div>
          )}

          {businessPage.business_type === 'consulting' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Consulting Tools Available:</h4>
              <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>• Consultation Scheduling</li>
                <li>• Client Relationship Management</li>
                <li>• Invoice & Contract Management</li>
                <li>• Performance Analytics</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessOverview;
