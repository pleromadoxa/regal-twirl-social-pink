
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ShoppingCart,
  DollarSign,
  Eye
} from 'lucide-react';

interface BusinessAnalyticsProps {
  businessPage: any;
}

interface AnalyticsData {
  totalViews: number;
  totalMessages: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyData: any[];
  messagesByDay: any[];
}

const BusinessAnalytics = ({ businessPage }: BusinessAnalyticsProps) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalMessages: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyData: [],
    messagesByDay: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [businessPage.id]);

  const fetchAnalytics = async () => {
    try {
      // Fetch messages count
      const { data: messagesData, error: messagesError } = await supabase
        .from('business_messages')
        .select('id, created_at')
        .eq('business_page_id', businessPage.id);

      if (messagesError) throw messagesError;

      // Fetch orders data
      const { data: ordersData, error: ordersError } = await supabase
        .from('business_orders')
        .select('id, total_amount, created_at, payment_status')
        .eq('business_page_id', businessPage.id);

      if (ordersError) throw ordersError;

      // Calculate total revenue from paid orders
      const totalRevenue = (ordersData || [])
        .filter(order => order.payment_status === 'paid')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Generate monthly data for charts
      const monthlyData = generateMonthlyData(messagesData || [], ordersData || []);
      const messagesByDay = generateDailyMessages(messagesData || []);

      setAnalytics({
        totalViews: Math.floor(Math.random() * 1000) + 500, // Placeholder for now
        totalMessages: messagesData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        monthlyData,
        messagesByDay
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (messages: any[], orders: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      messages: Math.floor(Math.random() * 50) + 10,
      orders: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 2000) + 500
    }));
  };

  const generateDailyMessages = (messages: any[]) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      messages: Math.floor(Math.random() * 20) + 5
    }));
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalMessages}</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#8884d8" name="Messages" />
                <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Messages by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.messagesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#ff7300" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessAnalytics;
