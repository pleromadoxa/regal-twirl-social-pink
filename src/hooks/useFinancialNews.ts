
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  sentiment: string;
  category: string;
}

export const useFinancialNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('financial-news');

      if (error) {
        console.error('Error fetching financial news:', error);
        toast({
          title: "Error",
          description: "Failed to fetch financial news",
          variant: "destructive"
        });
        return;
      }

      setNews(data.articles || []);
    } catch (error) {
      console.error('Error in fetchNews:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh news every 15 minutes
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    news,
    loading,
    refetch: fetchNews
  };
};
