
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFollow } from "@/hooks/useFollow";
import { useTrendingHashtags } from "@/hooks/useTrendingHashtags";

interface TrendingWidgetProps {
  onHashtagClick?: (hashtag: string) => void;
}

const TrendingWidget = ({ onHashtagClick }: TrendingWidgetProps) => {
  const navigate = useNavigate();
  const { followUser, loading: followLoading } = useFollow();
  const { hashtags, loading: hashtagsLoading } = useTrendingHashtags();

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const trends = hashtags.map(h => ({
    topic: h.hashtag,
    tweets: formatCount(h.count),
    growth: h.growth || '+0%',
    category: h.category || 'Faith'
  }));

  const handleTrendClick = (trend: string) => {
    console.log('Trending hashtag clicked:', trend);
    if (onHashtagClick) {
      onHashtagClick(trend);
    } else {
      // Navigate to hashtag page - remove # symbol for URL
      const hashtagName = trend.replace('#', '');
      navigate(`/hashtag/${hashtagName}`);
    }
  };

  const handleUserClick = (userId: string) => {
    console.log('User profile clicked:', userId);
    navigate(`/profile/${userId}`);
  };

  const handleFollowClick = async (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Follow button clicked:', userId);
    try {
      await followUser(userId);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Faith: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      Prayer: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      Study: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      Worship: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
      Love: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      Music: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      Community: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
      Journey: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
      Family: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      Testimony: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
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
            Trending in Faith
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {hashtagsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-4 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : trends.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No trending hashtags yet</p>
          ) : (
            trends.slice(0, 5).map((trend, index) => (
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
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">{trend.growth}</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {trend.topic}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{trend.tweets} Posts</p>
                </div>
              </div>
            </div>
            ))
          )}
          
          <Button
            variant="ghost" 
            className="w-full text-purple-600 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => navigate('/explore')}
          >
            Show more trends
          </Button>
        </CardContent>
      </Card>

      {/* Network Stats */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">892K</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Believers connected</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">24.7K</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Posts today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingWidget;
