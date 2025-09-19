import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  TrendingUp, 
  MessageSquare, 
  AlertTriangle,
  Heart,
  Users,
  Globe,
  Filter,
  Bell,
  Star,
  ThumbsUp,
  ThumbsDown,
  Zap
} from 'lucide-react';

const mockMentions = [
  {
    id: 1,
    content: "Just tried @yourapp and it's amazing! The UI is so clean and intuitive. Highly recommend! 🔥",
    author: "@techreviewer",
    platform: "Twitter",
    sentiment: "positive",
    engagement: 156,
    timestamp: "2 hours ago",
    verified: true
  },
  {
    id: 2,
    content: "Has anyone else experienced issues with @yourapp login? Been trying for an hour...",
    author: "@frustrated_user",
    platform: "Twitter",
    sentiment: "negative",
    engagement: 23,
    timestamp: "4 hours ago",
    verified: false
  },
  {
    id: 3,
    content: "The new features in @yourapp are incredible! The team really listens to user feedback.",
    author: "@happycustomer",
    platform: "LinkedIn",
    sentiment: "positive",
    engagement: 89,
    timestamp: "6 hours ago",
    verified: true
  },
  {
    id: 4,
    content: "Thinking about switching to @yourapp from my current solution. Anyone have experience?",
    author: "@potential_user",
    platform: "Reddit",
    sentiment: "neutral",
    engagement: 45,
    timestamp: "8 hours ago",
    verified: false
  }
];

const mockTrends = [
  { keyword: "#socialnetwork", volume: 15420, growth: 12.5, sentiment: "positive" },
  { keyword: "#userexperience", volume: 8930, growth: -2.1, sentiment: "neutral" },
  { keyword: "#appreview", volume: 6450, growth: 34.2, sentiment: "positive" },
  { keyword: "#techstartup", volume: 4230, growth: 8.7, sentiment: "positive" }
];

const SocialListeningDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [filteredMentions, setFilteredMentions] = useState(mockMentions);

  useEffect(() => {
    let filtered = mockMentions.filter(mention => {
      const matchesSearch = mention.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mention.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = selectedPlatform === 'all' || mention.platform.toLowerCase() === selectedPlatform;
      const matchesSentiment = sentimentFilter === 'all' || mention.sentiment === sentimentFilter;
      
      return matchesSearch && matchesPlatform && matchesSentiment;
    });
    
    setFilteredMentions(filtered);
  }, [searchTerm, selectedPlatform, sentimentFilter]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4" />;
      case 'negative': return <ThumbsDown className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const sentimentStats = {
    positive: mockMentions.filter(m => m.sentiment === 'positive').length,
    negative: mockMentions.filter(m => m.sentiment === 'negative').length,
    neutral: mockMentions.filter(m => m.sentiment === 'neutral').length
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Social Listening
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor what people are saying about your brand across social platforms
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <Zap className="w-4 h-4 mr-1" />
          Premium Feature
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Mentions</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {mockMentions.length}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% today
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Positive</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {sentimentStats.positive}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {Math.round((sentimentStats.positive / mockMentions.length) * 100)}% of total
                </p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Negative</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {sentimentStats.negative}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {Math.round((sentimentStats.negative / mockMentions.length) * 100)}% of total
                </p>
              </div>
              <ThumbsDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Reach</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {(mockMentions.reduce((acc, m) => acc + m.engagement, 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Total engagement</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mentions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="trends">Trending Topics</TabsTrigger>
          <TabsTrigger value="alerts">Smart Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="mentions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search mentions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiment</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Mentions List */}
          <div className="space-y-4">
            {filteredMentions.map((mention) => (
              <Card key={mention.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{mention.author}</span>
                        {mention.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {mention.platform}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{mention.timestamp}</span>
                    </div>
                    <Badge className={`text-xs ${getSentimentColor(mention.sentiment)}`}>
                      {getSentimentIcon(mention.sentiment)}
                      <span className="ml-1 capitalize">{mention.sentiment}</span>
                    </Badge>
                  </div>
                  
                  <p className="text-foreground mb-3 leading-relaxed">{mention.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {mention.engagement} engagement
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bell className="w-4 h-4 mr-1" />
                        Follow
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTrends.map((trend, index) => (
                  <div key={trend.keyword} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg font-mono">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-semibold text-lg">{trend.keyword}</p>
                        <p className="text-sm text-muted-foreground">
                          {trend.volume.toLocaleString()} mentions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getSentimentColor(trend.sentiment)}>
                        {getSentimentIcon(trend.sentiment)}
                        <span className="ml-1 capitalize">{trend.sentiment}</span>
                      </Badge>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${trend.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.growth > 0 ? '+' : ''}{trend.growth}%
                        </p>
                        <p className="text-xs text-muted-foreground">24h change</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Smart Alert Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Negative Sentiment Spike</p>
                      <p className="text-sm text-muted-foreground">Alert when negative mentions increase by 50%</p>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Bell className="w-4 h-4 mr-1" />
                      Active
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Viral Content Detection</p>
                      <p className="text-sm text-muted-foreground">Alert when content reaches 1K+ engagement</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4 mr-1" />
                      Setup
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Competitor Mentions</p>
                      <p className="text-sm text-muted-foreground">Track when competitors are mentioned</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Bell className="w-4 h-4 mr-1" />
                      Setup
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Influencer Mentions</p>
                      <p className="text-sm text-muted-foreground">Alert when influencers mention your brand</p>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <Bell className="w-4 h-4 mr-1" />
                      Active
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Recent alerts will appear here to help you respond quickly to important mentions and trends.
                </p>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">Alert Triggered</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Negative sentiment spike detected: 3 negative mentions in the last hour (usual: 0.5/hour)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialListeningDashboard;