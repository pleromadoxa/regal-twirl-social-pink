import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const TrendingWidget = () => {
  const trends = [
    { topic: "#WebDevelopment", tweets: "125K Tweets" },
    { topic: "#React", tweets: "89K Tweets" },
    { topic: "#TechTrends", tweets: "67K Tweets" },
    { topic: "#Design", tweets: "45K Tweets" },
    { topic: "#Innovation", tweets: "32K Tweets" },
  ];

  const whoToFollow = [
    { name: "Emma Watson", handle: "@EmmaWatson", avatar: "/placeholder.svg" },
    { name: "Tech Insider", handle: "@TechInsider", avatar: "/placeholder.svg" },
    { name: "Design Daily", handle: "@DesignDaily", avatar: "/placeholder.svg" },
  ];

  return (
    <div className="space-y-4">
      {/* Trending */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-pink-600" />
            What's happening
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trends.map((trend, index) => (
            <div key={index} className="hover:bg-white/50 p-2 rounded cursor-pointer transition-colors">
              <p className="font-semibold text-gray-900">{trend.topic}</p>
              <p className="text-sm text-gray-600">{trend.tweets}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Who to Follow */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {whoToFollow.map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-gray-600 text-sm">{user.handle}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
                Follow
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingWidget;
