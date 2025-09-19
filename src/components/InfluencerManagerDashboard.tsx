import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Eye,
  Heart,
  Share2,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Youtube,
  Search,
  Filter,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  BarChart3,
  Shield
} from 'lucide-react';

const mockInfluencers = [
  {
    id: 1,
    name: "Sarah Johnson",
    handle: "@sarahtechie",
    avatar: "/api/placeholder/64/64",
    followers: 245000,
    engagement: 4.8,
    niche: "Technology",
    location: "San Francisco, CA",
    rate: 2500,
    platforms: ["instagram", "twitter", "youtube"],
    status: "active",
    campaigns: 12,
    rating: 4.9,
    email: "sarah@example.com",
    phone: "+1-555-0123",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    handle: "@mikefitness",
    avatar: "/api/placeholder/64/64",
    followers: 180000,
    engagement: 5.2,
    niche: "Fitness",
    location: "Miami, FL",
    rate: 1800,
    platforms: ["instagram", "youtube"],
    status: "pending",
    campaigns: 8,
    rating: 4.7,
    email: "mike@example.com",
    phone: "+1-555-0124",
    lastActive: "1 day ago"
  },
  {
    id: 3,
    name: "Emma Chen",
    handle: "@emmastyle",
    avatar: "/api/placeholder/64/64",
    followers: 320000,
    engagement: 6.1,
    niche: "Fashion",
    location: "New York, NY",
    rate: 3200,
    platforms: ["instagram", "twitter"],
    status: "active",
    campaigns: 15,
    rating: 4.8,
    email: "emma@example.com",
    phone: "+1-555-0125",
    lastActive: "30 min ago"
  }
];

const mockCampaigns = [
  {
    id: 1,
    name: "Summer Product Launch",
    influencer: "Sarah Johnson",
    status: "active",
    budget: 5000,
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    deliverables: ["3 Instagram posts", "5 Stories", "1 Reel"],
    performance: {
      reach: 450000,
      engagement: 28500,
      clicks: 1250,
      conversions: 89
    }
  },
  {
    id: 2,
    name: "Fitness Challenge Campaign",
    influencer: "Mike Rodriguez",
    status: "completed",
    budget: 3000,
    startDate: "2024-05-15",
    endDate: "2024-05-31",
    deliverables: ["2 YouTube videos", "10 Instagram stories"],
    performance: {
      reach: 280000,
      engagement: 18200,
      clicks: 890,
      conversions: 67
    }
  }
];

const InfluencerManagerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Influencer Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover, connect, and manage influencer partnerships
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <Zap className="w-4 h-4 mr-1" />
            Premium Feature
          </Badge>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Users className="w-4 h-4 mr-2" />
            Find Influencers
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Influencers</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {mockInfluencers.length}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Active partnerships</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {mockCampaigns.filter(c => c.status === 'active').length}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Running now</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Reach</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {(mockInfluencers.reduce((acc, inf) => acc + inf.followers, 0) / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Combined followers</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Campaign ROI</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  325%
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Average return</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="influencers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="influencers">Influencer Directory</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Management</TabsTrigger>
          <TabsTrigger value="discovery">Discover New Talent</TabsTrigger>
        </TabsList>

        <TabsContent value="influencers" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search influencers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Influencers List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockInfluencers.map((influencer) => (
              <Card key={influencer.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={influencer.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {influencer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{influencer.name}</h3>
                        <p className="text-muted-foreground">{influencer.handle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {influencer.niche}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(influencer.status)}`}>
                            {getStatusIcon(influencer.status)}
                            <span className="ml-1 capitalize">{influencer.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{influencer.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Followers</p>
                      <p className="font-bold">{(influencer.followers / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                      <p className="font-bold">{influencer.engagement}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <p className="font-bold">${influencer.rate.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Campaigns</p>
                      <p className="font-bold">{influencer.campaigns}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Platforms:</span>
                      <div className="flex items-center gap-1">
                        {influencer.platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="p-1">
                            {getPlatformIcon(platform)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{influencer.lastActive}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Campaign Overview</h3>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Calendar className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="space-y-6">
            {mockCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {campaign.name}
                      <Badge className={`${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1 capitalize">{campaign.status}</span>
                      </Badge>
                    </CardTitle>
                    <div className="text-right">
                      <p className="font-bold text-lg">${campaign.budget.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Budget</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Influencer</p>
                          <p className="font-semibold">{campaign.influencer}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Duration</p>
                          <p>{campaign.startDate} - {campaign.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Deliverables</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.deliverables.map((deliverable, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {deliverable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-3">Performance Metrics</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Reach</span>
                          <span className="font-semibold">{campaign.performance.reach.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Engagement</span>
                          <span className="font-semibold">{campaign.performance.engagement.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Clicks</span>
                          <span className="font-semibold">{campaign.performance.clicks.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Conversions</span>
                          <span className="font-semibold">{campaign.performance.conversions}</span>
                        </div>
                        <Progress 
                          value={(campaign.performance.conversions / campaign.performance.clicks) * 100} 
                          className="mt-2" 
                        />
                        <p className="text-xs text-muted-foreground">
                          {((campaign.performance.conversions / campaign.performance.clicks) * 100).toFixed(1)}% conversion rate
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discovery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Influencer Discovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Discover Perfect Matches</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Use AI to find influencers that perfectly match your brand values, audience, and campaign goals.
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Search className="w-4 h-4 mr-2" />
                  Start Discovery
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center p-6">
                  <Target className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Smart Matching</h4>
                  <p className="text-sm text-muted-foreground">
                    AI analyzes audience overlap, engagement quality, and brand alignment
                  </p>
                </Card>
                
                <Card className="text-center p-6">
                  <BarChart3 className="w-12 h-12 text-pink-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Performance Prediction</h4>
                  <p className="text-sm text-muted-foreground">
                    Predict campaign success before you invest
                  </p>
                </Card>
                
                <Card className="text-center p-6">
                  <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Fraud Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Identify fake followers and engagement automatically
                  </p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluencerManagerDashboard;