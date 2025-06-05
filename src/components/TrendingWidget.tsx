
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Sparkles } from "lucide-react";

interface TrendingWidgetProps {
  onHashtagClick?: (hashtag: string) => void;
}

const TrendingWidget = ({ onHashtagClick }: TrendingWidgetProps) => {
  const trends = [
    { topic: "#WebDevelopment", tweets: "125K", growth: "+12%", category: "Technology" },
    { topic: "#React", tweets: "89K", growth: "+8%", category: "Programming" },
    { topic: "#TechTrends", tweets: "67K", growth: "+15%", category: "Technology" },
    { topic: "#Design", tweets: "45K", growth: "+5%", category: "Creative" },
    { topic: "#Innovation", tweets: "32K", growth: "+20%", category: "Business" },
  ];

  const whoToFollow = [
    { 
      name: "Emma Watson", 
      handle: "@EmmaWatson", 
      followers: "12.5M",
      isVerified: true,
      description: "Actress & Activist"
    },
    { 
      name: "Tech Insider", 
      handle: "@TechInsider", 
      followers: "2.1M",
      isVerified: true,
      description: "Latest in technology"
    },
    { 
      name: "Design Daily", 
      handle: "@DesignDaily", 
      followers: "890K",
      isVerified: false,
      description: "Daily design inspiration"
    },
  ];

  const handleTrendClick = (trend: string) => {
    if (onHashtagClick) {
      onHashtagClick(trend);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-700",
      Programming: "bg-green-100 text-green-700",
      Creative: "bg-purple-100 text-purple-700",
      Business: "bg-orange-100 text-orange-700"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4">
      {/* Trending */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-pink-600" />
            What's happening
            <Sparkles className="w-4 h-4 ml-auto text-purple-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trends.map((trend, index) => (
            <div 
              key={index} 
              className="hover:bg-white/50 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md group"
              onClick={() => handleTrendClick(trend.topic)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={`text-xs ${getCategoryColor(trend.category)}`}>
                      {trend.category}
                    </Badge>
                    <span className="text-xs text-green-600 font-medium">{trend.growth}</span>
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-pink-700 transition-colors">
                    {trend.topic}
                  </p>
                  <p className="text-sm text-gray-600">{trend.tweets} Tweets</p>
                </div>
                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-pink-600 hover:bg-pink-100 transition-all duration-200"
          >
            Show more trends
          </Button>
        </CardContent>
      </Card>

      {/* Who to Follow */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Who to follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {whoToFollow.map((user, index) => (
            <div key={index} className="flex items-start justify-between p-2 hover:bg-white/50 rounded-lg transition-all duration-300 group">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                  </div>
                  <p className="text-gray-600 text-sm">{user.handle}</p>
                  <p className="text-gray-500 text-xs">{user.description}</p>
                  <p className="text-gray-400 text-xs">{user.followers} followers</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-pink-300 text-pink-600 hover:bg-pink-50 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
              >
                Follow
              </Button>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-purple-600 hover:bg-purple-100 transition-all duration-200"
          >
            Show more suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-pink-600">2.1M</p>
              <p className="text-xs text-gray-600">Active users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">15.6K</p>
              <p className="text-xs text-gray-600">Tweets today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingWidget;
