
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useFinancialNews } from '@/hooks/useFinancialNews';

export const FinancialNewsFeed = () => {
  const { news, loading, refetch } = useFinancialNews();

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (isNaN(diffInHours)) return 'Recently';
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      return `${Math.floor(diffInHours / 24)}d ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'bullish':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
      case 'bearish':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading && news.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Financial News
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Latest market updates from Google News
          </p>
        </div>
        <Button
          onClick={refetch}
          disabled={loading}
          variant="outline"
          size="sm"
          className="border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-600 dark:hover:bg-purple-900/20"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {news.length === 0 && !loading ? (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Financial News Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              We're currently unable to fetch financial news. This might be due to network issues or API limitations.
            </p>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {news.map((article, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2 text-sm">
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {article.source}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{formatTimeAgo(article.pubDate)}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline"
                      className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                    >
                      {article.category}
                    </Badge>
                    <Badge 
                      className={getSentimentColor(article.sentiment)}
                    >
                      {article.sentiment}
                    </Badge>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 transition-all duration-200"
                    onClick={() => window.open(article.link, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {news.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            News updates every 5 hours • Powered by Google News
          </p>
        </div>
      )}
    </div>
  );
};
