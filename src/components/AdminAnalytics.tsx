
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users, 
  MessageSquare, 
  Heart, 
  Share2,
  TrendingUp,
  Activity,
  DollarSign,
  Music
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalMessages: number;
  premiumUsers: number;
  businessPages: number;
  musicTracks: number;
  reels: number;
  dailyActiveUsers: Array<{ date: string; users: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  platformRevenue: Array<{ month: string; revenue: number }>;
  contentBreakdown: Array<{ type: string; count: number; color: string }>;
}

const AdminAnalytics = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalMessages: 0,
    premiumUsers: 0,
    businessPages: 0,
    musicTracks: 0,
    reels: 0,
    dailyActiveUsers: [],
    userGrowth: [],
    platformRevenue: [],
    contentBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch real data from Supabase
      const [
        usersResult,
        postsResult,
        likesResult,
        messagesResult,
        businessPagesResult,
        musicTracksResult,
        reelsResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('likes').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('business_pages').select('*', { count: 'exact', head: true }),
        supabase.from('music_tracks').select('*', { count: 'exact', head: true }),
        supabase.from('reels').select('*', { count: 'exact', head: true })
      ]);

      // Get premium users count
      const { count: premiumCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('premium_tier', 'free');

      // Get user growth data (last 12 months)
      const userGrowthData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
        
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);

        userGrowthData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          users: count || 0
        });
      }

      // Get daily active users (last 7 days)
      const dailyActiveData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        // This would ideally track login activity, for now we'll use post activity as a proxy
        const { count } = await supabase
          .from('posts')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', dayStart)
          .lte('created_at', dayEnd);

        dailyActiveData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          users: count || 0
        });
      }

      // Generate mock revenue data (since we don't have real payment integration yet)
      const revenueData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        revenueData.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: Math.floor(Math.random() * 5000) + 1000
        });
      }

      // Content breakdown
      const contentBreakdown = [
        { type: 'Posts', count: postsResult.count || 0, color: '#8884d8' },
        { type: 'Reels', count: reelsResult.count || 0, color: '#82ca9d' },
        { type: 'Music', count: musicTracksResult.count || 0, color: '#ffc658' },
        { type: 'Messages', count: messagesResult.count || 0, color: '#ff7300' }
      ];

      setAnalytics({
        totalUsers: usersResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalLikes: likesResult.count || 0,
        totalMessages: messagesResult.count || 0,
        premiumUsers: premiumCount || 0,
        businessPages: businessPagesResult.count || 0,
        musicTracks: musicTracksResult.count || 0,
        reels: reelsResult.count || 0,
        dailyActiveUsers: dailyActiveData,
        userGrowth: userGrowthData,
        platformRevenue: revenueData,
        contentBreakdown
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
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
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.premiumUsers} premium users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Content created by users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              User engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Platform conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Pages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.businessPages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active businesses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Music Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.musicTracks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Songs uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reels</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.reels.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Short-form videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analytics.premiumUsers * 15).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyActiveUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.contentBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.contentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.platformRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
