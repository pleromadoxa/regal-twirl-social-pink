
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
      Technology: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
      Programming: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      Creative: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
      Business: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
    };
    return colors[category as keyof typeof colors] || "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
  };

  return (
    <div className="space-y-6">
      {/* Trending */}
      <Card className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-slate-900 dark:text-slate-100">
            <TrendingUp className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
            What's happening
            <Sparkles className="w-4 h-4 ml-auto text-emerald-500 dark:text-emerald-400 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trends.map((trend, index) => (
            <div 
              key={index} 
              className="hover:bg-white/80 dark:hover:bg-slate-700/60 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-sm group hover:scale-[1.02] border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              onClick={() => handleTrendClick(trend.topic)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`text-xs font-medium ${getCategoryColor(trend.category)}`}>
                      {trend.category}
                    </Badge>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{trend.growth}</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors text-lg">
                    {trend.topic}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{trend.tweets} Posts</p>
                </div>
                <div className="text-right opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                  <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all duration-200 rounded-xl font-medium"
          >
            Show more trends
          </Button>
        </CardContent>
      </Card>

      {/* Who to Follow */}
      <Card className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950 border-emerald-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-slate-900 dark:text-slate-100">
            <Users className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-400" />
            Who to follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {whoToFollow.map((user, index) => (
            <div key={index} className="flex items-start justify-between p-3 hover:bg-white/80 dark:hover:bg-slate-700/60 rounded-xl transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-emerald-500 to-slate-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{user.name}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{user.handle}</p>
                  <p className="text-slate-500 dark:text-slate-500 text-xs">{user.description}</p>
                  <p className="text-slate-400 dark:text-slate-600 text-xs">{user.followers} followers</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-emerald-300 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md rounded-full font-medium"
              >
                Follow
              </Button>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all duration-200 rounded-xl font-medium"
          >
            Show more suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-slate-100 via-indigo-100 to-emerald-100 dark:from-slate-800 dark:via-indigo-900 dark:to-emerald-900 border-slate-300 dark:border-slate-600 overflow-hidden shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">2.1M</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Active users</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-slate-600 bg-clip-text text-transparent">15.6K</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Posts today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingWidget;
