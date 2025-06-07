
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchFinancialNews, NewsArticle } from '@/services/financialNewsService';
import { useToast } from '@/hooks/use-toast';

export const FinancialNewsFeed = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const newsData = await fetchFinancialNews();
        setNews(newsData.slice(0, 10)); // Show top 10 articles
      } catch (error) {
        console.error('Error loading financial news:', error);
        toast({
          title: "Error",
          description: "Failed to load financial news",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [toast]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'bearish':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimeAgo = (timeString: string) => {
    const date = new Date(
      timeString.substring(0, 4) + '-' +
      timeString.substring(4, 6) + '-' +
      timeString.substring(6, 8) + 'T' +
      timeString.substring(9, 11) + ':' +
      timeString.substring(11, 13) + ':' +
      timeString.substring(13, 15)
    );
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Financial News
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Latest market updates and financial insights
        </p>
      </div>

      {news.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No financial news available at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        news.map((article, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight text-gray-900 dark:text-gray-100">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(article.time_published)}</span>
                    {getSentimentIcon(article.overall_sentiment_label)}
                  </CardDescription>
                </div>
                {article.banner_image && (
                  <img
                    src={article.banner_image}
                    alt=""
                    className="w-20 h-16 object-cover rounded-lg"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getSentimentColor(article.overall_sentiment_label)}>
                    {article.overall_sentiment_label}
                  </Badge>
                  {article.topics.slice(0, 2).map((topic, topicIndex) => (
                    <Badge key={topicIndex} variant="outline">
                      {topic.topic}
                    </Badge>
                  ))}
                </div>
                
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Read More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
