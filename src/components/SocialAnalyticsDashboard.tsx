import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Clock,
  Calendar,
  Target,
  Zap,
  Globe,
  Smartphone
} from 'lucide-react';

interface AnalyticsData {
  followers: { current: number; change: number; };
  engagement: { rate: number; change: number; };
  reach: { current: number; change: number; };
  impressions: { current: number; change: number; };
  weeklyData: Array<{ day: string; followers: number; engagement: number; reach: number; }>;
  postPerformance: Array<{ 
    id: string; 
    content: string; 
    likes: number; 
    comments: number; 
    shares: number; 
    reach: number;
    date: string;
  }>;
  demographics: {
    age: Array<{ range: string; percentage: number; }>;
    gender: Array<{ type: string; percentage: number; color: string; }>;
    location: Array<{ country: string; percentage: number; }>;
    devices: Array<{ type: string; percentage: number; color: string; }>;
  };
  bestTimes: Array<{ day: string; hour: number; engagement: number; }>;
}

const SocialAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockData: AnalyticsData = {
      followers: { current: 12547, change: 5.2 },
      engagement: { rate: 4.8, change: 0.3 },
      reach: { current: 45623, change: 12.7 },
      impressions: { current: 98234, change: 8.9 },
      weeklyData: [
        { day: 'Mon', followers: 100, engagement: 4.2, reach: 1200 },
        { day: 'Tue', followers: 85, engagement: 5.1, reach: 1400 },
        { day: 'Wed', followers: 120, engagement: 3.8, reach: 1100 },
        { day: 'Thu', followers: 95, engagement: 6.2, reach: 1600 },
        { day: 'Fri', followers: 140, engagement: 5.7, reach: 1800 },
        { day: 'Sat', followers: 160, engagement: 7.1, reach: 2100 },
        { day: 'Sun', followers: 110, engagement: 4.9, reach: 1300 },
      ],
      postPerformance: [
        {
          id: '1',
          content: 'Amazing sunset from my balcony 🌅',
          likes: 1247,
          comments: 89,
          shares: 34,
          reach: 5678,
          date: '2024-01-15'
        },
        {
          id: '2',
          content: 'New project announcement! 🚀',
          likes: 892,
          comments: 156,
          shares: 78,
          reach: 4321,
          date: '2024-01-14'
        },
        {
          id: '3',
          content: 'Behind the scenes content',
          likes: 654,
          comments: 42,
          shares: 12,
          reach: 2345,
          date: '2024-01-13'
        },
      ],
      demographics: {
        age: [
          { range: '18-24', percentage: 25 },
          { range: '25-34', percentage: 35 },
          { range: '35-44', percentage: 22 },
          { range: '45-54', percentage: 12 },
          { range: '55+', percentage: 6 },
        ],
        gender: [
          { type: 'Female', percentage: 54, color: '#8B5CF6' },
          { type: 'Male', percentage: 42, color: '#06B6D4' },
          { type: 'Other', percentage: 4, color: '#10B981' },
        ],
        location: [
          { country: 'United States', percentage: 35 },
          { country: 'United Kingdom', percentage: 18 },
          { country: 'Canada', percentage: 12 },
          { country: 'Australia', percentage: 8 },
          { country: 'Germany', percentage: 7 },
        ],
        devices: [
          { type: 'Mobile', percentage: 68, color: '#F59E0B' },
          { type: 'Desktop', percentage: 24, color: '#EF4444' },
          { type: 'Tablet', percentage: 8, color: '#8B5CF6' },
        ],
      },
      bestTimes: [
        { day: 'Monday', hour: 9, engagement: 5.2 },
        { day: 'Tuesday', hour: 14, engagement: 6.1 },
        { day: 'Wednesday', hour: 11, engagement: 4.8 },
        { day: 'Thursday', hour: 16, engagement: 7.3 },
        { day: 'Friday', hour: 18, engagement: 8.7 },
        { day: 'Saturday', hour: 10, engagement: 6.9 },
        { day: 'Sunday', hour: 15, engagement: 5.4 },
      ],
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  if (isLoading || !analyticsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Social Analytics
          </h1>
          <p className="text-muted-foreground">Track your social media performance</p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold">{analyticsData.followers.current.toLocaleString()}</p>
                <Badge variant={analyticsData.followers.change > 0 ? 'default' : 'secondary'} className="mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analyticsData.followers.change}%
                </Badge>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">{analyticsData.engagement.rate}%</p>
                <Badge variant={analyticsData.engagement.change > 0 ? 'default' : 'secondary'} className="mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analyticsData.engagement.change}%
                </Badge>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reach</p>
                <p className="text-2xl font-bold">{analyticsData.reach.current.toLocaleString()}</p>
                <Badge variant={analyticsData.reach.change > 0 ? 'default' : 'secondary'} className="mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analyticsData.reach.change}%
                </Badge>
              </div>
              <Globe className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Impressions</p>
                <p className="text-2xl font-bold">{analyticsData.impressions.current.toLocaleString()}</p>
                <Badge variant={analyticsData.impressions.change > 0 ? 'default' : 'secondary'} className="mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analyticsData.impressions.change}%
                </Badge>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Growth</CardTitle>
                <CardDescription>Followers and engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="followers" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="engagement" stackId="2" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reach Trends</CardTitle>
                <CardDescription>Weekly reach performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="reach" stroke="#10B981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Your best content from the last {timeRange}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.postPerformance.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 space-y-3">
                    <p className="font-medium">{post.content}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share className="w-4 h-4" />
                          {post.shares}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.reach}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.demographics.age}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender Split</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.demographics.gender}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                    >
                      {analyticsData.demographics.gender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.demographics.location.map((location) => (
                    <div key={location.country} className="flex items-center justify-between">
                      <span>{location.country}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{location.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.demographics.devices}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                    >
                      {analyticsData.demographics.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
                <CardDescription>When your audience is most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.bestTimes.map((time) => (
                    <div key={`${time.day}-${time.hour}`} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{time.day}</span>
                        <span className="text-muted-foreground ml-2">{time.hour}:00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(time.engagement / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{time.engagement}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Recommendations</CardTitle>
                <CardDescription>AI-powered insights for better engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Post more videos</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Video content gets 3x more engagement than images
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Clock className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Optimal posting time</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Friday at 6 PM shows highest engagement
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Target className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">Use trending hashtags</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        #TechTuesday and #MotivationMonday are trending
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">Engage with comments</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Reply rate affects algorithm visibility
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialAnalyticsDashboard;