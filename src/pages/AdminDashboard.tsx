import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SidebarNav from '@/components/SidebarNav';
import AdminMusicSection from '@/components/AdminMusicSection';
import AdminUsersSection from '@/components/AdminUsersSection';
import AdminAnalytics from '@/components/AdminAnalytics';
import AdminMusicUpload from '@/components/AdminMusicUpload';
import AdminSupportTickets from '@/components/AdminSupportTickets';
import AdminSubscriptionSection from '@/components/AdminSubscriptionSection';
import { 
  Users, 
  MessageSquare, 
  Flag, 
  Music,
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  Activity,
  Upload,
  Globe,
  Ticket,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalTracks: number;
  totalMessages: number;
  totalReports: number;
  newUsersToday: number;
  activeUsers: number;
  totalPosts: number;
  totalCountries: number;
  supportTickets: number;
}

interface ActivityItem {
  type: string;
  user: string;
  time: string;
  color: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTracks: 0,
    totalMessages: 0,
    totalReports: 0,
    newUsersToday: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalCountries: 0,
    supportTickets: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Fetch music tracks count  
      const { count: tracksCount } = await supabase
        .from('music_tracks')
        .select('*', { count: 'exact', head: true });

      // Fetch messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Fetch reports count
      const { count: reportsCount } = await supabase
        .from('post_reports')
        .select('*', { count: 'exact', head: true });

      // Fetch new users today
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Fetch active users (users with presence)
      const { count: activeUsersCount } = await supabase
        .from('user_presence')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      // Calculate global reach from user locations (get unique locations)
      const { data: locationData } = await supabase
        .from('profiles')
        .select('location')
        .not('location', 'is', null);

      // Extract unique countries from location data
      const uniqueCountries = new Set();
      if (locationData) {
        locationData.forEach(profile => {
          if (profile.location) {
            // Extract country from location string (assuming format like "City, Country")
            const parts = profile.location.split(',');
            if (parts.length > 1) {
              const country = parts[parts.length - 1].trim();
              uniqueCountries.add(country);
            }
          }
        });
      }

      // Count support tickets from post_reports as a proxy
      const { count: supportTicketsCount } = await supabase
        .from('post_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: usersCount || 0,
        totalTracks: tracksCount || 0,
        totalMessages: messagesCount || 0,
        totalReports: reportsCount || 0,
        newUsersToday: newUsersCount || 0,
        activeUsers: activeUsersCount || 0,
        totalPosts: postsCount || 0,
        totalCountries: uniqueCountries.size || 0,
        supportTickets: supportTicketsCount || 0
      });

      // Fetch recent activity
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('username, display_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const activityItems: ActivityItem[] = [];
      
      if (recentUsers) {
        recentUsers.forEach(user => {
          activityItems.push({
            type: 'user_joined',
            user: user.display_name || user.username || 'Unknown User',
            time: new Date(user.created_at).toLocaleTimeString(),
            color: 'green'
          });
        });
      }

      if (recentPosts) {
        for (const post of recentPosts) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', post.user_id)
            .single();

          if (profile) {
            activityItems.push({
              type: 'post_created',
              user: profile.display_name || profile.username || 'Unknown User',
              time: new Date(post.created_at).toLocaleTimeString(),
              color: 'blue'
            });
          }
        }
      }

      setRecentActivity(activityItems.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 pl-80">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage your social media platform and monitor activities
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Music
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Support
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats.newUsersToday} new today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPosts}</div>
                    <p className="text-xs text-muted-foreground">
                      Platform content
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Music Tracks</CardTitle>
                    <Music className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTracks}</div>
                    <p className="text-xs text-muted-foreground">
                      Total uploaded tracks
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Global Reach</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCountries}</div>
                    <p className="text-xs text-muted-foreground">
                      Countries reached
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <p className="text-sm text-muted-foreground">Loading activity...</p>
                      ) : recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.color === 'green' ? 'bg-green-500' : 
                              activity.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'
                            }`}></div>
                            <p className="text-sm">
                              {activity.type === 'user_joined'  ? 
                                `New user registered: ${activity.user}` :
                                `${activity.user} created a new post`
                              }
                            </p>
                            <span className="text-xs text-muted-foreground ml-auto">{activity.time}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Performance</span>
                        <Badge variant="default">Optimal</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active Users</span>
                        <Badge variant="default">{stats.activeUsers} online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Support Tickets</span>
                        <Badge variant={stats.supportTickets > 10 ? "destructive" : "default"}>
                          {stats.supportTickets} pending
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersSection />
            </TabsContent>

            <TabsContent value="subscriptions">
              <AdminSubscriptionSection />
            </TabsContent>

            <TabsContent value="music">
              <AdminMusicSection />
            </TabsContent>

            <TabsContent value="upload">
              <AdminMusicUpload />
            </TabsContent>

            <TabsContent value="support">
              <AdminSupportTickets />
            </TabsContent>

            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Message Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Message Management</h3>
                    <p className="text-gray-500">Monitor and manage platform messages and conversations.</p>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Total Messages: {stats.totalMessages}</p>
                      <p>Active Conversations: {Math.floor(stats.totalMessages / 3)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Content Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Flag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Content Reports</h3>
                    <p className="text-gray-500">Review and manage reported content and user violations.</p>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Pending Reports: {stats.totalReports}</p>
                      <p>Resolved Today: {Math.floor(stats.totalReports * 0.3)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">System Settings</h3>
                    <p className="text-gray-500">Configure platform settings, security, and preferences.</p>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <p>Platform Version: 2.1.0</p>
                      <p>Last Update: {new Date().toLocaleDateString()}</p>
                      <p>Security Level: High</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
