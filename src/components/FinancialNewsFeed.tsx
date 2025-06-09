
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useFinancialNews } from '@/hooks/useFinancialNews';

export const FinancialNewsFeed = () => {
  const { news, loading, refetch } = useFinancialNews();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading && news.length === 0) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                    <span>{formatTimeAgo(article.pubDate)}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                {article.description}
              </p>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {article.category}
                  </Badge>
                  <Badge variant="secondary">
                    {article.sentiment}
                  </Badge>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-600 hover:text-purple-700"
                  onClick={() => window.open(article.link, '_blank')}
                >
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
