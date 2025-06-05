
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
      Technology: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      Programming: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      Creative: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
      Business: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
    };
    return colors[category as keyof typeof colors] || "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
  };

  return (
    <div className="space-y-6">
      {/* Trending */}
      <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-900 dark:via-slate-800 dark:to-pink-950 border-purple-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-sm hover:scale-105">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-slate-900 dark:text-slate-100">
            <TrendingUp className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400 animate-pulse" />
            What's happening
            <Sparkles className="w-4 h-4 ml-auto text-pink-500 dark:text-pink-400 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trends.map((trend, index) => (
            <div 
              key={index} 
              className="hover:bg-white/80 dark:hover:bg-purple-800/60 p-4 rounded-xl cursor-pointer transition-all duration-500 hover:shadow-lg group hover:scale-105 border border-transparent hover:border-purple-200 dark:hover:border-purple-600 hover:-translate-y-1"
              onClick={() => handleTrendClick(trend.topic)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`text-xs font-medium animate-pulse ${getCategoryColor(trend.category)}`}>
                      {trend.category}
                    </Badge>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full animate-bounce">{trend.growth}</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors text-lg">
                    {trend.topic}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{trend.tweets} Posts</p>
                </div>
                <div className="text-right opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-125 group-hover:rotate-12">
                  <TrendingUp className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all duration-300 rounded-xl font-medium hover:scale-105"
          >
            Show more trends
          </Button>
        </CardContent>
      </Card>

      {/* Who to Follow */}
      <Card className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900 dark:via-slate-800 dark:to-purple-950 border-blue-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-slate-900 dark:text-slate-100">
            <Users className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 animate-pulse" />
            Who to follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {whoToFollow.map((user, index) => (
            <div key={index} className="flex items-start justify-between p-3 hover:bg-white/80 dark:hover:bg-purple-700/60 rounded-xl transition-all duration-500 group hover:scale-105 border border-transparent hover:border-blue-200 dark:hover:border-purple-600 hover:shadow-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative group-hover:scale-110 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg animate-pulse">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 animate-bounce">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">{user.name}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{user.handle}</p>
                  <p className="text-slate-500 dark:text-slate-500 text-xs">{user.description}</p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs">{user.followers} followers</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-blue-300 dark:border-purple-500 text-blue-600 dark:text-purple-400 hover:bg-blue-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl rounded-full font-medium"
              >
                Follow
              </Button>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-blue-600 dark:text-purple-400 hover:bg-blue-100 dark:hover:bg-purple-900/20 transition-all duration-300 rounded-xl font-medium hover:scale-105"
          >
            Show more suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 dark:from-purple-900 dark:via-blue-900 dark:to-pink-900 border-purple-300 dark:border-purple-600 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="space-y-1 group hover:scale-110 transition-transform duration-300">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">2.1M</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Active users</p>
            </div>
            <div className="space-y-1 group hover:scale-110 transition-transform duration-300">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent animate-pulse">15.6K</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Posts today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingWidget;
