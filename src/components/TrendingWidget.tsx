
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrendingWidgetProps {
  onHashtagClick?: (hashtag: string) => void;
}

const TrendingWidget = ({ onHashtagClick }: TrendingWidgetProps) => {
  const navigate = useNavigate();

  const trends = [
    { topic: "#ChristianLife", tweets: "125K", growth: "+12%", category: "Faith" },
    { topic: "#Prayer", tweets: "89K", growth: "+8%", category: "Spiritual" },
    { topic: "#BibleStudy", tweets: "67K", growth: "+15%", category: "Scripture" },
    { topic: "#Faith", tweets: "45K", growth: "+5%", category: "Spiritual" },
    { topic: "#Worship", tweets: "32K", growth: "+20%", category: "Praise" },
  ];

  const whoToFollow = [
    { 
      name: "Pastor John", 
      handle: "@PastorJohn", 
      followers: "12.5K",
      isVerified: true,
      description: "Senior Pastor & Teacher",
      userId: "pastor-john-id"
    },
    { 
      name: "Christian Daily", 
      handle: "@ChristianDaily", 
      followers: "8.1K",
      isVerified: true,
      description: "Daily inspiration",
      userId: "christian-daily-id"
    },
    { 
      name: "Bible Verses", 
      handle: "@BibleVerses", 
      followers: "15.2K",
      isVerified: false,
      description: "Scripture & meditation",
      userId: "bible-verses-id"
    },
  ];

  const handleTrendClick = (trend: string) => {
    if (onHashtagClick) {
      onHashtagClick(trend);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Faith: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      Spiritual: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      Scripture: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      Praise: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300"
    };
    return colors[category as keyof typeof colors] || "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
  };

  return (
    <div className="space-y-6">
      {/* Trending */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-slate-900 dark:text-slate-100">
            <TrendingUp className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
            What's happening
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trends.map((trend, index) => (
            <div 
              key={index} 
              className="hover:bg-slate-50 dark:hover:bg-slate-700 p-4 rounded-xl cursor-pointer transition-all duration-200 group"
              onClick={() => handleTrendClick(trend.topic)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`text-xs font-medium ${getCategoryColor(trend.category)}`}>
                      {trend.category}
                    </Badge>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{trend.growth}</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {trend.topic}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{trend.tweets} Posts</p>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Show more trends
          </Button>
        </CardContent>
      </Card>

      {/* Who to Follow */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-slate-900 dark:text-slate-100">
            <Users className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
            Who to follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {whoToFollow.map((user, index) => (
            <div key={index} className="flex items-start justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
              <div 
                className="flex items-center space-x-3 flex-1 cursor-pointer"
                onClick={() => handleUserClick(user.userId)}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
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
                className="border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Follow
              </Button>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Show more suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">2.1M</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Active users</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">15.6K</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Posts today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingWidget;
