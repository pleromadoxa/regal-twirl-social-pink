
import { useFinancialNews } from '@/hooks/useFinancialNews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const FinancialNewsFeed = () => {
  const { news, loading, refetch, lastUpdated } = useFinancialNews();

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      technology: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      crypto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      stocks: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      economy: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (loading && news.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Financial News</h2>
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Financial News</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
          )}
        </div>
        <Button
          onClick={refetch}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {news.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No news available</h3>
              <p className="text-sm">
                Financial news will appear here. Try refreshing to load the latest updates.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {news.map((article, index) => (
            <Card key={`${article.link}-${index}`} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="line-clamp-2"
                      >
                        {article.title}
                      </a>
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {article.source}
                      </Badge>
                      {article.category && (
                        <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </Badge>
                      )}
                      {article.sentiment && (
                        <Badge className={`text-xs ${getSentimentColor(article.sentiment)} flex items-center gap-1`}>
                          {getSentimentIcon(article.sentiment)}
                          {article.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
                    </span>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </CardHeader>
              {article.description && (
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {article.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {loading && news.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Refreshing news...
          </div>
        </div>
      )}
    </div>
  );
};
