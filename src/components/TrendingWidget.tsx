
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
    <div className="space-y-6">
      {/* Trending */}
      <Card className="bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 border-pink-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-gray-900 dark:text-gray-100">
            <TrendingUp className="w-5 h-5 mr-3 text-pink-600 dark:text-pink-400" />
            What's happening
            <Sparkles className="w-4 h-4 ml-auto text-purple-500 dark:text-purple-400 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trends.map((trend, index) => (
            <div 
              key={index} 
              className="hover:bg-white/70 dark:hover:bg-gray-700/50 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-sm group hover:scale-[1.02]"
              onClick={() => handleTrendClick(trend.topic)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`text-xs font-medium ${getCategoryColor(trend.category)}`}>
                      {trend.category}
                    </Badge>
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">{trend.growth}</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-pink-700 dark:group-hover:text-pink-400 transition-colors text-lg">
                    {trend.topic}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{trend.tweets} Posts</p>
                </div>
                <div className="text-right opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                  <TrendingUp className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-all duration-200 rounded-xl font-medium"
          >
            Show more trends
          </Button>
        </CardContent>
      </Card>

      {/* Who to Follow */}
      <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 border-purple-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-gray-900 dark:text-gray-100">
            <Users className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
            Who to follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {whoToFollow.map((user, index) => (
            <div key={index} className="flex items-start justify-between p-3 hover:bg-white/70 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300 group hover:scale-[1.02]">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">{user.name}</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{user.handle}</p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs">{user.description}</p>
                  <p className="text-gray-400 dark:text-gray-600 text-xs">{user.followers} followers</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-pink-300 dark:border-purple-500 text-pink-600 dark:text-purple-400 hover:bg-pink-50 dark:hover:bg-purple-900/20 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md rounded-full font-medium"
              >
                Follow
              </Button>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-200 rounded-xl font-medium"
          >
            Show more suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-pink-300 dark:border-gray-600 overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">2.1M</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Active users</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">15.6K</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Posts today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingWidget;
