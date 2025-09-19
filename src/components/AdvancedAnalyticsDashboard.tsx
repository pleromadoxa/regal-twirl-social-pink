import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2,
  Clock,
  Globe,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const mockAnalyticsData = {
  overview: {
    totalFollowers: 15420,
    followerGrowth: 12.5,
    engagement: 8.7,
    reach: 245680,
    impressions: 567890
  },
  demographics: {
    ageGroups: [
      { name: '18-24', value: 35, color: '#8b5cf6' },
      { name: '25-34', value: 45, color: '#a855f7' },
      { name: '35-44', value: 15, color: '#c084fc' },
      { name: '45+', value: 5, color: '#ddd6fe' }
    ],
    topCountries: [
      { country: 'United States', percentage: 45 },
      { country: 'United Kingdom', percentage: 20 },
      { country: 'Canada', percentage: 15 },
      { country: 'Australia', percentage: 10 },
      { country: 'Germany', percentage: 10 }
    ]
  },
  performance: [
    { date: '2024-01', followers: 12000, engagement: 7.2, reach: 180000 },
    { date: '2024-02', followers: 12800, engagement: 7.8, reach: 200000 },
    { date: '2024-03', followers: 13500, engagement: 8.1, reach: 220000 },
    { date: '2024-04', followers: 14200, engagement: 8.3, reach: 235000 },
    { date: '2024-05', followers: 14800, engagement: 8.5, reach: 240000 },
    { date: '2024-06', followers: 15420, engagement: 8.7, reach: 245680 }
  ],
  topPosts: [
    { id: 1, content: 'Amazing sunset today! 🌅', likes: 1250, shares: 340, comments: 89, reach: 45600 },
    { id: 2, content: 'New project launch announcement', likes: 980, shares: 230, comments: 156, reach: 38200 },
    { id: 3, content: 'Behind the scenes content', likes: 750, shares: 180, comments: 67, reach: 32100 }
  ]
};

const AdvancedAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Deep insights into your social media performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <Zap className="w-4 h-4 mr-1" />
            Premium Feature
          </Badge>
          <Button 
            onClick={handleExportData} 
            disabled={isExporting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Followers</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {mockAnalyticsData.overview.totalFollowers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{mockAnalyticsData.overview.followerGrowth}%
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Engagement Rate</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {mockAnalyticsData.overview.engagement}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Above average</p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Reach</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {(mockAnalyticsData.overview.reach / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">This month</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Impressions</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {(mockAnalyticsData.overview.impressions / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Total views</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-200 dark:border-pink-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 dark:text-pink-400 text-sm font-medium">Best Time</p>
                <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">2-4 PM</p>
                <p className="text-xs text-pink-600 dark:text-pink-400">Peak engagement</p>
              </div>
              <Clock className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Growth Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockAnalyticsData.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="followers" 
                    stackId="1"
                    stroke="#8b5cf6" 
                    fill="url(#followersGradient)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reach" 
                    stackId="2"
                    stroke="#ec4899" 
                    fill="url(#reachGradient)" 
                  />
                  <defs>
                    <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockAnalyticsData.demographics.ageGroups}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockAnalyticsData.demographics.ageGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAnalyticsData.demographics.topCountries.map((country) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <span className="font-medium">{country.country}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={country.percentage} className="w-20" />
                      <span className="text-sm text-muted-foreground">{country.percentage}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalyticsData.topPosts.map((post, index) => (
                  <div key={post.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            {post.shares}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {post.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.reach.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Competitor Benchmarking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Compare your performance against industry leaders and competitors.
              </p>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Your Account</span>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">You</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Followers</p>
                      <p className="font-semibold">15.4K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engagement</p>
                      <p className="font-semibold">8.7%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Growth</p>
                      <p className="font-semibold text-green-600">+12.5%</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Industry Average</span>
                    <Badge variant="outline">Benchmark</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Followers</p>
                      <p className="font-semibold">12.1K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engagement</p>
                      <p className="font-semibold">6.2%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Growth</p>
                      <p className="font-semibold">+8.1%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;