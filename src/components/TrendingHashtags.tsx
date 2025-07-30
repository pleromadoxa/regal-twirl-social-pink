import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TrendingHashtagData {
  hashtag: string;
  count: number;
  growth: number;
}

const TrendingHashtags = () => {
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtagData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      // Fetch recent posts to analyze hashtags
      const { data: posts } = await supabase
        .from('posts')
        .select('content, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (posts) {
        const hashtagCounts: { [key: string]: number } = {};
        
        posts.forEach(post => {
          const hashtags = post.content.match(/#\w+/g) || [];
          hashtags.forEach(hashtag => {
            const cleanHashtag = hashtag.toLowerCase();
            hashtagCounts[cleanHashtag] = (hashtagCounts[cleanHashtag] || 0) + 1;
          });
        });

        const trending = Object.entries(hashtagCounts)
          .map(([hashtag, count]) => ({
            hashtag,
            count,
            growth: Math.floor(Math.random() * 50) + 10 // Mock growth percentage
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTrendingHashtags(trending);
      }
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      // Fallback to default hashtags
      setTrendingHashtags([
        { hashtag: '#faith', count: 245, growth: 23 },
        { hashtag: '#community', count: 189, growth: 18 },
        { hashtag: '#prayer', count: 156, growth: 15 },
        { hashtag: '#inspiration', count: 134, growth: 12 },
        { hashtag: '#christian', count: 123, growth: 28 },
        { hashtag: '#bible', count: 98, growth: 8 },
        { hashtag: '#worship', count: 87, growth: 22 },
        { hashtag: '#blessed', count: 76, growth: 16 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    console.log('Trending hashtag clicked:', hashtag);
    navigate(`/search?hashtag=${hashtag.replace('#', '')}`);
  };

  if (loading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-purple-100 dark:bg-purple-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Trending Hashtags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingHashtags.map((item, index) => (
            <div 
              key={item.hashtag}
              onClick={() => handleHashtagClick(item.hashtag)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-purple-600" />
                    <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {item.hashtag.replace('#', '')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.count.toLocaleString()} posts
                  </p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                +{item.growth}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingHashtags;