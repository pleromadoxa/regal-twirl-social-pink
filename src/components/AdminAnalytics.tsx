
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Globe, 
  Monitor, 
  Smartphone, 
  Users, 
  TrendingUp,
  MapPin,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  userGrowth: any[];
  deviceStats: any[];
  browserStats: any[];
  countryStats: any[];
  cityStats: any[];
  userActivity: any[];
  contentMetrics: any[];
  engagementMetrics: any[];
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    deviceStats: [],
    browserStats: [],
    countryStats: [],
    cityStats: [],
    userActivity: [],
    contentMetrics: [],
    engagementMetrics: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Generate mock analytics data with realistic social media metrics
      const mockData: AnalyticsData = {
        userGrowth: [
          { month: 'Jan 2024', users: 1200, active: 850 },
          { month: 'Feb 2024', users: 1450, active: 1020 },
          { month: 'Mar 2024', users: 1800, active: 1350 },
          { month: 'Apr 2024', users: 2200, active: 1680 },
          { month: 'May 2024', users: 2650, active: 2100 },
          { month: 'Jun 2024', users: 3200, active: 2580 }
        ],
        deviceStats: [
          { device: 'Mobile', users: 2100, percentage: 65.6 },
          { device: 'Desktop', users: 890, percentage: 27.8 },
          { device: 'Tablet', users: 210, percentage: 6.6 }
        ],
        browserStats: [
          { browser: 'Chrome', users: 1680, percentage: 52.5 },
          { browser: 'Safari', users: 960, percentage: 30.0 },
          { browser: 'Firefox', users: 320, percentage: 10.0 },
          { browser: 'Edge', users: 192, percentage: 6.0 },
          { browser: 'Others', users: 48, percentage: 1.5 }
        ],
        countryStats: [
          { country: 'United States', users: 980, cities: 85, flag: '🇺🇸' },
          { country: 'United Kingdom', users: 650, cities: 42, flag: '🇬🇧' },
          { country: 'Canada', users: 420, cities: 28, flag: '🇨🇦' },
          { country: 'Australia', users: 380, cities: 18, flag: '🇦🇺' },
          { country: 'Germany', users: 340, cities: 31, flag: '🇩🇪' },
          { country: 'France', users: 290, cities: 24, flag: '🇫🇷' },
          { country: 'Japan', users: 142, cities: 19, flag: '🇯🇵' }
        ],
        cityStats: [
          { city: 'New York', country: 'US', users: 185 },
          { city: 'London', country: 'UK', users: 156 },
          { city: 'Los Angeles', country: 'US', users: 142 },
          { city: 'Toronto', country: 'CA', users: 98 },
          { city: 'Sydney', country: 'AU', users: 87 },
          { city: 'Chicago', country: 'US', users: 78 },
          { city: 'Berlin', country: 'DE', users: 65 },
          { city: 'Paris', country: 'FR', users: 58 }
        ],
        userActivity: [
          { hour: '00:00', active: 120 },
          { hour: '03:00', active: 85 },
          { hour: '06:00', active: 210 },
          { hour: '09:00', active: 450 },
          { hour: '12:00', active: 680 },
          { hour: '15:00', active: 590 },
          { hour: '18:00', active: 820 },
          { hour: '21:00', active: 750 }
        ],
        contentMetrics: [
          { type: 'Posts', count: 15600, growth: 12.5 },
          { type: 'Comments', count: 45200, growth: 18.2 },
          { type: 'Likes', count: 128400, growth: 25.8 },
          { type: 'Shares', count: 8900, growth: 15.3 },
          { type: 'Music Tracks', count: 2340, growth: 35.2 },
          { type: 'Stories', count: 5670, growth: 22.1 }
        ],
        engagementMetrics: [
          { day: 'Mon', posts: 450, likes: 2800, comments: 890, shares: 320 },
          { day: 'Tue', posts: 520, likes: 3200, comments: 1020, shares: 380 },
          { day: 'Wed', posts: 480, likes: 2950, comments: 950, shares: 340 },
          { day: 'Thu', posts: 610, likes: 3800, comments: 1200, shares: 450 },
          { day: 'Fri', posts: 720, likes: 4500, comments: 1450, shares: 520 },
          { day: 'Sat', posts: 850, likes: 5200, comments: 1680, shares: 600 },
          { day: 'Sun', posts: 780, likes: 4800, comments: 1520, shares: 580 }
        ]
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const totalCountries = analytics.countryStats.length;
  const totalCities = analytics.countryStats.reduce((sum, country) => sum + country.cities, 0);
  const totalUsers = analytics.countryStats.reduce((sum, country) => sum + country.users, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCountries}</p>
                <p className="text-sm text-muted-foreground">Countries Reached</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCities}</p>
                <p className="text-sm text-muted-foreground">Cities Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Global Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">18.2%</p>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="active" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.engagementMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="posts" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="likes" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="comments" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Countries Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {analytics.countryStats.map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{country.flag}</span>
                          <div>
                            <p className="font-medium">{country.country}</p>
                            <p className="text-sm text-muted-foreground">{country.cities} cities</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{country.users.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">users</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.cityStats} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="city" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.deviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) => `${device} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {analytics.deviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.browserStats.map((browser, index) => (
                    <div key={browser.browser} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{browser.browser}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{browser.users.toLocaleString()}</span>
                          <Badge variant="outline">{browser.percentage}%</Badge>
                        </div>
                      </div>
                      <Progress value={browser.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.engagementMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" fill="#8884d8" name="Posts" />
                  <Bar dataKey="likes" fill="#82ca9d" name="Likes" />
                  <Bar dataKey="comments" fill="#ffc658" name="Comments" />
                  <Bar dataKey="shares" fill="#ff7300" name="Shares" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.contentMetrics.map((metric, index) => (
              <Card key={metric.type}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{metric.type}</h3>
                    <Badge variant={metric.growth > 20 ? "default" : "secondary"}>
                      +{metric.growth}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">{metric.count.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total {metric.type.toLowerCase()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Hourly User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="active" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
